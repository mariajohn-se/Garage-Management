import { apiRequest } from './client';

export interface AccountHead {
  codes: string;
  head: string | null;
  description: string | null;
  headUnder: string | null;
  groupTree: string | null;
  groupDescription: string | null;
  bank: boolean;
  customer: boolean;
  supplier: boolean;
  locked: boolean;
}

export interface TrialBalanceRow {
  ac: string | null;
  description: string | null;
  debit: number | null;
  credit: number | null;
}

export interface TrialBalanceSummary {
  accountCount: number;
  totalDebit: number;
  totalCredit: number;
  balanced: boolean;
}

export interface BulkJournalEntry {
  id: number;
  date: string | null;
  ac: string | null;
  accountName: string | null;
  crDr: string | null;
  netAmt: number | null;
  narration: string | null;
}

export interface BulkPdcEntry {
  id: number;
  date: string | null;
  ac: string | null;
  accountName: string | null;
  depoCode: string | null;
  netAmt: number | null;
  curBal: number | null;
  narration: string | null;
}

export interface JournalVoucherLineInput {
  ac: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface JournalVoucherInput {
  date: string;
  narration: string;
  lines: JournalVoucherLineInput[];
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

export const ledgerApi = {
  listAccountHeads: (filters: { search?: string; page?: number; limit?: number }) =>
    apiRequest<Paged<AccountHead>>(`/ledger/account-heads${qs(filters)}`),
  getAccountHead: (codes: string) => apiRequest<AccountHead>(`/ledger/account-heads/${encodeURIComponent(codes)}`),
  createAccountHead: (input: { description: string; headUnder?: string }) =>
    apiRequest<{ codes: string; message: string }>('/ledger/account-heads', { method: 'POST', body: input }),
  updateAccountHead: (codes: string, changes: { description?: string }) =>
    apiRequest<{ message: string }>(`/ledger/account-heads/${encodeURIComponent(codes)}`, {
      method: 'PUT',
      body: changes
    }),
  accountHeadTree: () => apiRequest<AccountHead[]>('/ledger/account-heads/tree'),

  trialBalance: (fromDate: string, toDate: string) =>
    apiRequest<{ rows: TrialBalanceRow[]; summary: TrialBalanceSummary }>(
      `/ledger/trial-balance${qs({ fromDate, toDate })}`
    ),

  listBulkJournals: (filters: { page?: number; limit?: number }) =>
    apiRequest<Paged<BulkJournalEntry>>(`/ledger/bulk-journals${qs(filters)}`),
  listBulkPdcReceipts: (filters: { page?: number; limit?: number }) =>
    apiRequest<Paged<BulkPdcEntry>>(`/ledger/bulk-pdc-receipts${qs(filters)}`),
  listBulkPdcs: (filters: { page?: number; limit?: number }) =>
    apiRequest<Paged<BulkPdcEntry>>(`/ledger/bulk-pdcs${qs(filters)}`),

  createJournalVoucher: (input: JournalVoucherInput) =>
    apiRequest<{ id: number; vsrl: string }>('/ledger/journal-vouchers', { method: 'POST', body: input })
};
