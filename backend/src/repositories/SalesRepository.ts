import { queryView, queryViewPaginated, callProcedure, executeWrite, withNextNumericId } from '../db/callProcedure';
import { DeliveryNote, SalesInvoice, Proforma } from '../models/Sales';

/**
 * VERIFIED against the live database: Delivery01Sql (42711 rows), Sales01Sql (23021 rows),
 * ProformaSales01Sql (372 rows) all exist with real data. SalesReturn01/SalesReturnBillSql do
 * NOT exist anywhere in the schema (`Invalid object name`) - the Sales Return module
 * (list/create/edit return bills) was not built since there is nothing to bind it to.
 */

interface DeliveryRow {
  ID: number;
  DONo: string | null;
  DODt: string | null;
  Ordr: string | null;
  custname: string | null;
  VehNo: string | null;
  Total: number | null;
  Nett: number | null;
  Remarks: string | null;
}

function toDelivery(row: DeliveryRow): DeliveryNote {
  return {
    id: row.ID,
    doNo: row.DONo,
    doDate: row.DODt,
    ordr: row.Ordr,
    customerName: row.custname,
    vehNo: row.VehNo,
    total: row.Total,
    net: row.Nett,
    remarks: row.Remarks
  };
}

interface SalesInvoiceRow {
  ID: number;
  Bill: string | null;
  BillDt: string | null;
  Ordr: string | null;
  custname: string | null;
  VehNo: string | null;
  Total: number | null;
  Nett: number | null;
  Delivered: number | null;
  paid: string | null;
}

function toInvoice(row: SalesInvoiceRow): SalesInvoice {
  return {
    id: row.ID,
    bill: row.Bill,
    billDate: row.BillDt,
    ordr: row.Ordr,
    customerName: row.custname,
    vehNo: row.VehNo,
    total: row.Total,
    net: row.Nett,
    delivered: !!row.Delivered,
    paid: row.paid
  };
}

interface ProformaRow {
  ID: number;
  Bill: string | null;
  BillDt: string | null;
  Ordr: string | null;
  CustName: string | null;
  VehNo: string | null;
  Total: number | null;
  Nett: number | null;
  VoucherType: string | null;
}

function toProforma(row: ProformaRow): Proforma {
  return {
    id: row.ID,
    bill: row.Bill,
    billDate: row.BillDt,
    ordr: row.Ordr,
    customerName: row.CustName,
    vehNo: row.VehNo,
    total: row.Total,
    net: row.Nett,
    voucherType: row.VoucherType
  };
}

export class SalesRepository {
  async listDeliveryNotes(filters: { ordr?: string; page: number; limit: number }): Promise<{
    items: DeliveryNote[];
    total: number;
  }> {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};
    if (filters.ordr) {
      conditions.push('Ordr = @ordr');
      params.ordr = filters.ordr;
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const columns = 'ID, DONo, DODt, Ordr, custname, VehNo, Total, Nett, Remarks';

    const totalRows = await queryView<{ cnt: number }>(`SELECT COUNT(*) AS cnt FROM Delivery01Sql ${where}`, params);
    const total = totalRows[0]?.cnt ?? 0;
    const rows = await queryViewPaginated<DeliveryRow>(
      columns,
      'Delivery01Sql',
      where,
      'ID DESC',
      params,
      filters.page,
      filters.limit
    );
    return { items: rows.map(toDelivery), total };
  }

  async listInvoices(filters: { customerName?: string; page: number; limit: number }): Promise<{
    items: SalesInvoice[];
    total: number;
  }> {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};
    if (filters.customerName) {
      conditions.push('custname LIKE @customerName');
      params.customerName = `%${filters.customerName}%`;
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const columns = 'ID, Bill, BillDt, Ordr, custname, VehNo, Total, Nett, Delivered, paid';

    const totalRows = await queryView<{ cnt: number }>(`SELECT COUNT(*) AS cnt FROM Sales01Sql ${where}`, params);
    const total = totalRows[0]?.cnt ?? 0;
    const rows = await queryViewPaginated<SalesInvoiceRow>(
      columns,
      'Sales01Sql',
      where,
      'ID DESC',
      params,
      filters.page,
      filters.limit
    );
    return { items: rows.map(toInvoice), total };
  }

  async listProformas(filters: { page: number; limit: number }): Promise<{ items: Proforma[]; total: number }> {
    const columns = 'ID, Bill, BillDt, Ordr, CustName, VehNo, Total, Nett, VoucherType';
    const totalRows = await queryView<{ cnt: number }>('SELECT COUNT(*) AS cnt FROM ProformaSales01Sql');
    const total = totalRows[0]?.cnt ?? 0;
    const rows = await queryViewPaginated<ProformaRow>(
      columns,
      'ProformaSales01Sql',
      '',
      'ID DESC',
      {},
      filters.page,
      filters.limit
    );
    return { items: rows.map(toProforma), total };
  }

