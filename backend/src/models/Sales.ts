/**
 * VERIFIED against the live database. SalesOrdr01Sql (22835 rows), Delivery01Sql (42711
 * rows), Sales01Sql (23021 rows), and ProformaSales01Sql (372 rows) all exist with
 * substantial real data. SalesReturn01/SalesReturnBillSql do NOT exist anywhere in the schema
 * (`Invalid object name`) - the Sales Return module was not built, see SalesRepository.ts.
 * `PendingOrder` exists but throws "Could not use view or function ... because of binding
 * errors" - a pre-existing broken view, not something introduced or fixable here.
 */
export interface SalesOrder {
  id: number;
  ordr: string;
  orderDate: string | null;
  custId: string | null;
  customerName: string | null;
  vehId: number | null;
  vehNo: string | null;
  staffName: string | null;
  total: number | null;
  net: number | null;
  delivered: boolean;
  invoiced: boolean;
  closed: boolean;
  jobStatus: string | null;
  billNo: string | null;
  billDate: string | null;
  custNote: string | null;
}

export interface OrderLineItem {
  itemCode: string;
  description?: string;
  qty: number;
  rate: number;
  discount?: number;
}

export interface DeliveryNote {
  id: number;
  doNo: string | null;
  doDate: string | null;
  ordr: string | null;
  customerName: string | null;
  vehNo: string | null;
  total: number | null;
  net: number | null;
  remarks: string | null;
}

export interface SalesInvoice {
  id: number;
  bill: string | null;
  billDate: string | null;
  ordr: string | null;
  customerName: string | null;
  vehNo: string | null;
  total: number | null;
  net: number | null;
  delivered: boolean;
  paid: string | null;
}

export interface Proforma {
  id: number;
  bill: string | null;
  billDate: string | null;
  ordr: string | null;
  customerName: string | null;
  vehNo: string | null;
  total: number | null;
  net: number | null;
  voucherType: string | null;
}
