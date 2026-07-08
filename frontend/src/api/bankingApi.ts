import { apiRequest } from './client';

export interface VoucherListItem {
  id: number;
  vsrl: string | null;
  date: string | null;
  vtype: string | null;
  payType: string | null;
  narration: string | null;
  refNo: string | null;
  description: string | null;
  curBal: number | null;
  checked: boolean;
}

export interface VoucherLine {
  id: number;
  vsrl: string | null;
  ac: string | null;
  date: string | null;
  debit: number | null;
  credit: number | null;
  description: string | null;
  narration: string | null;
}

export interface VoucherDetail extends VoucherListItem {
  lines: VoucherLine[];
}

export interface BankAccount {
  code: string;
  description: string | null;
  bankType: number | null;
}

export interface CashBankEntry {
  id: number;
  vsrl: string | null;
  ac: string | null;
  date: string | null;
  debit: number | null;
  credit: number | null;
  description: string | null;
  vtype: string | null;
  chq: string | null;
  narration: string | null;
  curBal: number | null;
}

export interface VoucherVerificationItem {
  id: number;
  vsrl: string | null;
  date: string | null;
  vtype: string | null;
  payType: string | null;
  description: string | null;
  editCount: number | null;
}

export interface AccountFilterItem {
  id: number;
  vsrl: string | null;
  ac: string | null;
  accountName: string | null;
  date: string | null;
  debit: number | null;
  credit: number | null;
  vtype: string | null;
  narration: string | null;
  refNo: string | null;
}

export interface VoucherActionLogItem {
  id: number;
  vsrl: string | null;
  userId: string | null;
  date: string | null;
  remarks: string | null;
  status: string | null;
}

export interface ReceiptPaymentLineInput {
  ac: string;
  amount: number;
  description?: string;
}

export interface ReceiptPaymentVoucherInput {
  type: 'Receipt' | 'Payment';
  date: string;
  cashBankAc: string;
  narration: string;
  chq?: string;
  lines: ReceiptPaymentLineInput[];
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

export const bankingApi = {
  listVouchers: (filters: { vtype?: string; payType?: string; page?: number; limit?: number }) =>
    apiRequest<Paged<VoucherListItem>>(`/vouchers${qs(filters)}`),
  getVoucher: (id: number, vsrl: string) => apiRequest<VoucherDetail>(`/vouchers/${id}${qs({ vsrl })}`),

  listBankAccounts: () => apiRequest<BankAccount[]>('/banking/accounts'),
  cashBankDetails: (account: string, fromDate: string, toDate: string, type = 'All') =>
    apiRequest<CashBankEntry[]>(`/banking/cash-bank-details${qs({ account, fromDate, toDate, type })}`),

  listVerification: (checked: boolean, payType?: string) =>
    apiRequest<VoucherVerificationItem[]>(`/banking/verification${qs({ checked, payType })}`),
  markVerified: (vsrl: string) =>
    apiRequest<{ message: string }>(`/banking/verification/${encodeURIComponent(vsrl)}`, { method: 'PUT' }),

  filterAccountEntries: (dateFrom: string, dateTo: string, ac?: string) =>
    apiRequest<AccountFilterItem[]>(`/banking/account-filter${qs({ dateFrom, dateTo, ac })}`),
  voucherActionLog: (filters: { vsrl?: string; page?: number; limit?: number }) =>
    apiRequest<Paged<VoucherActionLogItem>>(`/banking/action-log${qs(filters)}`),

  createReceiptPaymentVoucher: (input: ReceiptPaymentVoucherInput) =>
    apiRequest<{ id: number; vsrl: string }>('/vouchers/receipt-payment', { method: 'POST', body: input })
};
