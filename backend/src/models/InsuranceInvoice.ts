/**
 * VERIFIED against the live database (2026-07-09): InsrInvoice01 (1,896 rows) / InsrInvoice02
 * (11,882 rows) - the largest untouched dataset found in the whole PRD audit. InsrInvoice01Sql
 * double INNER JOINs: Estimation01Sql ON EstimationNo, AND Sales01Sql ON InternalInvNo = Bill -
 * so a new insurance invoice needs BOTH a real, existing EstimationNo AND a real, existing
 * Sales01 Bill number to be visible on any read path, or it silently vanishes (the same
 * invisible-row class as Estimation's StaffId/VehicleId and VehicleBooking's StaffID). Both are
 * independently validated before insert. InsrInvoice02 already has 43 orphaned rows with no
 * matching InsrInvoice01 header (the same legacy defect class found in SReturn02) - ID is
 * computed as MAX+1 across BOTH tables, the fix already proven on Sales Return. BillNo is
 * InsrInvoice01's own separate invoice-number sequence (unrelated to the linked Sales Bill
 * number), MAX+1 within InsrInvoice01 alone since InsrInvoice02 has no BillNo column.
 * CustomerName/CustTel are free-text snapshot fields (e.g. the insurer's name/phone), not a real
 * link to Customer - real historical rows show insurer names here, distinct from the linked
 * Estimation's actual vehicle-owner customer.
 */
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
