/**
 * VERIFIED against the live database. ItemsSql (49564 rows), StockIn01Sql/StockIn02Sql
 * (532/763 rows), StockOut01Sql/StockOut02Sql (422/835 rows), StockTransactionSql (218475
 * rows - a large real table, always paginated here), GetSockQty (48028 real rows, a
 * documented real SP per DB_CONNECTION_SPEC_v12.md), spStockValuation and
 * spStockAgingReport (real, undocumented SPs found via INFORMATION_SCHEMA.ROUTINES and
 * verified live) all exist with substantial real data.
 */
export interface Item {
  itemCode: string;
  description: string | null;
  category: string | null;
  denom: string | null;
  salesRate: number | null;
  cost: number | null;
  stock: number | null;
  reorderLevel: number | null;
  isActive: boolean;
}

export interface StockInEntry {
  id: number;
  stockNo: string | null;
  stockDate: string | null;
  ref: string | null;
  total: number | null;
  net: number | null;
  remarks: string | null;
}

export interface StockOutEntry {
  id: number;
  stockNo: string | null;
  stockDate: string | null;
  ref: string | null;
  total: number | null;
  net: number | null;
  remarks: string | null;
}

export interface StockTransactionItem {
  id: number;
  date: string | null;
  itemCode: string | null;
  description: string | null;
  stockIn: number | null;
  stockOut: number | null;
  amount: number | null;
  trType: string | null;
  refNo: string | null;
  location: string | null;
}

export interface CurrentStockItem {
  itemCode: string;
  tag: string | null;
  description: string | null;
  location: string | null;
  stock: number | null;
  cost: number | null;
}

export interface ReorderStatusItem {
  itemCode: string;
  description: string | null;
  stock: number | null;
  reorderLevel: number | null;
}

export interface StockMovementLineInput {
  itemCode: string;
  qty: number;
  rate: number;
  godownId: string;
}

export interface StockMovementInput {
  stockDate: string;
  remarks: string | null;
  lines: StockMovementLineInput[];
}
