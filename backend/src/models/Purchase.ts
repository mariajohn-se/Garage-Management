/**
 * VERIFIED against the live database. LocalPurchase01Sql (20769 rows), Porder01Sql (7434
 * rows, foreign POs), PurchaseDo01Sql (6426 rows, delivery orders), PurchaseDo02Sql (37843
 * rows, DO line items), ProdRequest01Sql (189 rows), Preturn01 (222 rows, no resolved view -
 * read directly per STANDARDS.md's "no view exists" allowance), PurchaseVehicleLink (222
 * rows) all exist with real data. `PendingPurchaseDO` is a real, documented STORED PROCEDURE
 * (not a table/view - `SELECT * FROM PendingPurchaseDO` fails with "Invalid object name";
 * it must be invoked via callProcedure) - verified live, returns 81 real rows.
 */
export interface PurchaseLineItem {
  itemCode: string;
  description?: string;
  qty: number;
  rate: number;
}

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
