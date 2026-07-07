import mssql from 'mssql';
import { getPool } from './connection';
import { logger } from '../utils/logger';

/**
 * Execute a SQL Server stored procedure with named parameters.
 * This is the ONLY sanctioned way to perform writes per STANDARDS.md (DB-Preserve mode) -
 * never build raw INSERT/UPDATE/DELETE strings.
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
