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
