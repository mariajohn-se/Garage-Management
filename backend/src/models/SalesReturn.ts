/**
 * VERIFIED against the live database (2026-07-09): SReturn01 (17 rows) / SReturn02 (30 rows).
 * SReturn01Sql INNER JOINs Customer on CustID, and SReturn02Sql INNER JOINs both ItemsSql (on
 * ItemCode) and SReturn01Sql (on ID) - so an unmatched CustID or ItemCode makes the whole
 * return invisible on every read path. Both are validated before insert. Ac is a constant
 * sentinel ('SRETURN', a real ACHEAD row: "SALES RETURN A/C"), the same pattern as Journal
 * Voucher's ACTEMP='000000'. CorQ is the same Cash/Credit payment-type flag used across
 * LocalPurchase01/ProformaSales01/Sales01 in this schema, not a "Credit Note" concept.
 */
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
