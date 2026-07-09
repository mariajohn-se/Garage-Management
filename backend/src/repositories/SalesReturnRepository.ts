import mssql from 'mssql';
import { queryView, queryViewPaginated } from '../db/callProcedure';
import { getPool } from '../db/connection';
import { logger } from '../utils/logger';
import { SalesReturnListItem, SalesReturnLine, SalesReturnInput } from '../models/SalesReturn';

interface SReturn01Row {
  ID: number;
  SretNo: string | null;
  SretDt: string | null;
  CustID: string | null;
  custname: string | null;
  CorQ: string | null;
  Bill: string | null;
  Total: number | null;
  Nett: number | null;
  Remarks: string | null;
}

function toListItem(row: SReturn01Row): SalesReturnListItem {
  return {
    id: row.ID,
    sretNo: row.SretNo,
    sretDt: row.SretDt,
    custId: row.CustID,
    custName: row.custname,
    corQ: row.CorQ,
    bill: row.Bill,
    total: row.Total,
    nett: row.Nett,
    remarks: row.Remarks
  };
}

const SELECT_COLUMNS = 'ID, SretNo, SretDt, CustID, custname, CorQ, Bill, Total, Nett, Remarks';

export class SalesReturnRepository {
  async list(filters: { page: number; limit: number }): Promise<{ items: SalesReturnListItem[]; total: number }> {
    const totalRows = await queryView<{ cnt: number }>('SELECT COUNT(*) AS cnt FROM SReturn01Sql');
    const rows = await queryViewPaginated<SReturn01Row>(
      SELECT_COLUMNS,
      'SReturn01Sql',
      '',
      'ID DESC',
      {},
      filters.page,
      filters.limit
    );
    return { items: rows.map(toListItem), total: totalRows[0]?.cnt ?? 0 };
  }

  async findById(id: number): Promise<SalesReturnListItem | null> {
    const rows = await queryView<SReturn01Row>(`SELECT ${SELECT_COLUMNS} FROM SReturn01Sql WHERE ID = @id`, { id });
    return rows.length ? toListItem(rows[0]) : null;
  }

  async getLines(id: number): Promise<SalesReturnLine[]> {
    const rows = await queryView<{
      ItemCode: string;
      Description: string | null;
      Qty: number | null;
      Rate: number | null;
      Amount: number | null;
    }>('SELECT ItemCode, Description, Qty, Rate, Amount FROM SReturn02Sql WHERE ID = @id ORDER BY Srl', { id });
    return rows.map((r) => ({
      itemCode: r.ItemCode,
      description: r.Description,
      qty: r.Qty ?? 0,
      rate: r.Rate ?? 0,
      amount: r.Amount ?? 0
    }));
  }

  /** Confirms every line's ItemCode resolves in ItemsSql before insert - see SalesReturn.ts header. */
  async findMissingItemCodes(itemCodes: string[]): Promise<string[]> {
    if (!itemCodes.length) return [];
    const rows = await queryView<{ ItemCode: string }>(
      `SELECT ItemCode FROM ItemsSql WHERE ItemCode IN (${itemCodes.map((_, i) => `@code${i}`).join(',')})`,
      Object.fromEntries(itemCodes.map((code, i) => [`code${i}`, code]))
    );
    const found = new Set(rows.map((r) => r.ItemCode));
    return itemCodes.filter((c) => !found.has(c));
  }

  /** Confirms CustID resolves in Customer before insert - see SalesReturn.ts header. */
  async customerExists(custId: string): Promise<boolean> {
    const rows = await queryView<{ CustId: string }>('SELECT CustId FROM Customer WHERE CustId = @custId', {
      custId
    });
    return rows.length > 0;
  }

  /**
   * VERIFIED FINDING (2026-07-09), caught by live write-then-read-back testing: SReturn02 has
   * pre-existing orphaned rows (ID=26/SretNo='18', 3 real historical lines with no matching
   * SReturn01 header - a legacy data-quality defect, not something introduced here). Computing
   * next ID/SretNo from SReturn01 alone collided with that orphan and made a new return's lines
   * blend with the orphan's on read (both share the INNER JOIN key). Both are now computed as
   * MAX+1 across SReturn01 AND SReturn02 together, under one SERIALIZABLE lock spanning both
   * tables - the same defensive pattern as withNextNumericId, just extended to a second table
   * withNextNumericId's single-table signature can't express.
   */
  async create(input: SalesReturnInput, userId: string): Promise<{ id: number; sretNo: string }> {
    const pool = await getPool();
    const transaction = new mssql.Transaction(pool);
    await transaction.begin(mssql.ISOLATION_LEVEL.SERIALIZABLE);
    try {
      const req = new mssql.Request(transaction);
      const maxResult = await req.query(
        `SELECT
           ISNULL(MAX(id), 0) AS maxId,
           ISNULL(MAX(CASE WHEN sretNo NOT LIKE '%[^0-9]%' THEN CAST(sretNo AS INT) END), 0) AS maxSretNo
         FROM (
           SELECT ID AS id, SretNo AS sretNo FROM SReturn01 WITH (UPDLOCK, HOLDLOCK)
           UNION ALL
           SELECT ID AS id, SretNo AS sretNo FROM SReturn02 WITH (UPDLOCK, HOLDLOCK)
         ) combined`
      );
      const nextId = (maxResult.recordset[0]?.maxId ?? 0) + 1;
      const nextSretNo = String((maxResult.recordset[0]?.maxSretNo ?? 0) + 1);
      const total = input.lines.reduce((sum, l) => sum + l.qty * l.rate, 0);

      await req
        .input('ID', nextId)
        .input('SretNo', nextSretNo)
        .input('SretDt', input.sretDt)
        .input('CustID', input.custId)
        .input('CorQ', input.corQ)
        .input('Bill', input.bill)
        .input('Total', total)
        .input('Nett', total)
        .input('Remarks', input.remarks)
        .input('CreatedBy', userId).query(`
          INSERT INTO SReturn01 (ID, Ccode, yr, SretNo, SretDt, CustID, CorQ, Bill, Total, Txa, Tda, [Add], Nett, Ac, Remarks, CreatedBy, CreatedDt)
          VALUES (@ID, '01', '', @SretNo, @SretDt, @CustID, @CorQ, @Bill, @Total, 0, 0, 0, @Nett, 'SRETURN', @Remarks, @CreatedBy, GETDATE())
        `);

      let srl = 1;
      for (const line of input.lines) {
        const amount = line.qty * line.rate;
        await new mssql.Request(transaction)
          .input('ID', nextId)
          .input('SretNo', nextSretNo)
          .input('ItemCode', line.itemCode)
          .input('Qty', line.qty)
          .input('Rate', line.rate)
          .input('Amount', amount)
          .input('Srl', srl).query(`
            INSERT INTO SReturn02 (ID, Ccode, yr, SretNo, ItemCode, Qty, Rate, Tdr, Tda, Amount, Srl)
            VALUES (@ID, '01', '', @SretNo, @ItemCode, @Qty, @Rate, 0, 0, @Amount, @Srl)
          `);
        srl += 1;
      }

      await transaction.commit();
      return { id: nextId, sretNo: nextSretNo };
    } catch (err) {
      await transaction.rollback().catch(() => undefined);
      logger.error('Sales return create transaction failed', { error: (err as Error).message });
      throw err;
    }
  }
}

export const salesReturnRepository = new SalesReturnRepository();
