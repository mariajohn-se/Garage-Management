import { queryView, queryViewPaginated, callProcedure } from '../db/callProcedure';
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

  // Placeholder procedure names - not confirmed against the real SP catalog (same caveat as
  // every write path in this codebase so far). NOT executed against production in this
  // build's verification - this is 6565 rows of real customer data.
  async create(input: Omit<Customer, 'custId'>): Promise<string> {
    const rows = await callProcedure<{ CustId: string }>('sp_CreateCustomer', {
      CustName: input.name,
      Phone1: input.phone1,
      Phone2: input.phone2,
      Email: input.email,
      ContactPerson: input.contactPerson,
      Area: input.area,
      Remarks: input.remarks
    });
    return rows[0]?.CustId;
  }

  async update(custId: string, changes: Partial<Omit<Customer, 'custId'>>): Promise<void> {
    await callProcedure('sp_UpdateCustomer', {
      CustId: custId,
      CustName: changes.name,
      Phone1: changes.phone1,
      Phone2: changes.phone2,
      Email: changes.email,
      ContactPerson: changes.contactPerson,
      Area: changes.area,
      Remarks: changes.remarks,
      Active: changes.isActive === undefined ? undefined : changes.isActive ? 1 : 0
    });
  }

  async delete(custId: string): Promise<void> {
    await callProcedure('sp_DeleteCustomer', { CustId: custId });
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
