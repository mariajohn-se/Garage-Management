/**
 * VERIFIED against the live CustomerSql/SupplierSql/CustomerVehicleSql views/tables.
 *
 * - `ccode` in both views is a constant company/branch code (single value across all 6565
 *   customer rows and all 430 supplier rows) - NOT a per-record identifier. The real unique
 *   keys are CustId (customer) and SuppID (supplier); everything here is keyed on those.
 * - There is no standalone Contact table/view anywhere in the schema - contact info
 *   (ContactPerson/Phone1/Phone2/email) lives directly on Customer and Supplier records.
 *   FRONTEND_SPEC_v12.md's standalone "Contacts" list/entry/merge screens do not map to any
 *   real entity - see CustomerRepository.ts header.
 * - CustomerVehicleSql is `SELECT * FROM CustomerVehicle`, whose `Ccode` column is NULL on
 *   every single row in production - there is no working link from a vehicle to a customer
 *   anywhere in the schema. Vehicles are modeled here as a standalone entity, not nested
 *   under a customer, and BR-25 (one active customer per vehicle) cannot be implemented or
 *   verified - see VehicleRepository.ts header.
 */
export interface Customer {
  custId: string;
  name: string;
  address: string;
  emirate: string | null;
  contactPerson: string | null;
  phone1: string | null;
  phone2: string | null;
  email: string | null;
  area: string | null;
  isActive: boolean;
  remarks: string | null;
}

export interface Supplier {
  suppId: string;
  name: string;
  address: string;
  emirate: string | null;
  contactPerson: string | null;
  phone1: string | null;
  phone2: string | null;
  email: string | null;
  area: string | null;
  /** Active's polarity (-1 vs 1) could not be confirmed from production data - see
   *  SupplierRepository.ts header. This reflects the raw flag rather than an asserted
   *  active/inactive business meaning. */
  activeFlag: number | null;
  remarks: string | null;
}

export interface Vehicle {
  vehId: number;
  vehNo: string | null;
  make: string | null;
  colour: string | null;
  manYear: string | null;
  engineNo: string | null;
  regType: string | null;
  remarks: string | null;
}

export interface AgewiseBucket {
  bucket: string;
  amount: number;
}

export interface CustomerVisitSummary {
  custId: string;
  name: string;
  phone: string | null;
  fax: string | null;
  email: string | null;
  visitCount: number;
}
