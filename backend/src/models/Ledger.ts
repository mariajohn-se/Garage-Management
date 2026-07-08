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
