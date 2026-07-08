import { apiRequest } from './client';

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

export interface StockEntry {
  id: number;
  stockNo: string | null;
  stockDate: string | null;
  ref: string | null;
  total: number | null;
  net: number | null;
  remarks: string | null;
}

export interface StockTransaction {
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

interface Paged<T> {
  items: T[];
  total: number;
}

function qs(params: Record<string, unknown>) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  const s = new URLSearchParams(entries as [string, string][]).toString();
  return s ? `?${s}` : '';
}

export const inventoryApi = {
  listItems: (filters: { search?: string; category?: string; lowStock?: boolean; page?: number; limit?: number }) =>
    apiRequest<Paged<Item>>(`/items${qs(filters)}`),
  getItem: (itemCode: string) => apiRequest<Item>(`/items/${encodeURIComponent(itemCode)}`),
  updateItem: (itemCode: string, changes: { description?: string; reorderLevel?: number }) =>
    apiRequest<{ message: string }>(`/items/${encodeURIComponent(itemCode)}`, { method: 'PUT', body: changes }),

  listStockIn: (filters: { page?: number; limit?: number }) =>
    apiRequest<Paged<StockEntry>>(`/inventory/stock-in${qs(filters)}`),
  createStockIn: (input: StockMovementInput) =>
    apiRequest<{ id: number; stockNo: string }>('/inventory/stock-in', { method: 'POST', body: input }),
  listStockOut: (filters: { page?: number; limit?: number }) =>
    apiRequest<Paged<StockEntry>>(`/inventory/stock-out${qs(filters)}`),
  createStockOut: (input: StockMovementInput) =>
    apiRequest<{ id: number; stockNo: string }>('/inventory/stock-out', { method: 'POST', body: input }),
  listGodowns: () => apiRequest<Array<{ ocode: string; name: string }>>('/inventory/godowns'),
  listTransactions: (filters: { itemCode?: string; page?: number; limit?: number }) =>
    apiRequest<Paged<StockTransaction>>(`/inventory/transactions${qs(filters)}`),
  currentStock: (filters: { search?: string; page?: number; limit?: number }) =>
    apiRequest<Paged<CurrentStockItem>>(`/inventory/current-stock${qs(filters)}`),
  reorderStatus: (filters: { page?: number; limit?: number }) =>
    apiRequest<Paged<ReorderStatusItem>>(`/inventory/reorder-status${qs(filters)}`),

  stockValuation: (asOfDate: string, type: '0' | '1' = '0') =>
    apiRequest<Array<Record<string, unknown>>>(`/inventory/valuation${qs({ asOfDate, type })}`),
  stockAging: (asOfDate: string, days: number, type: '0' | '1' = '0') =>
    apiRequest<Array<Record<string, unknown>>>(`/inventory/aging${qs({ asOfDate, days, type })}`)
};
