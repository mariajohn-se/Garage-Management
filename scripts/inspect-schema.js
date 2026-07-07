/**
 * One-off utility: connect to the live DB and print the real column names for
 * USERS, UserRights, and UserLog so backend/src/repositories/UserRepository.ts
 * can be corrected from guessed column names to the actual schema.
 *
 * Usage (from backend/): node ../scripts/inspect-schema.js
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });
const mssql = require('mssql');

const TABLES = ['USERS', 'UserRights', 'UserLog'];

async function main() {
  const pool = await mssql.connect({
    server: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: { enableArithAbort: true, trustServerCertificate: true, encrypt: process.env.DB_ENCRYPT === 'true' }
  });

  for (const table of TABLES) {
    const result = await pool.request().input('table', table).query(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_NAME = @table
       ORDER BY ORDINAL_POSITION`
    );
    console.log(`\n=== ${table} (${result.recordset.length} columns) ===`);
    console.table(result.recordset);
  }

  await pool.close();
}

main().catch((err) => {
  console.error('Schema inspection failed:', err.message);
  process.exit(1);
});
