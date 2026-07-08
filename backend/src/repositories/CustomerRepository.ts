import { queryView, queryViewPaginated, callProcedure, executeWrite, withNextNumericId } from '../db/callProcedure';
import { Customer, AgewiseBucket } from '../models/Party';

/**
 * VERIFIED against the live CustomerSql view (30 columns, 6565 real rows in production).
 * `ccode` is a constant company code, not a per-row key - CustId is the real identifier
 * (confirmed distinct-count = row-count). `Active` is 1 for 6551 rows and 0 for only 14 rows
 * whose names are clearly internal/system placeholders ("WORKSHOP", "TEM (GOODWILL)", etc.),
 * not real customers - so Active=1 is treated as active here with reasonable confidence.
 *
 * This is a large real production table - list() is paginated server-side; never SELECT *
 * without OFFSET/FETCH here.
 *
 * IMPLEMENTATION_PHASE3_v12.md's own repository guidance calls CustomerSql via
 * callProcedure(), but CustomerSql is a VIEW per DB_CONNECTION_SPEC_v12.md, not a stored
 * procedure - followed STANDARDS.md's actual rule instead (SELECT from the view), consistent
 * with every other phase's read path in this codebase.
 */

interface CustomerRow {
  CustId: string;
  custname: string;
  Address1: string | null;
  Address2: string | null;
  Address3: string | null;
  Emirates: string | null;
  ContactPerson: string | null;
  Phone1: string | null;
  Phone2: string | null;
  email: string | null;
  Areaname: string | null;
  Active: number | null;
  Remarks: string | null;
}

function toCustomer(row: CustomerRow): Customer {
  return {
    custId: row.CustId,
    name: row.custname,
    address: [row.Address1, row.Address2, row.Address3].filter(Boolean).join(', '),
    emirate: row.Emirates,
    contactPerson: row.ContactPerson,
    phone1: row.Phone1,
    phone2: row.Phone2,
    email: row.email,
    area: row.Areaname,
    isActive: (row.Active ?? 1) !== 0,
    remarks: row.Remarks
  };
}

// Use the view's resolved display-name columns (Areaname/Emirates), not the raw code
// columns (area/Emirate) - showing raw codes instead of names would violate the "no raw IDs"
// rule (FRONTEND_SPEC_v12.md/IMPLEMENTATION_PHASE3_v12.md item 17).
const SELECT_COLUMNS = `CustId, custname, Address1, Address2, Address3, Emirates, ContactPerson,
              Phone1, Phone2, email, Areaname, Active, Remarks`;

export class CustomerRepository {
  async list(filters: {
    name?: string;
    phone?: string;
    status?: 'active' | 'inactive';
    page: number;
    limit: number;
  }): Promise<{ items: Customer[]; total: number }> {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};
    if (filters.name) {
      conditions.push('custname LIKE @name');
      params.name = `%${filters.name}%`;
    }
    if (filters.phone) {
      conditions.push('(Phone1 LIKE @phone OR Phone2 LIKE @phone)');
      params.phone = `%${filters.phone}%`;
    }
    if (filters.status) {
      conditions.push(filters.status === 'active' ? '(Active <> 0 OR Active IS NULL)' : 'Active = 0');
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const totalRows = await queryView<{ cnt: number }>(`SELECT COUNT(*) AS cnt FROM CustomerSql ${where}`, params);
    const total = totalRows[0]?.cnt ?? 0;

    const rows = await queryViewPaginated<CustomerRow>(
      SELECT_COLUMNS,
      'CustomerSql',
      where,
      'custname',
      params,
      filters.page,
      filters.limit
    );
    return { items: rows.map(toCustomer), total };
  }

  async findByCustId(custId: string): Promise<Customer | null> {
    const rows = await queryView<CustomerRow>(`SELECT ${SELECT_COLUMNS} FROM CustomerSql WHERE CustId = @custId`, {
      custId
    });
    return rows.length ? toCustomer(rows[0]) : null;
  }

  /** BR-21: unique name+phone combo - read-only check used before create. */
  async findDuplicate(name: string, phone: string): Promise<Customer | null> {
    const rows = await queryView<CustomerRow>(
      `SELECT TOP 1 ${SELECT_COLUMNS}
       FROM CustomerSql WHERE custname = @name AND (Phone1 = @phone OR Phone2 = @phone)`,
      { name, phone }
    );
    return rows.length ? toCustomer(rows[0]) : null;
  }

