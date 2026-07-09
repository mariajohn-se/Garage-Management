import { queryView, queryViewPaginated, withNextNumericId } from '../db/callProcedure';
import { BookingListItem, BookingInput } from '../models/Booking';

interface BookingRow {
  ID: number;
  BookDt: string | null;
  AppDate: string | null;
  CustID: string | null;
  CustName: string | null;
  VehNo: string | null;
  Make: string | null;
  StaffID: string | null;
  StaffName: string | null;
  Remarks: string | null;
  Status: number | null;
  Ordr: string | null;
}

function toBooking(row: BookingRow): BookingListItem {
  return {
    id: row.ID,
    bookDt: row.BookDt,
    appDate: row.AppDate,
    custId: row.CustID,
    custName: row.CustName,
    vehNo: row.VehNo,
    make: row.Make,
    staffId: row.StaffID,
    staffName: row.StaffName,
    remarks: row.Remarks,
    status: row.Status ?? 0,
    ordr: row.Ordr
  };
}

const SELECT_COLUMNS = 'ID, BookDt, AppDate, CustID, CustName, VehNo, Make, StaffID, StaffName, Remarks, Status, Ordr';

export class BookingRepository {
  async list(filters: { page: number; limit: number }): Promise<{ items: BookingListItem[]; total: number }> {
    const totalRows = await queryView<{ cnt: number }>('SELECT COUNT(*) AS cnt FROM VehicleBookingSql');
    const rows = await queryViewPaginated<BookingRow>(
      SELECT_COLUMNS,
      'VehicleBookingSql',
      '',
      'ID DESC',
      {},
      filters.page,
      filters.limit
    );
    return { items: rows.map(toBooking), total: totalRows[0]?.cnt ?? 0 };
  }

  /** Confirms staffId resolves in StaffSql before insert - see Booking.ts header. */
  async staffExists(staffId: string): Promise<boolean> {
    const rows = await queryView<{ Ocode: string }>('SELECT Ocode FROM StaffSql WHERE Ocode = @staffId', { staffId });
    return rows.length > 0;
  }

  async create(input: BookingInput, userId: string): Promise<number> {
    return withNextNumericId('VehicleBooking', 'ID', async (nextId, req) => {
      await req
        .input('ID', nextId)
        .input('AppDate', input.appDate)
        .input('CustID', input.customerId)
        .input('CustName', input.customerName)
        .input('Address', input.address)
        .input('mobile', input.mobile)
        .input('VehID', input.vehicleId)
        .input('EngineNo', input.engineNo)
        .input('VehNo', input.vehNo)
        .input('RegType', input.regType)
        .input('Make', input.make)
        .input('Colour', input.colour)
        .input('ManYear', input.manYear)
        .input('Remarks', input.remarks)
        .input('StaffID', input.staffId)
        .input('UserID', userId).query(`
          INSERT INTO VehicleBooking
            (ID, BookDt, AppDate, CustID, CustName, Address, mobile, VehID, Ccode, EngineNo, VehNo, RegType, Make, Colour, ManYear, Remarks, StaffID, UserID, Status, CreatedDt)
          VALUES
            (@ID, GETDATE(), @AppDate, @CustID, @CustName, @Address, @mobile, @VehID, '01', @EngineNo, @VehNo, @RegType, @Make, @Colour, @ManYear, @Remarks, @StaffID, @UserID, 0, GETDATE())
        `);
      return nextId;
    });
  }
}

export const bookingRepository = new BookingRepository();
