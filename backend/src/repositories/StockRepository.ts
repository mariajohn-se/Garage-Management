import { queryView, queryViewPaginated, callProcedure } from '../db/callProcedure';
import {
  StockInEntry,
  StockOutEntry,
  StockTransactionItem,
  CurrentStockItem,
  ReorderStatusItem
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
}

export const stockRepository = new StockRepository();
