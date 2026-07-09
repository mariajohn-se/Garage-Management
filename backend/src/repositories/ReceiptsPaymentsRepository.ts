import { queryView, queryViewPaginated, callProcedure } from '../db/callProcedure';
import {
  PartyBill,
  BillAllocation,
  DiscountAuditRow,
  CustomerOutstandingRow,
  SupplierOutstandingRow
} from '../models/ReceiptsPayments';

/**
 * VERIFIED against the live database: CustBill01Sql (36636 rows) is a single combined
 * customer-and-supplier bill/receipt subledger (a CUSTOMER/SUPPLIER flag column distinguishes
 * the two) - the spec's separate "Receipts" (CustBill01/02) and "Payments" (SuppBill01/02)
 * entities do not exist as separate tables; SuppBill01/SuppBill02 were confirmed absent from
 * the schema entirely via INFORMATION_SCHEMA.TABLES. CustBill02 (36142 rows) is the matching
 * receipt/payment allocation detail. SPDISCOUNTSUMMARY (a real, undocumented stored procedure,
 * verified live with 764 real rows for 2011) is the real backing for Discount History Audit.
 * No PettyCash, PDC issue/receipt voucher, Deposit Certificate, Discharge Receipt, or
 * PendingPayables table/view/procedure exists anywhere under any name tried.
 */

interface PartyBillRow {
  ID: number;
  CustID: string | null;
  Vsrl: string | null;
  Bill: string | null;
  Date: string | null;
  Amount: number | null;
  RefNo: string | null;
  Currency: string | null;
  AcName: string | null;
  CUSTOMER: number | null;
  SUPPLIER: number | null;
  totRcpt: number | null;
  BalAmt: number | null;
}

function toPartyBill(row: PartyBillRow): PartyBill {
  const balance = row.BalAmt ?? 0;
  const amount = row.Amount ?? 0;
  const status: PartyBill['status'] = balance <= 0 ? 'Paid' : balance < amount ? 'Partial' : 'Outstanding';
  return {
    id: row.ID,
    custId: row.CustID,
    vsrl: row.Vsrl,
    bill: row.Bill,
    date: row.Date,
    amount: row.Amount,
    refNo: row.RefNo,
    currency: row.Currency,
    accountName: row.AcName,
    isCustomer: !!row.CUSTOMER,
    isSupplier: !!row.SUPPLIER,
    totalReceived: row.totRcpt,
    balance: row.BalAmt,
    status
  };
}

const BILL_COLUMNS =
  'ID, CustID, Vsrl, Bill, Date, Amount, RefNo, Currency, AcName, CUSTOMER, SUPPLIER, totRcpt, BalAmt';

export class ReceiptsPaymentsRepository {
  async listBills(filters: {
    party: 'customer' | 'supplier';
    search?: string;
    status?: 'paid' | 'outstanding';
    page: number;
    limit: number;
  }): Promise<{ items: PartyBill[]; total: number }> {
    const conditions = [filters.party === 'customer' ? 'CUSTOMER = 1' : 'SUPPLIER = 1'];
    const params: Record<string, unknown> = {};
    if (filters.search) {
      conditions.push('(AcName LIKE @search OR Bill LIKE @search OR CustID LIKE @search)');
      params.search = `%${filters.search}%`;
    }
    if (filters.status === 'paid') conditions.push('BalAmt <= 0');
    if (filters.status === 'outstanding') conditions.push('BalAmt > 0');
    const where = `WHERE ${conditions.join(' AND ')}`;

    const totalRows = await queryView<{ cnt: number }>(`SELECT COUNT(*) AS cnt FROM CustBill01Sql ${where}`, params);
    const rows = await queryViewPaginated<PartyBillRow>(
      BILL_COLUMNS,
      'CustBill01Sql',
      where,
      'Date DESC',
      params,
      filters.page,
      filters.limit
    );
    return { items: rows.map(toPartyBill), total: totalRows[0]?.cnt ?? 0 };
  }

  async getBillAllocations(bill: string): Promise<BillAllocation[]> {
    const rows = await queryView<{
      ID: number;
      CustID: string | null;
      RefNo: string | null;
      Vsrl: string | null;
      Bill: string | null;
      Date: string | null;
      RcptAmt: number | null;
      LinkID: number | null;
    }>('SELECT ID, CustID, RefNo, Vsrl, Bill, Date, RcptAmt, LinkID FROM CustBill02 WHERE Bill = @bill ORDER BY Date', {
      bill
    });
    return rows.map((r) => ({
      id: r.ID,
      custId: r.CustID,
      refNo: r.RefNo,
      vsrl: r.Vsrl,
      bill: r.Bill,
      date: r.Date,
      receiptAmount: r.RcptAmt,
      linkId: r.LinkID
    }));
  }

  /** Real, undocumented SP - found via INFORMATION_SCHEMA.ROUTINES, verified live (764 rows for 2011). */
  async discountHistory(fromDate: string, toDate: string, maxDiscount = 0): Promise<DiscountAuditRow[]> {
    const rows = await callProcedure<{
      BILL: string | null;
      BILLDT: string | null;
      CUSTNAME: string | null;
      INVAMT: number | null;
      DISCOUNT: number | null;
      NETT: number | null;
      STAFFNAME: string | null;
    }>('SPDISCOUNTSUMMARY', { FROMDATE: fromDate, TODATE: toDate, MAXDISC: maxDiscount });
    return rows.map((r) => ({
      bill: r.BILL,
      billDate: r.BILLDT,
      customerName: r.CUSTNAME,
      invoiceAmount: r.INVAMT,
      discount: r.DISCOUNT,
      net: r.NETT,
      staffName: r.STAFFNAME
    }));
  }

  /** Real, undocumented SP - found via INFORMATION_SCHEMA.ROUTINES, verified live (159 rows). */
  async customerOutstandingBySalesperson(date: string): Promise<CustomerOutstandingRow[]> {
    const rows = await callProcedure<{
      CustID: string | null;
      Bill: string | null;
      Date: string | null;
      Amount: number | null;
      BalAmt: number | null;
      AcName: string | null;
      Phone1: string | null;
      Ordr: string | null;
      SalesMan: string | null;
      'age in days': number | null;
    }>('spCustomerOutStandingSalesManwise', { Date: date });
    return rows.map((r) => ({
      custId: r.CustID,
      bill: r.Bill,
      date: r.Date,
      amount: r.Amount,
      balance: r.BalAmt,
      accountName: r.AcName,
      phone: r.Phone1,
      order: r.Ordr,
      salesMan: r.SalesMan,
      ageInDays: r['age in days']
    }));
  }

  /** Real, undocumented SP, no parameters - found via INFORMATION_SCHEMA.ROUTINES, verified live (169 rows). */
  async supplierOutstandingSummary(): Promise<SupplierOutstandingRow[]> {
    const rows = await callProcedure<{
      SuppId: string;
      SuppName: string | null;
      Address: string | null;
      Phone1: string | null;
      Fax: string | null;
      DEBT: number | null;
      CRED: number | null;
      LedgerBal: number | null;
      PaidAmt: number | null;
      BillBal: number | null;
    }>('spSupplierOutStandingSummary');
    return rows.map((r) => ({
      suppId: r.SuppId,
      suppName: r.SuppName,
      address: r.Address,
      phone: r.Phone1,
      fax: r.Fax,
      debit: r.DEBT,
      credit: r.CRED,
      ledgerBalance: r.LedgerBal,
      paidAmount: r.PaidAmt,
      billBalance: r.BillBal
    }));
  }
}

export const receiptsPaymentsRepository = new ReceiptsPaymentsRepository();
