import { queryView, queryViewPaginated, callProcedure } from '../db/callProcedure';
import { AccountHead, TrialBalanceRow, TrialBalanceSummary, BulkJournalEntry, BulkPdcEntry } from '../models/Ledger';

/**
 * VERIFIED against the live database: ACHEADSQL (8074 rows, the resolved chart-of-accounts
 * view - its own GroupTree column is a materialized ancestor path, e.g.
 * "******,PANDL,EXPENSES,4577,8221,8235", which is used to render the account hierarchy
 * directly, since the spec's documented tree procedure, SPACTREEVIEW, throws the same
 * "Cannot resolve the collation conflict" error already seen in Phase 3/6/7/9's
 * AgewiseSummary/SP_MarginRpt/sp_LPOAnalysis - a 5th confirmed instance of the same systemic
 * bug). TrialBalance (a real, undocumented stored procedure, verified live with 1881 real
 * rows). BulkJournals01Sql/PDCBulk01Sql/PDCBulkReceipt01Sql (real views backing the spec's bulk
 * journal/PDC import history, all confirmed to have 0 rows in production - these features
 * appear to have never been used historically in this database).
 *
 * PorfitandbalTotal_SP (P&L) and SPACTREEVIEW both hit the same collation bug live.
 * AcSummary (Group Ledger Summary) hits a *different* bug live - "Invalid object name
 * '#tmp1'" - a temp-table reference that doesn't survive across the driver's execution
 * boundary. Neither is usable without altering the stored procedure, which DB-Preserve mode
 * forbids.
 */

interface AccountHeadRow {
  CODES: string;
  HEAD: string | null;
  DESCRIPTION: string | null;
  HEADUNDER: string | null;
  GroupTree: string | null;
  ACHEADDESCR: string | null;
  BANK: number | null;
  CUSTOMER: number | null;
  SUPPLIER: number | null;
  LOCKED: number | null;
}

function toAccountHead(row: AccountHeadRow): AccountHead {
  return {
    codes: row.CODES,
    head: row.HEAD,
    description: row.DESCRIPTION,
    headUnder: row.HEADUNDER,
    groupTree: row.GroupTree,
    groupDescription: row.ACHEADDESCR,
    bank: !!row.BANK,
    customer: !!row.CUSTOMER,
    supplier: !!row.SUPPLIER,
    locked: !!row.LOCKED
  };
}

const ACCOUNT_HEAD_COLUMNS =
  'CODES, HEAD, DESCRIPTION, HEADUNDER, GroupTree, ACHEADDESCR, BANK, CUSTOMER, SUPPLIER, LOCKED';

export class LedgerRepository {
  async listAccountHeads(filters: {
    search?: string;
    page: number;
    limit: number;
  }): Promise<{ items: AccountHead[]; total: number }> {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};
    if (filters.search) {
      conditions.push('(DESCRIPTION LIKE @search OR CODES LIKE @search)');
      params.search = `%${filters.search}%`;
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const totalRows = await queryView<{ cnt: number }>(`SELECT COUNT(*) AS cnt FROM ACHEADSQL ${where}`, params);
    const rows = await queryViewPaginated<AccountHeadRow>(
      ACCOUNT_HEAD_COLUMNS,
      'ACHEADSQL',
      where,
      'GroupTree',
      params,
      filters.page,
      filters.limit
    );
    return { items: rows.map(toAccountHead), total: totalRows[0]?.cnt ?? 0 };
  }

  async getAccountHead(codes: string): Promise<AccountHead | null> {
    const rows = await queryView<AccountHeadRow>(`SELECT ${ACCOUNT_HEAD_COLUMNS} FROM ACHEADSQL WHERE CODES = @codes`, {
      codes
    });
    return rows.length ? toAccountHead(rows[0]) : null;
  }

  /** Real ACHEADSQL.GroupTree materialized path - the working alternative to the broken SPACTREEVIEW. */
  async accountHeadTree(): Promise<AccountHead[]> {
    const rows = await queryView<AccountHeadRow>(`SELECT ${ACCOUNT_HEAD_COLUMNS} FROM ACHEADSQL ORDER BY GroupTree`);
    return rows.map(toAccountHead);
  }

