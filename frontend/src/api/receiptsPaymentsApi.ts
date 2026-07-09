import { apiRequest } from './client';

export interface PartyBill {
  id: number;
  custId: string | null;
  vsrl: string | null;
  bill: string | null;
  date: string | null;
  amount: number | null;
  refNo: string | null;
  currency: string | null;
  accountName: string | null;
  isCustomer: boolean;
  isSupplier: boolean;
  totalReceived: number | null;
  balance: number | null;
  status: 'Paid' | 'Partial' | 'Outstanding';
}

export interface BillAllocation {
  id: number;
  custId: string | null;
  refNo: string | null;
  vsrl: string | null;
  bill: string | null;
  date: string | null;
  receiptAmount: number | null;
  linkId: number | null;
}

export interface DiscountAuditRow {
  bill: string | null;
  billDate: string | null;
  customerName: string | null;
  invoiceAmount: number | null;
  discount: number | null;
  net: number | null;
  staffName: string | null;
}

export interface CustomerOutstandingRow {
  custId: string | null;
  bill: string | null;
  date: string | null;
  amount: number | null;
  balance: number | null;
  accountName: string | null;
  phone: string | null;
  order: string | null;
  salesMan: string | null;
  ageInDays: number | null;
}

export interface SupplierOutstandingRow {
  suppId: string;
  suppName: string | null;
  address: string | null;
  phone: string | null;
  fax: string | null;
  debit: number | null;
  credit: number | null;
  ledgerBalance: number | null;
  paidAmount: number | null;
  billBalance: number | null;
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

export const receiptsPaymentsApi = {
  listReceipts: (filters: { search?: string; status?: 'paid' | 'outstanding'; page?: number; limit?: number }) =>
    apiRequest<Paged<PartyBill>>(`/receipts${qs(filters)}`),
  listPayments: (filters: { search?: string; status?: 'paid' | 'outstanding'; page?: number; limit?: number }) =>
    apiRequest<Paged<PartyBill>>(`/payments${qs(filters)}`),
  getBillAllocations: (bill: string) =>
    apiRequest<BillAllocation[]>(`/receipts/allocations/${encodeURIComponent(bill)}`),
  discountHistory: (fromDate: string, toDate: string, maxDiscount?: number) =>
    apiRequest<DiscountAuditRow[]>(`/reports/discount-history${qs({ fromDate, toDate, maxDiscount })}`),
  customerOutstandingBySalesperson: (date: string) =>
    apiRequest<CustomerOutstandingRow[]>(`/reports/customer-outstanding-salesperson${qs({ date })}`),
  supplierOutstandingSummary: () =>
    apiRequest<SupplierOutstandingRow[]>('/reports/supplier-outstanding-summary')
};
