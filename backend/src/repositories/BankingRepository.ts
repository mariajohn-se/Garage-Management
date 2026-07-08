import mssql from 'mssql';
import { queryView, queryViewPaginated, callProcedure, executeWrite, withNextNumericId } from '../db/callProcedure';
import {
  VoucherListItem,
  VoucherLine,
  VoucherDetail,
  BankAccount,
  CashBankEntry,
  VoucherVerificationItem,
  AccountFilterItem,
  VoucherActionLogItem,
  ReceiptPaymentVoucherInput
} from '../models/Banking';

/**
 * VERIFIED against the live database: ACMASTERSQL (78826 rows, the resolved voucher header
 * view), ACMASTERDET/ACDETAILSDET (real, documented stored procedures for header/line detail),
 * SPCASHBANKDETAILS (real stored procedure - its own header comment documents the calling
 * convention `exec SPCASHBANKDETAILS 2,'2007-01-01','2007-01-31','All'`; TYPE must be a real
 * voucher type string like 'All'/'Receipt'/'Payment', not a boolean/flag), ACHEADSQL filtered
 * on BANK=1 (16 real bank/cash accounts), AcVerificationSP (a real, documented voucher
 * checked/unchecked-by-user procedure - the closest real analog in this schema to "bank
 * reconciliation"; the backing AcVerification table itself has 0 rows in production, i.e.
 * nothing has ever been marked verified through this workflow), VoucherList (a real, undocumented
 * stored procedure found via INFORMATION_SCHEMA.ROUTINES - date range + optional account filter
 * across all ledger entries, the true real analog to the spec's "acFilterFrm"/Account Filter),
 * and AccountsLog (a real, 44330-row base table - a genuine per-voucher Created/Edited audit
 * trail, the true real analog to the spec's "bank-recon-action-log").
 */

interface VoucherHeaderRow {
  ID: number;
  VSRL: string | null;
  DATE: string | null;
  VTYPE: string | null;
  PAYTYPE: string | null;
  NARRATION: string | null;
  REFNO: string | null;
  DESCRIPTION: string | null;
  CurBal: number | null;
  Checked: number | null;
}

function toVoucherListItem(row: VoucherHeaderRow): VoucherListItem {
  return {
    id: row.ID,
    vsrl: row.VSRL,
    date: row.DATE,
    vtype: row.VTYPE,
    payType: row.PAYTYPE,
    narration: row.NARRATION,
    refNo: row.REFNO,
    description: row.DESCRIPTION,
    curBal: row.CurBal,
    checked: !!row.Checked
  };
}

const VOUCHER_COLUMNS = 'ID, VSRL, DATE, VTYPE, PAYTYPE, NARRATION, REFNO, DESCRIPTION, CurBal, Checked';

interface VoucherLineRow {
  ID: number;
  VSRL: string | null;
  AC: string | null;
  DATE: string | null;
  DEBT: number | null;
  CRED: number | null;
  DESCRIPTION: string | null;
  NARRATION: string | null;
}

function toVoucherLine(row: VoucherLineRow): VoucherLine {
  return {
    id: row.ID,
    vsrl: row.VSRL,
    ac: row.AC,
    date: row.DATE,
    debit: row.DEBT,
    credit: row.CRED,
    description: row.DESCRIPTION,
    narration: row.NARRATION
  };
}

export class BankingRepository {
  async listVouchers(filters: {
    vtype?: string;
    payType?: string;
    page: number;
    limit: number;
  }): Promise<{ items: VoucherListItem[]; total: number }> {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};
    if (filters.vtype) {
      conditions.push('VTYPE = @vtype');
      params.vtype = filters.vtype;
    }
    if (filters.payType) {
      conditions.push('PAYTYPE = @payType');
      params.payType = filters.payType;
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const totalRows = await queryView<{ cnt: number }>(`SELECT COUNT(*) AS cnt FROM ACMASTERSQL ${where}`, params);
    const rows = await queryViewPaginated<VoucherHeaderRow>(
      VOUCHER_COLUMNS,
      'ACMASTERSQL',
      where,
      'ID DESC',
      params,
      filters.page,
      filters.limit
    );
    return { items: rows.map(toVoucherListItem), total: totalRows[0]?.cnt ?? 0 };
  }

  async getVoucher(id: number, vsrl: string): Promise<VoucherDetail | null> {
    const headerRows = await callProcedure<VoucherHeaderRow>('ACMASTERDET', { mID: id, mVsrl: vsrl });
    if (!headerRows.length) return null;
    const lineRows = await callProcedure<VoucherLineRow>('ACDETAILSDET', { mVsrl: vsrl, mAc: '' });
    return { ...toVoucherListItem(headerRows[0]), lines: lineRows.map(toVoucherLine) };
  }

