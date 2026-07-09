import mssql from 'mssql';
import { queryView, queryViewPaginated, callProcedure, withNextNumericId } from '../db/callProcedure';
import {
  StockInEntry,
  StockOutEntry,
  StockTransactionItem,
  CurrentStockItem,
  ReorderStatusItem,
  StockMovementInput,
  StockMovementFrequencyItem
} from '../models/Stock';

/**
 * VERIFIED against the live database: StockIn01Sql (532 rows), StockOut01Sql (422 rows),
 * StockTransactionSql (218475 rows - always paginated), GetSockQty (48028 rows, real
 * documented SP), spStockValuation and spStockAgingReport (real, undocumented SPs found via
 * INFORMATION_SCHEMA.ROUTINES; both take a `@type` parameter that must be a numeric string
 * like '0' or '1' despite being declared varchar - passing a descriptive string like 'COST'
 * throws a conversion error, confirmed live).
 */

interface StockHeaderRow {
  ID: number;
  StockNo: string | null;
  StockDt: string | null;
  Ref: string | null;
  Total: number | null;
  Nett: number | null;
  Remarks: string | null;
}

function toStockEntry(row: StockHeaderRow): StockInEntry {
  return {
    id: row.ID,
    stockNo: row.StockNo,
    stockDate: row.StockDt,
    ref: row.Ref,
    total: row.Total,
    net: row.Nett,
    remarks: row.Remarks
  };
}

const HEADER_COLUMNS = 'ID, StockNo, StockDt, Ref, Total, Nett, Remarks';

interface TransactionRow {
  ID: number;
  Date: string | null;
  Itemcode: string | null;
  Description: string | null;
  StkIN: number | null;
  StkOut: number | null;
  Amount: number | null;
  TRType: string | null;
  RefNo: string | null;
  Location: string | null;
}

function toTransaction(row: TransactionRow): StockTransactionItem {
  return {
    id: row.ID,
    date: row.Date,
    itemCode: row.Itemcode,
    description: row.Description,
    stockIn: row.StkIN,
    stockOut: row.StkOut,
    amount: row.Amount,
    trType: row.TRType,
    refNo: row.RefNo,
    location: row.Location
  };
}

export class StockRepository {
  async listStockIn(filters: { page: number; limit: number }): Promise<{ items: StockInEntry[]; total: number }> {
    const totalRows = await queryView<{ cnt: number }>('SELECT COUNT(*) AS cnt FROM StockIn01Sql');
    const rows = await queryViewPaginated<StockHeaderRow>(
      HEADER_COLUMNS,
      'StockIn01Sql',
      '',
      'ID DESC',
      {},
      filters.page,
      filters.limit
    );
    return { items: rows.map(toStockEntry), total: totalRows[0]?.cnt ?? 0 };
  }

  async listStockOut(filters: { page: number; limit: number }): Promise<{ items: StockOutEntry[]; total: number }> {
    const totalRows = await queryView<{ cnt: number }>('SELECT COUNT(*) AS cnt FROM StockOut01Sql');
    const rows = await queryViewPaginated<StockHeaderRow>(
      HEADER_COLUMNS,
      'StockOut01Sql',
      '',
      'ID DESC',
      {},
      filters.page,
      filters.limit
    );
    return { items: rows.map(toStockEntry), total: totalRows[0]?.cnt ?? 0 };
  }

  async listTransactions(filters: {
    itemCode?: string;
    page: number;
    limit: number;
  }): Promise<{ items: StockTransactionItem[]; total: number }> {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};
    if (filters.itemCode) {
      conditions.push('Itemcode = @itemCode');
      params.itemCode = filters.itemCode;
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const columns = 'ID, Date, Itemcode, Description, StkIN, StkOut, Amount, TRType, RefNo, Location';

    const totalRows = await queryView<{ cnt: number }>(
      `SELECT COUNT(*) AS cnt FROM StockTransactionSql ${where}`,
      params
    );
    const rows = await queryViewPaginated<TransactionRow>(
      columns,
      'StockTransactionSql',
      where,
      'ID DESC',
      params,
      filters.page,
      filters.limit
    );
    return { items: rows.map(toTransaction), total: totalRows[0]?.cnt ?? 0 };
  }

