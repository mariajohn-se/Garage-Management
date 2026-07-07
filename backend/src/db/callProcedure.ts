import mssql from 'mssql';
import { getPool } from './connection';
import { logger } from '../utils/logger';

/**
 * Execute a SQL Server stored procedure with named parameters.
 * STANDARDS.md (DB-Preserve mode) originally required all writes to go through a stored
 * procedure. Live-DB inspection (2026-07-07) found the real catalog has 111 procedures, all
 * read/report-only - none of the ~29 create/update/delete procedure names referenced across
 * this codebase's repositories actually exist. Writes now go through executeWrite() below
 * instead; callProcedure() remains for the real report procedures.
 */
export async function callProcedure<T = any>(
  procName: string,
  inputParams: Record<string, unknown> = {}
): Promise<T[]> {
  const pool = await getPool();
  const req = pool.request();
  Object.entries(inputParams).forEach(([key, value]) => {
    req.input(key, value as mssql.ISqlTypeFactory | any);
  });
  try {
    const result = await req.execute(procName);
    return result.recordset as unknown as T[];
  } catch (err) {
    logger.error('Stored procedure execution failed', {
      procedure: procName,
      error: (err as Error).message
    });
    throw err;
  }
}

/**
 * Page through a view/table on SQL Server 2008 R2 (verified live: `SERVERPROPERTY
 * ('ProductVersion')` = 10.50.x), which predates `OFFSET ... FETCH NEXT` (added in SQL
 * Server 2012/11.0) - attempting it here throws "Invalid usage of the option NEXT in the
 * FETCH statement" because the 2008 parser reads FETCH NEXT as the older cursor syntax.
 * Uses the SQL Server 2005+ compatible ROW_NUMBER() windowing pattern instead.
 */
export async function queryViewPaginated<T = any>(
  columns: string,
  from: string,
  where: string,
  orderBy: string,
  params: Record<string, unknown>,
  page: number,
  limit: number
): Promise<T[]> {
  const start = (page - 1) * limit + 1;
  const end = page * limit;
  return queryView<T>(
    `SELECT ${columns} FROM (
       SELECT ${columns}, ROW_NUMBER() OVER (ORDER BY ${orderBy}) AS __rn
       FROM ${from} ${where}
     ) AS paged
     WHERE __rn BETWEEN @__start AND @__end`,
    { ...params, __start: start, __end: end }
  );
}

/**
 * Run a parameterized read against a legacy *Sql view (STRATEGY B).
 * Never hand-join base tables - query the most-resolved view for the entity.
 *
 * Integer values are bound explicitly as mssql.Int. Without this, the driver can infer a
 * numeric JS value as a type SQL Server's parser rejects in `OFFSET ... FETCH NEXT ... ROWS
 * ONLY` ("Invalid usage of the option NEXT in the FETCH statement") - a known mssql/tedious
 * gotcha, verified by hitting it live against the real DB while building pagination here.
 */
export async function queryView<T = any>(sql: string, inputParams: Record<string, unknown> = {}): Promise<T[]> {
  const pool = await getPool();
  const req = pool.request();
  Object.entries(inputParams).forEach(([key, value]) => {
    if (typeof value === 'number' && Number.isInteger(value)) {
      req.input(key, mssql.Int, value);
    } else {
      req.input(key, value as any);
    }
  });
  const result = await req.query(sql);
  return result.recordset as unknown as T[];
}

/**
 * Parameterized INSERT/UPDATE/DELETE against a base table. See the note on callProcedure()
 * above - no stored procedure exists in the live catalog for any entity write, so repositories
 * write directly to base tables through this helper instead. Always bind values via
 * inputParams/@paramName, never string-interpolate user-controlled values into `sql`.
 * Returns the recordset from an OUTPUT clause when the caller uses one, else [].
 */
export async function executeWrite<T = any>(sql: string, inputParams: Record<string, unknown> = {}): Promise<T[]> {
  const pool = await getPool();
  const req = pool.request();
  Object.entries(inputParams).forEach(([key, value]) => {
    if (typeof value === 'number' && Number.isInteger(value)) {
      req.input(key, mssql.Int, value);
    } else {
      req.input(key, value as any);
    }
  });
  const result = await req.query(sql);
  return (result.recordset as unknown as T[]) ?? [];
}

/**
 * A handful of master-data tables (Customer.CustId, Supplier.SuppID, CustomerVehicle.VehID,
 * salesOrdrStatusHead.StatusID, USERS.Sl) use an app-generated MAX+1 key instead of an identity
 * column - there is no sequence object backing them. Runs the read-max-then-insert inside a
 * single serializable transaction with an UPDLOCK/HOLDLOCK hint on the max-read so two
 * concurrent creates can't compute the same next value; the second waits for the first's
 * transaction to commit rather than racing it.
 *
 * TRY_CAST doesn't exist on SQL Server 2008 (this DB's real version, verified live) - it was
 * added in 2012. The NOT LIKE digit-check works on both nvarchar and int columns since SQL
 * Server implicitly converts int to varchar for the LIKE comparison.
 */
export async function withNextNumericId<T>(
  table: string,
  column: string,
  insert: (nextId: number, transactionRequest: mssql.Request) => Promise<T>
): Promise<T> {
  const pool = await getPool();
  const transaction = new mssql.Transaction(pool);
  await transaction.begin(mssql.ISOLATION_LEVEL.SERIALIZABLE);
  try {
    const maxReq = new mssql.Request(transaction);
    const maxResult = await maxReq.query(
      `SELECT ISNULL(MAX(CASE WHEN ${column} NOT LIKE '%[^0-9]%' THEN CAST(${column} AS INT) END), 0) AS maxId
       FROM ${table} WITH (UPDLOCK, HOLDLOCK)`
    );
    const nextId = (maxResult.recordset[0]?.maxId ?? 0) + 1;
    const result = await insert(nextId, new mssql.Request(transaction));
    await transaction.commit();
    return result;
  } catch (err) {
    await transaction.rollback().catch(() => undefined);
    logger.error('withNextNumericId transaction failed', { table, column, error: (err as Error).message });
    throw err;
  }
}