  // Placeholder procedure names - no confirmed insert/update/delete SP for ACHEAD in the real catalog.
  async createAccountHead(data: { description: string; headUnder?: string }): Promise<string> {
    const rows = await callProcedure<{ CODES: string }>('spCreateAccountHead', data);
    return rows[0]?.CODES ?? '';
  }

  async updateAccountHead(codes: string, changes: { description?: string }): Promise<void> {
    await callProcedure('spUpdateAccountHead', { CODES: codes, ...changes });
  }

  /** Real, undocumented SP - found via INFORMATION_SCHEMA.ROUTINES, verified live (1881 rows). */
  async trialBalance(fromDate: string, toDate: string): Promise<TrialBalanceRow[]> {
    const rows = await callProcedure<{
      AC: string | null;
      DESCRIPTION: string | null;
      Debt: number | null;
      Cred: number | null;
    }>('TrialBalance', { mDate1: fromDate, mDate2: toDate });
    return rows.map((r) => ({ ac: r.AC, description: r.DESCRIPTION, debit: r.Debt, credit: r.Cred }));
  }

  computeTrialBalanceSummary(rows: TrialBalanceRow[]): TrialBalanceSummary {
    const totalDebit = rows.reduce((sum, r) => sum + (r.debit ?? 0), 0);
    const totalCredit = rows.reduce((sum, r) => sum + (r.credit ?? 0), 0);
    return {
      accountCount: rows.length,
      totalDebit: Math.round(totalDebit * 100) / 100,
      totalCredit: Math.round(totalCredit * 100) / 100,
      balanced: Math.abs(totalDebit - totalCredit) < 0.01
    };
  }

  async listBulkJournals(filters: {
    page: number;
    limit: number;
  }): Promise<{ items: BulkJournalEntry[]; total: number }> {
    const totalRows = await queryView<{ cnt: number }>('SELECT COUNT(*) AS cnt FROM BulkJournals01Sql');
    const rows = await queryViewPaginated<{
      ID: number;
      Date: string | null;
      Ac: string | null;
      AcDescr: string | null;
      CrDr: string | null;
      NetAmt: number | null;
      Narration: string | null;
    }>(
      'ID, Date, Ac, AcDescr, CrDr, NetAmt, Narration',
      'BulkJournals01Sql',
      '',
      'ID DESC',
      {},
      filters.page,
      filters.limit
    );
    return {
      items: rows.map((r) => ({
        id: r.ID,
        date: r.Date,
        ac: r.Ac,
        accountName: r.AcDescr,
        crDr: r.CrDr,
        netAmt: r.NetAmt,
        narration: r.Narration
      })),
      total: totalRows[0]?.cnt ?? 0
    };
  }

  async listBulkPdcReceipts(filters: {
    page: number;
    limit: number;
  }): Promise<{ items: BulkPdcEntry[]; total: number }> {
    return this.listBulkPdcView('PDCBulkReceipt01Sql', filters);
  }

  async listBulkPdcs(filters: { page: number; limit: number }): Promise<{ items: BulkPdcEntry[]; total: number }> {
    return this.listBulkPdcView('PDCBulk01Sql', filters);
  }

  private async listBulkPdcView(
    view: string,
    filters: { page: number; limit: number }
  ): Promise<{ items: BulkPdcEntry[]; total: number }> {
    const totalRows = await queryView<{ cnt: number }>(`SELECT COUNT(*) AS cnt FROM ${view}`);
    const rows = await queryViewPaginated<{
      ID: number;
      Date: string | null;
      Ac: string | null;
      AcDescr: string | null;
      DepoCode: string | null;
      NetAmt: number | null;
      CurBal: number | null;
      Narration: string | null;
    }>(
      'ID, Date, Ac, AcDescr, DepoCode, NetAmt, CurBal, Narration',
      view,
      '',
      'ID DESC',
      {},
      filters.page,
      filters.limit
    );
    return {
      items: rows.map((r) => ({
        id: r.ID,
        date: r.Date,
        ac: r.Ac,
        accountName: r.AcDescr,
        depoCode: r.DepoCode,
        netAmt: r.NetAmt,
        curBal: r.CurBal,
        narration: r.Narration
      })),
      total: totalRows[0]?.cnt ?? 0
    };
  }
}

export const ledgerRepository = new LedgerRepository();
