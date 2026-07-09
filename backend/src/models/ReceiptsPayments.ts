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