  /**
   * Real, documented SP (DB_CONNECTION_SPEC_v12.md) - verified live, 48028 real rows.
   * GetSockQty takes no parameters, so filtering/pagination happens in JS after the full
   * result set is fetched - fine for a few tens of thousands of rows fetched once per
   * request, but worth revisiting (e.g. caching, or a paginated wrapper view) if this becomes
   * a hot path.
   */
  async currentStock(filters: { search?: string; page: number; limit: number }): Promise<{
    items: CurrentStockItem[];
    total: number;
  }> {
    const rows = await callProcedure<{
      ITEMCODE: string;
      TAG: string | null;
      description: string | null;
      Location: string | null;
      STOCK: number | null;
      COST: number | null;
    }>('GetSockQty', {});
    let items = rows.map((r) => ({
      itemCode: r.ITEMCODE,
      tag: r.TAG,
      description: r.description,
      location: r.Location,
      stock: r.STOCK,
      cost: r.COST
    }));
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (i) => i.itemCode.toLowerCase().includes(q) || (i.description ?? '').toLowerCase().includes(q)
      );
    }
    const total = items.length;
    const start = (filters.page - 1) * filters.limit;
    return { items: items.slice(start, start + filters.limit), total };
  }

  /** Real SP, not in DB_CONNECTION_SPEC_v12.md's catalog but confirmed live. @type must be
   *  a numeric string ('0'/'1'), not a descriptive one. */
  async stockValuation(asOfDate: string, type: '0' | '1' = '0'): Promise<Record<string, unknown>[]> {
    return callProcedure('spStockValuation', { type, Date: asOfDate });
  }

  /** Real SP, not in DB_CONNECTION_SPEC_v12.md's catalog but confirmed live. */
  async stockAging(asOfDate: string, days: number, type: '0' | '1' = '0'): Promise<Record<string, unknown>[]> {
    return callProcedure('spStockAgingReport', { type, Date: asOfDate, Days: days });
  }

  /**
   * VERIFIED (2026-07-09): spFastMovingItems is real and live (10,572 rows against a wide date
   * range - most real transaction history in this database predates 2020, so a narrow recent
   * range legitimately returns 0). It returns ITEMCODE/TAG/Description/cnt unsorted by cnt (its
   * own output order is by ITEMCODE) - "fast" vs "slow" moving is the same procedure result,
   * just re-sorted by cnt here rather than a second procedure (none exists), then capped to
   * `limit` since the full result can run into the thousands.
   */
  async stockMovementFrequency(
    fromDate: string,
    toDate: string,
    direction: 'fast' | 'slow',
    limit: number
  ): Promise<StockMovementFrequencyItem[]> {
    const rows = await callProcedure<{ cnt: number; ITEMCODE: string; TAG: string | null; Description: string | null }>(
      'spFastMovingItems',
      { FromDate: fromDate, Todate: toDate, minCount: 1 }
    );
    const sorted = rows.sort((a, b) => (direction === 'fast' ? b.cnt - a.cnt : a.cnt - b.cnt));
    return sorted.slice(0, limit).map((r) => ({
      itemCode: r.ITEMCODE,
      tag: r.TAG,
      description: r.Description,
      movementCount: r.cnt
    }));
  }

  /**
   * No dedicated reorder-status SP/view was found - this filters the real ItemsSql view
   * directly on its own Stock/ReOrder columns (a single-view filter, not a hand-join of base
   * tables, so it stays within STANDARDS.md's read rules).
   */
  async reorderStatus(filters: { page: number; limit: number }): Promise<{
    items: ReorderStatusItem[];
    total: number;
  }> {
    const where = 'WHERE ReOrder > 0 AND Stock <= ReOrder';
    const totalRows = await queryView<{ cnt: number }>(`SELECT COUNT(*) AS cnt FROM ItemsSql ${where}`);
    const rows = await queryViewPaginated<{
      ItemCode: string;
      Description: string | null;
      Stock: number | null;
      ReOrder: number | null;
    }>('ItemCode, Description, Stock, ReOrder', 'ItemsSql', where, 'Stock', {}, filters.page, filters.limit);
    return {
      items: rows.map((r) => ({
        itemCode: r.ItemCode,
        description: r.Description,
        stock: r.Stock,
        reorderLevel: r.ReOrder
      })),
      total: totalRows[0]?.cnt ?? 0
    };
  }

  /** Backs the location picker on the Stock In/Out entry forms - only 8 real rows, no search needed. */
  async listGodowns(): Promise<Array<{ ocode: string; name: string }>> {
    const rows = await queryView<{ Ocode: string; Godown: string }>('SELECT Ocode, Godown FROM GodownSql ORDER BY Godown');
    return rows.map((r) => ({ ocode: r.Ocode, name: r.Godown }));
  }

  /**
   * VERIFIED FINDING (2026-07-08): StockIn01Sql/StockOut01Sql/StockIn02/StockOut02 are just the
   * voucher header/detail records - GetSockQty (real current-stock SP) computes quantity purely
   * from `SUM(StkIN) - SUM(StkOut)` on the separate StockTransaction ledger table, and no
   * trigger exists anywhere on StockIn01/StockIn02/StockOut01/StockOut02/Items to keep them in
   * sync (checked sys.triggers). Writing only the voucher without also writing StockTransaction
   * would create an entry that shows up in the Stock In/Out list but never affects real
   * inventory - confirmed the real mapping by cross-referencing a live StockIn01 header against
   * its StockTransaction rows: TRType='SI', TrID=<StockIn01.ID>, RefNo=<StockNo>,
   * Remarks='Stk IN - <StockNo> ...'; StockOut is the same shape with TRType='SO' and
   * Remarks='Stk-Out - <StockNo> '. StockTransaction.ID is a real IDENTITY column (checked
   * after the Estimation02.Sl mistake) - never inserted explicitly. StockIn02/StockOut02.Srl
   * has no confirmed meaning (its live max is far below the tables' row counts, so it isn't a
   * simple global counter either) - populated with a plain per-line 1-based index as a safe,
   * documented judgment call rather than guessing at a pattern that doesn't hold up.
   */
  private async createStockMovement(
    kind: 'in' | 'out',
    input: StockMovementInput
  ): Promise<{ id: number; stockNo: string }> {
    const headerTable = kind === 'in' ? 'StockIn01' : 'StockOut01';
    const detailTable = kind === 'in' ? 'StockIn02' : 'StockOut02';
    const trType = kind === 'in' ? 'SI' : 'SO';

    return withNextNumericId(headerTable, 'ID', async (nextId, req, transaction) => {
      const maxStockNoResult = await req.query(
        `SELECT ISNULL(MAX(CASE WHEN StockNo NOT LIKE '%[^0-9]%' THEN CAST(StockNo AS INT) END), 0) AS maxStockNo
         FROM ${headerTable} WITH (UPDLOCK, HOLDLOCK)`
      );
      const nextStockNo = String((maxStockNoResult.recordset[0]?.maxStockNo ?? 0) + 1);
      const total = input.lines.reduce((sum, l) => sum + l.qty * l.rate, 0);
      const remarksPrefix = kind === 'in' ? `Stk IN - ${nextStockNo}` : `Stk-Out - ${nextStockNo}`;

      await req
        .input('ID', nextId)
        .input('StockNo', nextStockNo)
        .input('StockDt', input.stockDate)
        .input('Total', total)
        .input('Nett', total)
        .input('Remarks', input.remarks).query(`
          INSERT INTO ${headerTable} (ID, Ccode, StockNo, StockDt, Total, Tda, Txa, Nett, Remarks)
          VALUES (@ID, '01', @StockNo, @StockDt, @Total, 0, 0, @Nett, @Remarks)
        `);

      let srl = 1;
      for (const line of input.lines) {
        const amount = line.qty * line.rate;
        await new mssql.Request(transaction)
          .input('ID', nextId)
          .input('StockNo', nextStockNo)
          .input('Dt', input.stockDate)
          .input('ItemCode', line.itemCode)
          .input('Qty', line.qty)
          .input('Rate', line.rate)
          .input('Amount', amount)
          .input('GDID', line.godownId)
          .input('Srl', kind === 'in' ? String(srl) : srl).query(`
            INSERT INTO ${detailTable} (ID, Ccode, StockNo, Dt, ItemCode, Qty, Rate, Tdr, Tda, Amount, GDID, Srl)
            VALUES (@ID, '01', @StockNo, @Dt, @ItemCode, @Qty, @Rate, 0, 0, @Amount, @GDID, @Srl)
          `);
        srl++;

        await new mssql.Request(transaction)
          .input('Date', input.stockDate)
          .input('Itemcode', line.itemCode)
          .input('GDID', line.godownId)
          .input('StkIN', kind === 'in' ? line.qty : 0)
          .input('StkOut', kind === 'out' ? line.qty : 0)
          .input('Rate', line.rate)
          .input('Amount', amount)
          .input('TRType', trType)
          .input('TrID', nextId)
          .input('RefNo', nextStockNo)
          .input('Remarks', `${remarksPrefix}${input.remarks ? ` ${input.remarks}` : ' '}`).query(`
            INSERT INTO StockTransaction (Date, Itemcode, GDID, StkIN, StkOut, Rate, Tdr, Tda, Amount, TRType, TrID, RefNo, Remarks, CostDisc, OrdrNo)
            VALUES (@Date, @Itemcode, @GDID, @StkIN, @StkOut, @Rate, 0, 0, @Amount, @TRType, @TrID, @RefNo, @Remarks, 0, '')
          `);
      }

      return { id: nextId, stockNo: nextStockNo };
    });
  }

  createStockIn(input: StockMovementInput) {
    return this.createStockMovement('in', input);
  }

  createStockOut(input: StockMovementInput) {
    return this.createStockMovement('out', input);
  }
}

export const stockRepository = new StockRepository();