  /** Real ACHEADSQL view filtered to bank/cash heads (BANK = 1), used for account pickers. */
  async listBankAccounts(): Promise<BankAccount[]> {
    const rows = await queryView<{ CODES: string; DESCRIPTION: string | null; BANKTYPE: number | null }>(
      'SELECT CODES, DESCRIPTION, BANKTYPE FROM ACHEADSQL WHERE BANK = 1 ORDER BY DESCRIPTION'
    );
    return rows.map((r) => ({ code: r.CODES, description: r.DESCRIPTION, bankType: r.BANKTYPE }));
  }

  /** Real SP: exec SPCASHBANKDETAILS <account>, '<fromDate>', '<toDate>', '<type>' (type='All' for no filter). */
  async cashBankDetails(account: string, fromDate: string, toDate: string, type = 'All'): Promise<CashBankEntry[]> {
    const rows = await callProcedure<{
      ID: number;
      VSRL: string | null;
      AC: string | null;
      DATE: string | null;
      DEBT: number | null;
      CRED: number | null;
      DESCRIPTION: string | null;
      VTYPE: string | null;
      CHQ: string | null;
      NARRATION: string | null;
      CurBal: number | null;
    }>('SPCASHBANKDETAILS', { ACCOUNT: account, FROMDATE: fromDate, TODATE: toDate, TYPE: type });
    return rows.map((r) => ({
      id: r.ID,
      vsrl: r.VSRL,
      ac: r.AC,
      date: r.DATE,
      debit: r.DEBT,
      credit: r.CRED,
      description: r.DESCRIPTION,
      vtype: r.VTYPE,
      chq: r.CHQ,
      narration: r.NARRATION,
      curBal: r.CurBal
    }));
  }

  /** Real SP: returns unverified (mChecked=0) or verified (mChecked=1) vouchers for a user. */
  async listVerification(userId: string, checked: boolean, payType?: string): Promise<VoucherVerificationItem[]> {
    const rows = await callProcedure<VoucherHeaderRow & { EditCount: number | null }>('AcVerificationSP', {
      mPType: payType ?? '',
      mUserID: userId,
      mChecked: checked ? 1 : 0
    });
    return rows.map((r) => ({
      id: r.ID,
      vsrl: r.VSRL,
      date: r.DATE,
      vtype: r.VTYPE,
      payType: r.PAYTYPE,
      description: r.DESCRIPTION,
      editCount: r.EditCount
    }));
  }

  /** AcVerification has no PK - a plain (UserID, Vsrl) marker row, no computation involved. */
  async markVerified(vsrl: string, userId: string): Promise<void> {
    await executeWrite('INSERT INTO AcVerification (UserID, Vsrl) VALUES (@userId, @vsrl)', { userId, vsrl });
  }

  /** Real SP: date range across all ledger entries, optionally filtered to one account. */
  async filterAccountEntries(dateFrom: string, dateTo: string, ac?: string): Promise<AccountFilterItem[]> {
    const rows = await callProcedure<{
      ID: number;
      VSRL: string | null;
      AC: string | null;
      DESCRIPTION: string | null;
      DATE: string | null;
      DEBT: number | null;
      CRED: number | null;
      VTYPE: string | null;
      NARRATION: string | null;
      REFNO: string | null;
    }>('VoucherList', { mDate1: dateFrom, mDate2: dateTo, mAc: ac ?? '', mActualDate: 1 });
    return rows.map((r) => ({
      id: r.ID,
      vsrl: r.VSRL,
      ac: r.AC,
      accountName: r.DESCRIPTION,
      date: r.DATE,
      debit: r.DEBT,
      credit: r.CRED,
      vtype: r.VTYPE,
      narration: r.NARRATION,
      refNo: r.REFNO
    }));
  }

  /** Real base table: a genuine per-voucher Created/Edited audit trail (44330 real rows). */
  async voucherActionLog(filters: {
    vsrl?: string;
    page: number;
    limit: number;
  }): Promise<{ items: VoucherActionLogItem[]; total: number }> {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};
    if (filters.vsrl) {
      conditions.push('Vsrl = @vsrl');
      params.vsrl = filters.vsrl;
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const totalRows = await queryView<{ cnt: number }>(`SELECT COUNT(*) AS cnt FROM AccountsLog ${where}`, params);
    const rows = await queryViewPaginated<{
      ID: number;
      Vsrl: string | null;
      UserID: string | null;
      Date: string | null;
      Remarks: string | null;
      Status: string | null;
    }>('ID, Vsrl, UserID, Date, Remarks, Status', 'AccountsLog', where, 'ID DESC', params, filters.page, filters.limit);
    return {
      items: rows.map((r) => ({
        id: r.ID,
        vsrl: r.Vsrl,
        userId: r.UserID,
        date: r.Date,
        remarks: r.Remarks,
        status: r.Status
      })),
      total: totalRows[0]?.cnt ?? 0
    };
  }

