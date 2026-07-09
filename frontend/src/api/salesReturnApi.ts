import { apiRequest } from './client';

export interface SalesReturnListItem {
  id: number;
  sretNo: string | null;
  sretDt: string | null;
  custId: string | null;
  custName: string | null;
  corQ: string | null;
  bill: string | null;
  total: number | null;
  nett: number | null;
  remarks: string | null;
}

export interface SalesReturnLine {
  itemCode: string;
  description: string | null;
  qty: number;
  rate: number;
  amount: number;
}

export interface SalesReturnDetail extends SalesReturnListItem {
  lines: SalesReturnLine[];
}

export interface SalesReturnLineInput {
  itemCode: string;
  qty: number;
  rate: number;
}

export interface SalesReturnInput {
  sretDt: string;
  custId: string;
  corQ: 'Cash' | 'Credit';
  bill: string | null;
  remarks: string | null;
  lines: SalesReturnLineInput[];
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

export const salesReturnApi = {
  list: (filters: { page?: number; limit?: number }) =>
    apiRequest<Paged<SalesReturnListItem>>(`/sales-returns${qs(filters)}`),
  get: (id: number) => apiRequest<SalesReturnDetail>(`/sales-returns/${id}`),
  create: (input: SalesReturnInput) =>
    apiRequest<{ id: number; sretNo: string }>('/sales-returns', { method: 'POST', body: input })
};
