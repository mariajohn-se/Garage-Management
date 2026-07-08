import { queryView, queryViewPaginated, executeWrite, withNextNumericId } from '../db/callProcedure';
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
   * VERIFIED FINDING (2026-07-08): AgewiseSummary throws "Cannot resolve the collation conflict
   * between Latin1_General_CI_AS and SQL_Latin1_General_CP1_CI_AS" on every call - traced to a
   * real environment defect, not a param issue: the SQL Server instance's tempdb defaults to
   * Latin1_General_CI_AS while the autodealer DB (and every real column - ACHEAD.CODES,
   * acdetails.AC, etc.) is SQL_Latin1_General_CP1_CI_AS. The procedure's #tmp1/#tmp2 temp
   * tables inherit tempdb's collation, so every join between them and a real table conflicts.
   * STANDARDS.md's DB-Preserve mode forbids altering the procedure to add explicit COLLATE
   * clauses, so this reimplements its Customer-mode/as-of-date aging math directly as CTEs
   * (verified against the procedure's own source via OBJECT_DEFINITION) - CTEs inherit
   * collation from their source columns, never from tempdb, so the conflict never arises.
   *
   * Also fixes a pre-existing mapping bug: AgewiseSummary returns one row per customer account
   * with per-bucket columns (D15/D30/.../D360), not one row per bucket - the old code read
   * `description`/`Tot` off that per-account row as if it were a bucket label/amount. This
   * returns the real aging-bucket summary: total outstanding (net of receipts, oldest-first,
   * matching the procedure's own waterfall) across all customer accounts, per bucket.
   */
  async agewise(asOfDate: string): Promise<AgewiseBucket[]> {
    const rows = await queryView<{
      D15: number | null;
      D30: number | null;
      D60: number | null;
      D90: number | null;
      D120: number | null;
      D360: number | null;
    }>(
      `WITH accounts AS (
         SELECT CODES AS ac FROM ACHEAD WHERE CUSTOMER = 1
       ),
       raw AS (
         SELECT
           a.ac,
           SUM(CASE WHEN d.cred > 0 THEN d.cred ELSE 0 END) AS rcpt,
           SUM(CASE WHEN d.debt > 0 THEN d.debt ELSE 0 END) AS tot,
           SUM(CASE WHEN DATEDIFF(day, d.date, @mDate) <= 15 THEN d.debt ELSE 0 END) AS D15,
           SUM(CASE WHEN DATEDIFF(day, d.date, @mDate) BETWEEN 16 AND 30 THEN d.debt ELSE 0 END) AS D30,
           SUM(CASE WHEN DATEDIFF(day, d.date, @mDate) BETWEEN 31 AND 60 THEN d.debt ELSE 0 END) AS D60,
           SUM(CASE WHEN DATEDIFF(day, d.date, @mDate) BETWEEN 61 AND 90 THEN d.debt ELSE 0 END) AS D90,
           SUM(CASE WHEN DATEDIFF(day, d.date, @mDate) BETWEEN 91 AND 120 THEN d.debt ELSE 0 END) AS D120,
           SUM(CASE WHEN DATEDIFF(day, d.date, @mDate) > 120 THEN d.debt ELSE 0 END) AS D360
         FROM accounts a
         JOIN acdetails d ON d.ac = a.ac AND d.date <= @mDate
         GROUP BY a.ac
         HAVING ROUND(SUM(CASE WHEN d.cred > 0 THEN d.cred ELSE 0 END), 2) <
                ROUND(SUM(CASE WHEN d.debt > 0 THEN d.debt ELSE 0 END), 2)
       ),
       step1 AS (
         SELECT *,
           CASE WHEN D360 <= rcpt THEN 0 ELSE D360 - rcpt END AS D360n,
           CASE WHEN rcpt >= D360 THEN rcpt - D360 ELSE 0 END AS rem1
         FROM raw
       ),
       step2 AS (
         SELECT *,
           CASE WHEN D120 <= rem1 THEN 0 ELSE D120 - rem1 END AS D120n,
           CASE WHEN rem1 >= D120 THEN rem1 - D120 ELSE 0 END AS rem2
         FROM step1
       ),
       step3 AS (
         SELECT *,
           CASE WHEN D90 <= rem2 THEN 0 ELSE D90 - rem2 END AS D90n,
           CASE WHEN rem2 >= D90 THEN rem2 - D90 ELSE 0 END AS rem3
         FROM step2
       ),
       step4 AS (
         SELECT *,
           CASE WHEN D60 <= rem3 THEN 0 ELSE D60 - rem3 END AS D60n,
           CASE WHEN rem3 >= D60 THEN rem3 - D60 ELSE 0 END AS rem4
         FROM step3
       ),
       step5 AS (
         SELECT *,
           CASE WHEN D30 <= rem4 THEN 0 ELSE D30 - rem4 END AS D30n,
           CASE WHEN rem4 >= D30 THEN rem4 - D30 ELSE 0 END AS rem5
         FROM step4
       ),
       final AS (
         SELECT *,
           CASE WHEN D15 <= rem5 THEN 0 ELSE D15 - rem5 END AS D15n
         FROM step5
       )
       SELECT
         SUM(D15n) AS D15, SUM(D30n) AS D30, SUM(D60n) AS D60,
         SUM(D90n) AS D90, SUM(D120n) AS D120, SUM(D360n) AS D360
       FROM final`,
      { mDate: asOfDate }
    );
    const r = rows[0];
    if (!r) return [];
    return [
      { bucket: '0-15 Days', amount: r.D15 ?? 0 },
      { bucket: '16-30 Days', amount: r.D30 ?? 0 },
      { bucket: '31-60 Days', amount: r.D60 ?? 0 },
      { bucket: '61-90 Days', amount: r.D90 ?? 0 },
      { bucket: '91-120 Days', amount: r.D120 ?? 0 },
      { bucket: 'Over 120 Days', amount: r.D360 ?? 0 }
    ];
  }
}

export const customerRepository = new CustomerRepository();