  /**
   * VERIFIED (2026-07-08) against real historical Receipt (PAYTYPE='NR', 99.9% of receipts) and
   * Payment (PAYTYPE='CP' for cash / 'BP' for a real bank account, ~91% of payments combined)
   * vouchers - the same `ACMASTER`/`ACDETAILS` tables as Journal Vouchers, with the same
   * CurBal/GroupID/ACTEMP-sentinel judgment calls documented on LedgerRepository.createJournalVoucher.
   * Unlike a generic Journal, a Receipt/Payment always has exactly one fixed cash/bank side
   * (ACTEMP, a real `ACHEADSQL WHERE BANK=1` account - confirmed 'CASH' itself is a real BANK=1
   * row) and N variable "other" (customer/supplier/expense) lines:
   * - Receipt: each "other" line is CREDITED (customer owes less), the cash/bank line is
   *   DEBITED (cash increases) for the sum.
   * - Payment: each "other" line is DEBITED (expense/supplier), the cash/bank line is CREDITED
   *   (cash decreases) for the sum.
   * - VAC: each "other" line's VAC = the cash/bank account. The cash/bank line's VAC = the one
   *   other account when there's exactly one, else the '000000' ("As Per Details") sentinel -
   *   confirmed live against a real 19-line payment voucher.
   * - OnAc='O' (letter) for every line - confirmed as the dominant real convention (95-100%
   *   across Receipt/Payment/Journal alike) after checking a large sample, not just one voucher.
   * - VTYPE is 'Receipt' (singular) or 'Payments' (plural) - both real, confirmed distinct
   *   ACMASTER.VTYPE values, not a guess.
   */
  async createReceiptPaymentVoucher(input: ReceiptPaymentVoucherInput): Promise<{ id: number; vsrl: string }> {
    return withNextNumericId('ACMASTER', 'ID', async (nextId, req, transaction) => {
      const maxVsrlResult = await req.query(
        `SELECT ISNULL(MAX(CASE WHEN VSRL NOT LIKE '%[^0-9]%' THEN CAST(VSRL AS INT) END), 0) AS maxVsrl
         FROM ACMASTER WITH (UPDLOCK, HOLDLOCK)`
      );
      const nextVsrl = String((maxVsrlResult.recordset[0]?.maxVsrl ?? 0) + 1);
      const isReceipt = input.type === 'Receipt';
      const vtype = isReceipt ? 'Receipt' : 'Payments';
      const payType = isReceipt ? 'NR' : input.cashBankAc === 'CASH' ? 'CP' : 'BP';
      const total = input.lines.reduce((sum, l) => sum + l.amount, 0);

      await req
        .input('ID', nextId)
        .input('VSRL', nextVsrl)
        .input('Dt', input.date)
        .input('VType', vtype)
        .input('Narration', input.narration)
        .input('ACTEMP', input.cashBankAc)
        .input('PayType', payType)
        .input('Chq', input.chq ?? '').query(`
          INSERT INTO ACMASTER (ID, VSRL, BranchID, DATE, VTYPE, NARRATION, ACTEMP, PAYTYPE, CHQ, POSTED, Checked, AutoPost, Printed, Edited, TempVoucher, PackingDocNo, PDC, DEPOCODE)
          VALUES (@ID, @VSRL, 0, @Dt, @VType, @Narration, @ACTEMP, @PayType, @Chq, 0, 0, 0, 0, 0, 0, 0, 0, '')
        `);

      const cashVac = input.lines.length === 1 ? input.lines[0].ac : '000000';
      await new mssql.Request(transaction)
        .input('ID', nextId)
        .input('VSRL', nextVsrl)
        .input('AC', input.cashBankAc)
        .input('Dt', input.date)
        .input('Debt', isReceipt ? total : 0)
        .input('Cred', isReceipt ? 0 : total)
        .input('Vac', cashVac)
        .input('Lnarration', input.narration).query(`
          INSERT INTO ACDETAILS (ID, VSRL, AC, DATE, DEBT, CRED, VAC, OnAc, Lnarration, GroupID)
          VALUES (@ID, @VSRL, @AC, @Dt, @Debt, @Cred, @Vac, 'O', @Lnarration, 0)
        `);

      for (const line of input.lines) {
        await new mssql.Request(transaction)
          .input('ID', nextId)
          .input('VSRL', nextVsrl)
          .input('AC', line.ac)
          .input('Dt', input.date)
          .input('Debt', isReceipt ? 0 : line.amount)
          .input('Cred', isReceipt ? line.amount : 0)
          .input('Vac', input.cashBankAc)
          .input('Lnarration', line.description ?? '').query(`
            INSERT INTO ACDETAILS (ID, VSRL, AC, DATE, DEBT, CRED, VAC, OnAc, Lnarration, GroupID)
            VALUES (@ID, @VSRL, @AC, @Dt, @Debt, @Cred, @Vac, 'O', @Lnarration, 0)
          `);
      }

      return { id: nextId, vsrl: nextVsrl };
    });
  }
}

export const bankingRepository = new BankingRepository();
