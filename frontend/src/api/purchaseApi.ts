import { apiRequest } from './client';
import { LineItem } from '../components/LineItemsEditor';

export interface LocalPurchaseOrder {
  id: number;
  invoice: string | null;
  invoiceDate: string | null;
  suppId: string | null;
  supplierName: string | null;
  total: number | null;
  net: number | null;
  currency: string | null;
  remarks: string | null;
}

export interface ForeignPurchaseOrder {
  id: number;
  poOrder: string | null;
  orderDate: string | null;
  suppId: string | null;
  supplierName: string | null;
  total: number | null;
  net: number | null;
  currency: string | null;
  remarks: string | null;
}

export interface PurchaseDeliveryOrder {
  id: number;
  pdoNo: string | null;
  orderDate: string | null;
  supplierName: string | null;
  total: number | null;
  net: number | null;
  closed: boolean;
  entryDate: string | null;
}

export interface PurchaseDeliveryOrderDetail extends PurchaseDeliveryOrder {
  items: PurchaseDeliveryItem[];
}

export interface PendingPurchaseDO {
  pdoNo: string | null;
  id: number;
  suppId: string | null;
  ref: string | null;
  porDt: string | null;
  purchaseId: number | null;
}

export interface PurchaseDeliveryItem {
  id: number;
  pdoNo: string | null;
  date: string | null;
  itemCode: string | null;
  qty: number | null;
  rate: number | null;
  amount: number | null;
  description: string | null;
}

export interface ProdRequest {
  id: number;
  refNo: string | null;
  refDate: string | null;
  supplierName: string | null;
  total: number | null;
  net: number | null;
  remarks: string | null;
}

export interface PurchaseReturn {
  id: number;
  pretNo: string | null;
  pretDate: string | null;
  invoice: string | null;
  supplierId: string | null;
  total: number | null;
  net: number | null;
  remarks: string | null;
}

export interface PurchaseVehicleLink {
  id: number;
  pInvNo: string | null;
  vehNo: string | null;
  amount: number | null;
  ordr: string | null;
  completed: boolean;
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

export const purchaseApi = {
  listLocal: (filters: { supplierName?: string; invoice?: string; page?: number; limit?: number }) =>
    apiRequest<Paged<LocalPurchaseOrder>>(`/purchases${qs(filters)}`),
  getLocal: (id: number) => apiRequest<LocalPurchaseOrder>(`/purchases/${id}`),
  createLocal: (input: {
    suppId: string;
    invoiceDate: string;
    currency?: string;
    remarks?: string;
    items: LineItem[];
  }) => apiRequest<{ id: number }>('/purchases', { method: 'POST', body: input }),
  updateLocal: (id: number, changes: { suppId?: string; remarks?: string; items?: LineItem[] }) =>
    apiRequest<{ message: string }>(`/purchases/${id}`, { method: 'PUT', body: changes }),
  deleteLocal: (id: number) => apiRequest<void>(`/purchases/${id}`, { method: 'DELETE' }),

  listForeign: (filters: { supplierName?: string; page?: number; limit?: number }) =>
    apiRequest<Paged<ForeignPurchaseOrder>>(`/foreign-purchases${qs(filters)}`),
  getForeign: (id: number) => apiRequest<ForeignPurchaseOrder>(`/foreign-purchases/${id}`),
  createForeign: (input: {
    suppId: string;
    orderDate: string;
    currency?: string;
    remarks?: string;
    items: LineItem[];
  }) => apiRequest<{ id: number }>('/foreign-purchases', { method: 'POST', body: input }),
  updateForeign: (id: number, changes: { suppId?: string; remarks?: string; items?: LineItem[] }) =>
    apiRequest<{ message: string }>(`/foreign-purchases/${id}`, { method: 'PUT', body: changes }),

  listDeliveryOrders: (filters: { supplierName?: string; page?: number; limit?: number }) =>
    apiRequest<Paged<PurchaseDeliveryOrder>>(`/purchases/delivery-orders${qs(filters)}`),
  getDeliveryOrder: (id: number) => apiRequest<PurchaseDeliveryOrderDetail>(`/purchases/delivery-orders/${id}`),

  listPendingDeliveryOrders: (supplierId?: string) =>
    apiRequest<PendingPurchaseDO[]>(`/purchases/delivery-orders/pending${qs({ supplierId })}`),

  listDeliveryItems: (filters: { pdoNo?: string; itemCode?: string; page?: number; limit?: number }) =>
    apiRequest<Paged<PurchaseDeliveryItem>>(`/purchases/delivery-items${qs(filters)}`),

  listProdRequests: (filters: { page?: number; limit?: number }) =>
    apiRequest<Paged<ProdRequest>>(`/prodrequest${qs(filters)}`),
  createProdRequest: (input: { supplierId: string; remarks?: string }) =>
    apiRequest<{ id: number }>('/prodrequest', { method: 'POST', body: input }),
  deleteProdRequest: (id: number) => apiRequest<void>(`/prodrequest/${id}`, { method: 'DELETE' }),

  listReturns: (filters: { page?: number; limit?: number }) =>
    apiRequest<Paged<PurchaseReturn>>(`/purchases/returns${qs(filters)}`),

  listVehicleLinks: (filters: { page?: number; limit?: number }) =>
    apiRequest<Paged<PurchaseVehicleLink>>(`/purchases/vehicle-link${qs(filters)}`),
  createVehicleLink: (input: { pInvNo: string; vehNo: string }) =>
    apiRequest<{ id: number }>('/purchases/vehicle-link', { method: 'POST', body: input }),
  deleteVehicleLink: (id: number) => apiRequest<void>(`/purchases/vehicle-link/${id}`, { method: 'DELETE' }),

  lpoDetailsReport: (fromDate: string, toDate: string) =>
    apiRequest<Array<Record<string, unknown>>>(`/reports/lpo-details${qs({ fromDate, toDate })}`)
};
