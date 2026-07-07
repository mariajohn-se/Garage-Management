import { queryView, queryViewPaginated, callProcedure } from '../db/callProcedure';
import { Vehicle } from '../models/Party';

/**
 * VERIFIED FINDING: CustomerVehicleSql is `SELECT CustomerVehicle.* FROM CustomerVehicle`,
 * and the base table's `Ccode` column is NULL on every one of its 7442 rows in production -
 * there is no working link from a vehicle to a customer anywhere in this schema.
 * FRONTEND_SPEC_v12.md/IMPLEMENTATION_PHASE3_v12.md both assume vehicles are looked up
 * "by customer" (routes like /customers/:customerId/vehicles) - that isn't supported by the
 * real data, so vehicles are modeled and routed here as a standalone entity, and BR-25 ("a
 * vehicle can only be linked to one active customer at a time") cannot be implemented or
 * verified. The actual customer<->vehicle relationship, if one exists at all, must live in a
 * table this build didn't need to touch (e.g. job/order records referencing both a customer
 * and a VehID) - confirm with someone who knows the legacy app before assuming otherwise.
 */

interface VehicleRow {
  VehID: number;
  VehNo: string | null;
  Make: string | null;
  Colour: string | null;
  ManYear: string | null;
  EngineNo: string | null;
  RegType: string | null;
  Remarks: string | null;
}

function toVehicle(row: VehicleRow): Vehicle {
  return {
    vehId: row.VehID,
    vehNo: row.VehNo,
    make: row.Make,
    colour: row.Colour,
    manYear: row.ManYear,
    engineNo: row.EngineNo,
    regType: row.RegType,
    remarks: row.Remarks
  };
}

const SELECT_COLUMNS = `VehID, VehNo, Make, Colour, ManYear, EngineNo, RegType, Remarks`;

export class VehicleRepository {
  async list(filters: { search?: string; page: number; limit: number }): Promise<{ items: Vehicle[]; total: number }> {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};
    if (filters.search) {
      conditions.push('(VehNo LIKE @search OR EngineNo LIKE @search OR Make LIKE @search)');
      params.search = `%${filters.search}%`;
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const totalRows = await queryView<{ cnt: number }>(
      `SELECT COUNT(*) AS cnt FROM CustomerVehicleSql ${where}`,
      params
    );
    const total = totalRows[0]?.cnt ?? 0;

    const rows = await queryViewPaginated<VehicleRow>(
      SELECT_COLUMNS,
      'CustomerVehicleSql',
      where,
      'VehNo',
      params,
      filters.page,
      filters.limit
    );
    return { items: rows.map(toVehicle), total };
  }

  async findById(vehId: number): Promise<Vehicle | null> {
    const rows = await queryView<VehicleRow>(`SELECT ${SELECT_COLUMNS} FROM CustomerVehicleSql WHERE VehID = @vehId`, {
      vehId
    });
    return rows.length ? toVehicle(rows[0]) : null;
  }

  // Placeholder procedure names - not confirmed against the real SP catalog. NOT executed
  // against production in this build's verification - this is 7442 rows of real vehicle data.
  async create(input: Omit<Vehicle, 'vehId'>): Promise<number> {
    const rows = await callProcedure<{ VehID: number }>('sp_CreateCustomerVehicle', {
      VehNo: input.vehNo,
      Make: input.make,
      Colour: input.colour,
      ManYear: input.manYear,
      EngineNo: input.engineNo,
      RegType: input.regType,
      Remarks: input.remarks
    });
    return rows[0]?.VehID;
  }

  async update(vehId: number, changes: Partial<Omit<Vehicle, 'vehId'>>): Promise<void> {
    await callProcedure('sp_UpdateCustomerVehicle', {
      VehID: vehId,
      VehNo: changes.vehNo,
      Make: changes.make,
      Colour: changes.colour,
      ManYear: changes.manYear,
      EngineNo: changes.engineNo,
      RegType: changes.regType,
      Remarks: changes.remarks
    });
  }

  async delete(vehId: number): Promise<void> {
    await callProcedure('sp_DeleteCustomerVehicle', { VehID: vehId });
  }
}

export const vehicleRepository = new VehicleRepository();
