import { apiRequest } from './client';
import { LineItem } from '../components/LineItemsEditor';

export interface SalesOrder {
  id: number;
  ordr: string;
  orderDate: string | null;
  custId: string | null;
  customerName: string | null;
  vehId: number | null;
  vehNo: string | null;
  staffName: string | null;
  total: number | null;
  net: number | null;
  delivered: boolean;
  invoiced: boolean;
  closed: boolean;
  jobStatus: string | null;
  billNo: string | null;
  billDate: string | null;
  custNote: string | null;
}

export interface DeliveryNote {
  id: number;
  doNo: string | null;
  doDate: string | null;
  ordr: string | null;
  customerName: string | null;
  vehNo: string | null;
  total: number | null;
  net: number | null;
  remarks: string | null;
}

export interface SalesInvoice {
  id: number;
  bill: string | null;
  billDate: string | null;
  ordr: string | null;
  customerName: string | null;
  vehNo: string | null;
  total: number | null;
  net: number | null;
  delivered: boolean;
  paid: string | null;
}

export interface Proforma {
  id: number;
  bill: string | null;
  billDate: string | null;
  ordr: string | null;
  customerName: string | null;
  vehNo: string | null;
  total: number | null;
  net: number | null;
  voucherType: string | null;
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

export const orderApi = {
  list: (filters: { ordr?: string; customerName?: string; status?: string; page?: number; limit?: number }) =>
    apiRequest<Paged<SalesOrder>>(`/orders${qs(filters)}`),
  help: (q: string) => apiRequest<SalesOrder[]>(`/orders/help${qs({ q })}`),
  get: (id: number) => apiRequest<SalesOrder>(`/orders/${id}`),
  create: (input: {
    custId: string;
    vehId: number | null;
    orderDate: string;
    custNote: string | null;
    items: LineItem[];
  }) => apiRequest<{ ordr: string; total: number }>('/orders', { method: 'POST', body: input }),
  update: (id: number, changes: { custId?: string; vehId?: number | null; custNote?: string; items?: LineItem[] }) =>
    apiRequest<{ message: string }>(`/orders/${id}`, { method: 'PUT', body: changes }),
  changeCustomer: (id: number, newCustId: string, reason: string) =>
    apiRequest<{ message: string }>(`/orders/${id}/customer`, { method: 'PUT', body: { newCustId, reason } }),
  updateStatus: (id: number, statusId: number) =>
    apiRequest<{ message: string }>(`/orders/${id}/status`, { method: 'PUT', body: { statusId } }),
  remove: (id: number) => apiRequest<void>(`/orders/${id}`, { method: 'DELETE' })
};

export const salesApi = {
  deliveryNotes: (filters: { ordr?: string; page?: number; limit?: number }) =>
    apiRequest<Paged<DeliveryNote>>(`/delivery-notes${qs(filters)}`),
  createDeliveryNote: (input: { ordr: string; deliveredBy: string; remarks?: string }) =>
    apiRequest<{ doNo: string }>('/delivery-notes', { method: 'POST', body: input }),
  updateDeliveryNote: (id: number, changes: { deliveredBy?: string; remarks?: string }) =>
    apiRequest<{ message: string }>(`/delivery-notes/${id}`, { method: 'PUT', body: changes }),
  invoices: (filters: { customerName?: string; page?: number; limit?: number }) =>
    apiRequest<Paged<SalesInvoice>>(`/sales${qs(filters)}`),
  proformas: (filters: { page?: number; limit?: number }) => apiRequest<Paged<Proforma>>(`/proformas${qs(filters)}`),
  salesBillReport: (fromDate: string, toDate: string) =>
    apiRequest<Array<Record<string, unknown>>>(`/reports/sales-bill${qs({ fromDate, toDate })}`),
  salesMarginDetails: (fromDate: string, toDate: string) =>
    apiRequest<Array<Record<string, unknown>>>(`/reports/sales-margins${qs({ fromDate, toDate })}`),
  salesAnalysisReport: (fromDate: string, toDate: string) =>
    apiRequest<Array<Record<string, unknown>>>(`/reports/sales-analysis${qs({ fromDate, toDate })}`),
  monthlySplitSales: (fromDate: string, toDate: string) =>
    apiRequest<Array<Record<string, unknown>>>(`/reports/sales-split${qs({ fromDate, toDate })}`)
};
