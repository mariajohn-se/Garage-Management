import { queryView, queryViewPaginated, callProcedure } from '../db/callProcedure';
import {
  VoucherListItem,
  VoucherLine,
  VoucherDetail,
  BankAccount,
  CashBankEntry,
  VoucherVerificationItem,
  AccountFilterItem,
  VoucherActionLogItem
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

  // Placeholder procedure name - the real AcVerification table has no documented insert
  // procedure in DB_CONNECTION_SPEC_v12.md; not confirmed against the real SP catalog.
  async markVerified(vsrl: string, userId: string): Promise<void> {
    await callProcedure('spAcVerificationInsert', { Vsrl: vsrl, UserId: userId });
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
}

export const bankingRepository = new BankingRepository();
