import mssql from 'mssql';
import { queryView, queryViewPaginated, callProcedure, executeWrite, withNextNumericId } from '../db/callProcedure';
import {
  AccountHead,
  TrialBalanceRow,
  TrialBalanceSummary,
  BulkJournalEntry,
  BulkPdcEntry,
  JournalVoucherInput,
  BalanceSheetRow,
  OpeningBalanceResult
} from '../models/Ledger';
import { NotImplementedError } from '../utils/errors';

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

  /**
   * ACHEAD.CODES (PK) is a human-chosen mnemonic string (e.g. 'SUPPLIER', 'PANDL'), not a
   * sequence - verified live, every existing code is a hand-picked short name reflecting its
   * place in the chart-of-accounts hierarchy (GroupTree). Auto-generating one would produce a
   * meaningless code and could misplace the new account in that hierarchy, so this is left
   * blocked pending a real code from whoever maintains the chart of accounts, rather than guessed.
   */
  async createAccountHead(_data: { description: string; headUnder?: string }): Promise<string> {
    throw new NotImplementedError(
      'Creating a new account head requires a chart-of-accounts code chosen by someone who understands the ' +
        'hierarchy (ACHEAD.CODES is a mnemonic string, not an auto-generated ID) - not supported yet.'
    );
  }

  async updateAccountHead(codes: string, changes: { description?: string }): Promise<void> {
    if (changes.description === undefined) return;
    await executeWrite('UPDATE ACHEAD SET DESCRIPTION = @description WHERE CODES = @codes', {
      codes,
      description: changes.description
    });
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

  /**
   * VERIFIED (2026-07-09): AcSummary_balansheet is a real, working procedure - re-tested live
   * with a full parameter set (8,068 rows, 6,556 with a nonzero SumCr/SumDr). It returns the
   * whole chart-of-accounts tree (same TreeHD materialized-path shape as ACHEADSQL.GroupTree),
   * not just balance-sheet leaf accounts, with per-node cumulative debit/credit sums for the
   * given date range. Group=1 marks a structural group node (e.g. "ASSETS", "4571"); Group=0
   * marks a real postable account. AcSummary_balansheet_New (the newer-looking sibling
   * procedure) returns 0 rows against the same parameters and was not used.
   */
  async balanceSheet(fromDate: string, toDate: string): Promise<BalanceSheetRow[]> {
    const rows = await callProcedure<{
      TreeHD: string | null;
      CODES: string;
      DESCRIPTION: string | null;
      Group: number | null;
      SumDr: number | null;
      SumCr: number | null;
    }>('AcSummary_balansheet', {
      mAc: '',
      mDate1: fromDate,
      mDate2: toDate,
      mGroupID: 0,
      DateOption: 1,
      mFilterFld: ''
    });
    return rows.map((r) => ({
      codes: r.CODES,
      description: r.DESCRIPTION,
      treeHead: r.TreeHD,
      depth: r.TreeHD ? r.TreeHD.split(',').length - 1 : 0,
      isGroup: r.Group === 1,
      debit: r.SumDr ?? 0,
      credit: r.SumCr ?? 0
    }));
  }

  /**
   * VERIFIED (2026-07-09): "Opening Balance Entry" in the PRD implies a data-entry screen, but
   * there is no stored opening-balance value anywhere in the schema - Opening_Balance is a real
   * procedure that COMPUTES it live by summing ACDETAILS debit/credit before the given date
   * (spot-checked: OpClosing = OpDebt - OpCred exactly, and matches AcOpeningBalance's single
   * BalAmt figure for the same account/date). This is a lookup, not a write - there is nothing
   * to "enter" under DB-preserve mode.
   */
  async openingBalance(ac: string, asOfDate: string): Promise<OpeningBalanceResult> {
    const rows = await callProcedure<{ OpDebt: number | null; OpCred: number | null; OpClosing: number | null }>(
      'Opening_Balance',
      { mDate: asOfDate, mAc: ac, mActualDate: 1 }
    );
    const row = rows[0];
    return {
      ac,
      asOfDate,
      openingDebit: row?.OpDebt ?? 0,
      openingCredit: row?.OpCred ?? 0,
      closing: row?.OpClosing ?? 0
    };
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

  /**
   * VERIFIED (2026-07-08) against real historical "Journals"-type ACMASTER/ACDETAILS rows -
   * this is the first direct general-ledger write path in this codebase (no real posting
   * procedure exists anywhere; confirmed absent in Phase 13's audit). Deliberately minimal per
   * explicit user sign-off:
   * - CurBal is left unset (0) on every line - real historical ACDETAILS rows have it at 0 on
   *   32% of all 176,659 real rows with no clean chronological pattern (back-dated entries are
   *   common), so it is not a reliably-computed running balance to reverse-engineer; the app's
   *   real balance displays already compute live via SUM, not by trusting this column.
   * - ACTEMP='000000' on the header - a real, confirmed ACHEAD row (`DESCRIPTION: '(As Per
   *   Details)'`), exactly the sentinel every real multi-line Journals voucher uses.
   * - VAC (each line's "contra account") is only populated for the simple, cleanly-verified
   *   2-line case (debit account = other line's AC, and vice versa, matching every real 2-line
   *   example checked). For 3+ lines, real historical vouchers don't show one consistent
   *   pattern, so VAC falls back to the same '000000' sentinel as the header rather than
   *   guessing - a documented judgment call, not a confirmed business rule.
   * - Only the well-understood columns are set (BranchID=0, matching the only real Branch row;
   *   VTYPE='Journals'; GroupID=0, matching 92% of all 176,659 real ACDETAILS rows and every
   *   verified real journal example - Groups.GroupID=0 is 'TEM', the same default company/branch
   *   used everywhere else in this schema). Undocumented fields (PAYTYPE, TRANTYPE, PDC/cheque
   *   staging, Temp/TempVoucher, AutoPost, Posted) are left at safe zero/null defaults - this
   *   method does not support Receipt/Payment vouchers or cheque handling, by explicit scope
   *   decision. GroupID is a real INNER JOIN key on ACDETAILSSQL (to the `Groups` table) - a
   *   missed/wrong value here would make new lines invisible in Voucher Detail exactly like the
   *   VehicleId/StaffId finding in Phase 5's Estimation work, so this was checked before, not
   *   after, shipping.
   */
  async createJournalVoucher(input: JournalVoucherInput): Promise<{ id: number; vsrl: string }> {
    return withNextNumericId('ACMASTER', 'ID', async (nextId, req, transaction) => {
      const maxVsrlResult = await req.query(
        `SELECT ISNULL(MAX(CASE WHEN VSRL NOT LIKE '%[^0-9]%' THEN CAST(VSRL AS INT) END), 0) AS maxVsrl
         FROM ACMASTER WITH (UPDLOCK, HOLDLOCK)`
      );
      const nextVsrl = String((maxVsrlResult.recordset[0]?.maxVsrl ?? 0) + 1);

      await req
        .input('ID', nextId)
        .input('VSRL', nextVsrl)
        .input('Dt', input.date)
        .input('Narration', input.narration).query(`
          INSERT INTO ACMASTER (ID, VSRL, BranchID, DATE, VTYPE, NARRATION, ACTEMP, POSTED, Checked, AutoPost, Printed, Edited, TempVoucher, PackingDocNo, PDC)
          VALUES (@ID, @VSRL, 0, @Dt, 'Journals', @Narration, '000000', 0, 0, 0, 0, 0, 0, 0, 0)
        `);

      const isSimplePair = input.lines.length === 2;
      for (const line of input.lines) {
        const vac = isSimplePair ? input.lines.find((l) => l !== line)!.ac : '000000';
        await new mssql.Request(transaction)
          .input('ID', nextId)
          .input('VSRL', nextVsrl)
          .input('AC', line.ac)
          .input('Dt', input.date)
          .input('DEBT', line.debit)
          .input('CRED', line.credit)
          .input('VAC', vac)
          .input('Lnarration', line.description ?? '').query(`
            INSERT INTO ACDETAILS (ID, VSRL, AC, DATE, DEBT, CRED, VAC, OnAc, Lnarration, GroupID)
            VALUES (@ID, @VSRL, @AC, @Dt, @DEBT, @CRED, @VAC, 'O', @Lnarration, 0)
          `);
      }

      return { id: nextId, vsrl: nextVsrl };
    });
  }
}

export const ledgerRepository = new LedgerRepository();