  async findDeliveryNoteById(id: number): Promise<DeliveryNote | null> {
    const rows = await queryView<DeliveryRow>(
      `SELECT ID, DONo, DODt, Ordr, custname, VehNo, Total, Nett, Remarks FROM Delivery01Sql WHERE ID = @id`,
      { id }
    );
    return rows.length ? toDelivery(rows[0]) : null;
  }

  /**
   * VERIFIED FINDING (2026-07-08): DONo, like SalesOrdr01.Ordr, is NOT a Ccode+yr partitioned
   * number - `yr` is always '' in live data, and DONo/ID drift apart over decades with no fixed
   * formula (checked historically), meaning they're two independently-incrementing legacy
   * counters, not one derived from the other. Generated the same MAX+1 way as Customer/Supplier.
   * The "New Delivery Note" form collects no line items (header-only), so this creates only the
   * Delivery01 header row - it does not copy Delivery02 line items or touch Items.Stock, since
   * neither the UI nor any DB trigger (verified: none exist on Delivery01/02) drives that today.
   */
  async createDeliveryNote(
    input: { ordr: string; deliveredBy: string; remarks: string | null },
    custId: string | null,
    username: string
  ): Promise<string> {
    return withNextNumericId('Delivery01', 'ID', async (nextId, req) => {
      const maxDoNoResult = await req.query(
        `SELECT ISNULL(MAX(CASE WHEN DONo NOT LIKE '%[^0-9]%' THEN CAST(DONo AS INT) END), 0) AS maxDoNo
         FROM Delivery01 WITH (UPDLOCK, HOLDLOCK)`
      );
      const nextDoNo = String((maxDoNoResult.recordset[0]?.maxDoNo ?? 0) + 1);

      await req
        .input('ID', nextId)
        .input('DONo', nextDoNo)
        .input('Ordr', input.ordr)
        .input('CustId', custId)
        .input('Comments', input.deliveredBy)
        .input('Remarks', input.remarks)
        .input('User', username).query(`
          INSERT INTO Delivery01 (ID, Ccode, yr, DONo, DODt, Ordr, CustId, Comments, Remarks, [User])
          VALUES (@ID, '01', '', @DONo, GETDATE(), @Ordr, @CustId, @Comments, @Remarks, @User)
        `);
      return nextDoNo;
    });
  }

  async updateDeliveryNote(id: number, changes: { deliveredBy?: string; remarks?: string }): Promise<void> {
    const sets: string[] = [];
    const params: Record<string, unknown> = { id };
    if (changes.deliveredBy !== undefined) { sets.push('Comments = @deliveredBy'); params.deliveredBy = changes.deliveredBy; }
    if (changes.remarks !== undefined) { sets.push('Remarks = @remarks'); params.remarks = changes.remarks; }
    if (!sets.length) return;
    await executeWrite(`UPDATE Delivery01 SET ${sets.join(', ')} WHERE ID = @id`, params);
  }

  /** Real stored procedure (not in DB_CONNECTION_SPEC_v12.md's catalog, but confirmed to
   *  exist via INFORMATION_SCHEMA.ROUTINES and verified live to return real data). */
  async salesBillReport(fromDate: string, toDate: string): Promise<Record<string, unknown>[]> {
    return callProcedure('spSalesBillReport', { fromDate, toDate, option: 0 });
  }

  /** Real, documented SP (DB_CONNECTION_SPEC_v12.md) - verified live to return real data. */
  async salesMarginDetails(fromDt: string, toDt: string): Promise<Record<string, unknown>[]> {
    return callProcedure('spSalesMarginDetails', { fromDt, toDt, bill: '0' });
  }

  /**
   * VERIFIED (2026-07-08): two similarly-named real procedures exist - `SPSALESANALYSIS`
   * (`@DTFROM`/`@DTTO`) times out (15s+) against real data, but `SPSALESANALYSISREPORT`
   * (`@FROMDATE`/`@TODATE`, not in DB_CONNECTION_SPEC_v12.md's catalog) runs fine and returns
   * real per-bill rows (customer/vehicle/staff/paid amount) - 1135 rows for a 2011 date range.
   * Uses the working one; the timing-out one is left unused, same treatment as the collation-bug
   * procedures found in earlier phases.
   */
  async salesAnalysisReport(fromDate: string, toDate: string): Promise<Record<string, unknown>[]> {
    return callProcedure('SPSALESANALYSISREPORT', { FROMDATE: fromDate, TODATE: toDate });
  }

  /** Real, undocumented SP (`spMonthlySplitSales`) found via INFORMATION_SCHEMA.ROUTINES search
   *  for "Split" - verified live, returns real month/year/item-type sales split data. This is
   *  the genuine real analog to the spec's "Sales Report Section Wise"/"split-invoice-summary". */
  async monthlySplitSales(fromDate: string, toDate: string): Promise<Record<string, unknown>[]> {
    return callProcedure('spMonthlySplitSales', { fromDate, toDate });
  }
}

export const salesRepository = new SalesRepository();
