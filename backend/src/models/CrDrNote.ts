/**
 * VERIFIED against the live database (2026-07-09): CrDrNote (681 real rows, no view - read
 * directly off the base table) is paired with a real ACMASTER/ACDETAILS posting for every
 * historical row checked - VTYPE=Type, PAYTYPE='CN'/'DN', ACTEMP=Ac, and two ACDETAILS lines
 * (Ac debited by Amount, Vac credited by Amount) regardless of whether Type is 'Credit' or
 * 'Debit' - Type is a classification tag, not a debit/credit side flip, confirmed by comparing
 * one real Credit-type and one real Debit-type row side by side. CrDrNote.ID/RefNo and
 * ACMASTER.ID/VSRL are independent MAX+1 sequences with no shared table, so - unlike Sales
 * Return - there is no cross-table orphan-collision risk here.
 */
export interface CrDrNoteListItem {
  id: number;
  refNo: string | null;
  refDt: string | null;
  type: string | null;
  vsrl: string | null;
  narration: string | null;
  ac: string | null;
  acName: string | null;
  vac: string | null;
  vacName: string | null;
  amount: number | null;
}

export interface CrDrNoteInput {
  refDt: string;
  type: 'Credit' | 'Debit';
  ac: string;
  vac: string;
  amount: number;
  narration: string | null;
}
