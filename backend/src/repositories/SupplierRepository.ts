import { queryView, queryViewPaginated, callProcedure } from '../db/callProcedure';
import { Supplier } from '../models/Party';

/**
 * VERIFIED against the live SupplierSql view (30 columns, 430 real rows in production).
 * `ccode` is a constant company code, not a per-row key - SuppID is the real identifier.
 *
 * UNRESOLVED: Active takes only two values in production, -1 (237 rows) and 1 (193 rows) -
 * unlike Customer's clearly-skewed 0/1 split, there's no data pattern here that confidently
 * indicates which value means "active" (both groups contain well-known real supplier names).
 * Rather than guess and risk mislabeling real suppliers as inactive, this repository exposes
 * the raw flag as `activeFlag` and the UI does not assert an active/inactive meaning for it.
 * Confirm with someone who knows the legacy app before using this for any business decision
 * (e.g. BR-22's "cannot deactivate supplier with active transactions").
 */

interface SupplierRow {
  SuppID: string;
  SuppName: string;
  Address1: string | null;
  Address2: string | null;
  Address3: string | null;
  Emirates: string | null;
  ContactPerson: string | null;
  Phone1: string | null;
  Phone2: string | null;
  email: string | null;
  AreaName: string | null;
  Active: number | null;
  Remarks: string | null;
}

function toSupplier(row: SupplierRow): Supplier {
  return {
    suppId: row.SuppID,
    name: row.SuppName,
    address: [row.Address1, row.Address2, row.Address3].filter(Boolean).join(', '),
    emirate: row.Emirates,
    contactPerson: row.ContactPerson,
    phone1: row.Phone1,
    phone2: row.Phone2,
    email: row.email,
    area: row.AreaName,
    activeFlag: row.Active,
    remarks: row.Remarks
  };
}

// Use the view's resolved display-name columns (AreaName/Emirates), not the raw code
// columns (area/Emirate) - showing raw codes instead of names would violate the "no raw IDs"
// rule (FRONTEND_SPEC_v12.md/IMPLEMENTATION_PHASE3_v12.md item 17).
const SELECT_COLUMNS = `SuppID, SuppName, Address1, Address2, Address3, Emirates, ContactPerson,
              Phone1, Phone2, email, AreaName, Active, Remarks`;

export class SupplierRepository {
  async list(filters: { name?: string; phone?: string; page: number; limit: number }): Promise<{
    items: Supplier[];
    total: number;
  }> {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};
    if (filters.name) {
      conditions.push('SuppName LIKE @name');
      params.name = `%${filters.name}%`;
    }
    if (filters.phone) {
      conditions.push('(Phone1 LIKE @phone OR Phone2 LIKE @phone)');
      params.phone = `%${filters.phone}%`;
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const totalRows = await queryView<{ cnt: number }>(`SELECT COUNT(*) AS cnt FROM SupplierSql ${where}`, params);
    const total = totalRows[0]?.cnt ?? 0;

    const rows = await queryViewPaginated<SupplierRow>(
      SELECT_COLUMNS,
      'SupplierSql',
      where,
      'SuppName',
      params,
      filters.page,
      filters.limit
    );
    return { items: rows.map(toSupplier), total };
  }

  async findBySuppId(suppId: string): Promise<Supplier | null> {
    const rows = await queryView<SupplierRow>(`SELECT ${SELECT_COLUMNS} FROM SupplierSql WHERE SuppID = @suppId`, {
      suppId
    });
    return rows.length ? toSupplier(rows[0]) : null;
  }

  async findDuplicate(name: string, phone: string): Promise<Supplier | null> {
    const rows = await queryView<SupplierRow>(
      `SELECT TOP 1 ${SELECT_COLUMNS}
       FROM SupplierSql WHERE SuppName = @name AND (Phone1 = @phone OR Phone2 = @phone)`,
      { name, phone }
    );
    return rows.length ? toSupplier(rows[0]) : null;
  }

  // Placeholder procedure names - not confirmed against the real SP catalog. NOT executed
  // against production in this build's verification - this is 430 rows of real supplier data.
  async create(input: Omit<Supplier, 'suppId'>): Promise<string> {
    const rows = await callProcedure<{ SuppID: string }>('sp_CreateSupplier', {
      SuppName: input.name,
      Phone1: input.phone1,
      Phone2: input.phone2,
      Email: input.email,
      ContactPerson: input.contactPerson,
      Area: input.area,
      Remarks: input.remarks
    });
    return rows[0]?.SuppID;
  }

  async update(suppId: string, changes: Partial<Omit<Supplier, 'suppId'>>): Promise<void> {
    await callProcedure('sp_UpdateSupplier', {
      SuppId: suppId,
      SuppName: changes.name,
      Phone1: changes.phone1,
      Phone2: changes.phone2,
      Email: changes.email,
      ContactPerson: changes.contactPerson,
      Area: changes.area,
      Remarks: changes.remarks
    });
  }

  async delete(suppId: string): Promise<void> {
    await callProcedure('sp_DeleteSupplier', { SuppId: suppId });
  }
}

export const supplierRepository = new SupplierRepository();