  /**
   * Customer.CustId (PK) has no identity/sequence backing it live (verified 2026-07-07) - the
   * legacy app generated it as MAX+1 over the numeric-string column. withNextNumericId() takes
   * a serializable-transaction lock on that read so two concurrent creates can't collide.
   * `ccode` is always '01' in production (single-company install) - the same constant Company
   * and Supplier use.
   *
   * NOTE: `area` is nvarchar(6) on the real Customer table - it stores an area CODE, not the
   * free-text area name the CustomerSql view resolves for reads. Passing a free-text name here
   * will throw "String or binary data would be truncated" for anything over 6 chars. Until the
   * frontend sends a real area code (e.g. a dropdown of valid codes), area writes are dropped
   * rather than guessed.
   */
  async create(input: Omit<Customer, 'custId'>): Promise<string> {
    return withNextNumericId('Customer', 'CustId', async (nextId, req) => {
      const custId = String(nextId);
      const area = input.area && input.area.length <= 6 ? input.area : null;
      await req
        .input('CustId', custId)
        .input('custname', input.name)
        .input('Address1', input.address ?? null)
        .input('Phone1', input.phone1 ?? null)
        .input('Phone2', input.phone2 ?? null)
        .input('email', input.email ?? null)
        .input('ContactPerson', input.contactPerson ?? null)
        .input('area', area)
        .input('Remarks', input.remarks ?? null)
        .input('Active', input.isActive === false ? 0 : 1).query(`
          INSERT INTO Customer (ccode, CustId, custname, Address1, Phone1, Phone2, email, ContactPerson, area, Remarks, Active)
          VALUES ('01', @CustId, @custname, @Address1, @Phone1, @Phone2, @email, @ContactPerson, @area, @Remarks, @Active)
        `);
      return custId;
    });
  }

  async update(custId: string, changes: Partial<Omit<Customer, 'custId'>>): Promise<void> {
    const sets: string[] = [];
    const params: Record<string, unknown> = { custId };
    if (changes.name !== undefined) { sets.push('custname = @custname'); params.custname = changes.name; }
    if (changes.address !== undefined) { sets.push('Address1 = @Address1'); params.Address1 = changes.address; }
    if (changes.phone1 !== undefined) { sets.push('Phone1 = @Phone1'); params.Phone1 = changes.phone1; }
    if (changes.phone2 !== undefined) { sets.push('Phone2 = @Phone2'); params.Phone2 = changes.phone2; }
    if (changes.email !== undefined) { sets.push('email = @email'); params.email = changes.email; }
    if (changes.contactPerson !== undefined) { sets.push('ContactPerson = @ContactPerson'); params.ContactPerson = changes.contactPerson; }
    if (changes.area !== undefined && (changes.area === null || changes.area.length <= 6)) {
      sets.push('area = @area');
      params.area = changes.area;
    }
    if (changes.remarks !== undefined) { sets.push('Remarks = @Remarks'); params.Remarks = changes.remarks; }
    if (changes.isActive !== undefined) { sets.push('Active = @Active'); params.Active = changes.isActive ? 1 : 0; }
    if (!sets.length) return;
    await executeWrite(`UPDATE Customer SET ${sets.join(', ')} WHERE CustId = @custId`, params);
  }

  async delete(custId: string): Promise<void> {
    await executeWrite('DELETE FROM Customer WHERE CustId = @custId', { custId });
  }

  /**
   * VERIFIED FINDING: AgewiseSummary (real, documented in DB_CONNECTION_SPEC_v12.md) throws
   * "Cannot resolve the collation conflict between Latin1_General_CI_AS and
   * SQL_Latin1_General_CP1_CI_AS" for every parameter combination tried against the live DB -
   * a pre-existing bug inside the stored procedure itself (comparing columns of differing
   * collations), not something introduced or fixable here (DB-Preserve mode forbids altering
   * procedures). This method calls it faithfully per the documented signature; the /agewise
   * endpoint and frontend page surface whatever error it throws rather than masking it.
   */
  async agewise(asOfDate: string): Promise<AgewiseBucket[]> {
    const rows = await callProcedure<Record<string, unknown>>('AgewiseSummary', {
      mDate: asOfDate,
      mActualDate: 0,
      Customer: 1,
      Supplier: 0,
      mCode: null,
      mDatewise: 0,
      mContactdate: null,
      ReportType: 0
    });
    return rows.map((r) => ({ bucket: String(r.description ?? r.Name ?? ''), amount: Number(r.Tot ?? 0) }));
  }
}

export const customerRepository = new CustomerRepository();
