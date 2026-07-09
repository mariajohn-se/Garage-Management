/**
 * VERIFIED against the live database (2026-07-09): VehicleBooking (10 real rows) is a
 * denormalized appointment table - CustName/Address/mobile and VehNo/EngineNo/Make/Colour/
 * ManYear/RegType are snapshotted at booking time, not live-joined to Customer/Vehicle. ID has
 * no identity backing (same MAX+1 pattern as other legacy tables here). VehicleBookingSql (the
 * real read view) does `INNER JOIN StaffSql ON VehicleBooking.StaffID = StaffSql.Ocode` - an
 * unmatched or blank StaffID makes a new booking invisible on every read path, the same
 * invisible-row risk found in Estimation01Sql/StaffId - so StaffId is required and validated
 * against StaffSql before insert, even though the column itself is nullable.
 */
export interface BookingListItem {
  id: number;
  bookDt: string | null;
  appDate: string | null;
  custId: string | null;
  custName: string | null;
  vehNo: string | null;
  make: string | null;
  staffId: string | null;
  staffName: string | null;
  remarks: string | null;
  status: number;
  ordr: string | null;
}

export interface BookingInput {
  appDate: string;
  customerId: string;
  customerName: string;
  address: string | null;
  mobile: string | null;
  vehicleId: number;
  vehNo: string | null;
  engineNo: string | null;
  regType: string | null;
  make: string | null;
  colour: string | null;
  manYear: string | null;
  staffId: string;
  remarks: string | null;
}
