import { apiRequest } from './client';

export interface InsuranceInvoiceListItem {
  id: number;
  billNo: string | null;
  internalInvNo: string | null;
  estimationNo: string | null;
  invoiceDt: string | null;
  customerName: string | null;
  custTel: string | null;
  claimNumber: string | null;
  excessAmount: number | null;
  addition: number | null;
  less: number | null;
  remarks: string | null;
}

export interface InsuranceInvoiceLine {
  description: string | null;
  qty: number;
  unitPrice: number;
  amount: number;
}

export interface InsuranceInvoiceDetail extends InsuranceInvoiceListItem {
  lines: InsuranceInvoiceLine[];
}

export interface InsuranceInvoiceLineInput {
  description: string;
  qty: number;
  unitPrice: number;
}

export interface InsuranceInvoiceInput {
  invoiceDt: string;
  estimationNo: string;
  bill: string;
  customerName: string;
  custTel: string | null;
  claimNumber: string | null;
  excessAmount: number;
  addition: number;
  less: number;
  remarks: string | null;
  lines: InsuranceInvoiceLineInput[];
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

export const insuranceInvoiceApi = {
  list: (filters: { page?: number; limit?: number }) =>
    apiRequest<Paged<InsuranceInvoiceListItem>>(`/insurance-invoices${qs(filters)}`),
  get: (id: number) => apiRequest<InsuranceInvoiceDetail>(`/insurance-invoices/${id}`),
  create: (input: InsuranceInvoiceInput) =>
    apiRequest<{ id: number; billNo: string }>('/insurance-invoices', { method: 'POST', body: input })
};
