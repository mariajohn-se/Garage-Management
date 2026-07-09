import mssql from 'mssql';
import { queryView, queryViewPaginated } from '../db/callProcedure';
import { getPool } from '../db/connection';
import { logger } from '../utils/logger';
import { CrDrNoteListItem, CrDrNoteInput } from '../models/CrDrNote';

interface CrDrNoteRow {
  ID: number;
  RefNo: string | null;
  RefDt: string | null;
  Type: string | null;
  Vsrl: string | null;
  Narration: string | null;
  Ac: string | null;
  AcName: string | null;
  Vac: string | null;
  VacName: string | null;
  Amount: number | null;
}

function toListItem(row: CrDrNoteRow): CrDrNoteListItem {
  return {
    id: row.ID,
    refNo: row.RefNo,
    refDt: row.RefDt,
    type: row.Type,
    vsrl: row.Vsrl,
    narration: row.Narration,
    ac: row.Ac,
    acName: row.AcName,
    vac: row.Vac,
    vacName: row.VacName,
    amount: row.Amount
  };
}

// No CrDrNoteSql view exists - read the base table directly with a plain join to ACHEAD for
// display names, the same read pattern STANDARDS.md allows for any single-purpose report join.
const SELECT_SQL = `
  SELECT n.ID, n.RefNo, n.RefDt, n.Type, n.Vsrl, n.Narration,
         n.Ac, acHead.DESCRIPTION AS AcName,
         n.Vac, vacHead.DESCRIPTION AS VacName,
         n.Amount
  FROM CrDrNote n
  LEFT JOIN ACHEAD acHead ON acHead.CODES = n.Ac
  LEFT JOIN ACHEAD vacHead ON vacHead.CODES = n.Vac
`;

export class CrDrNoteRepository {
  async list(filters: { page: number; limit: number }): Promise<{ items: CrDrNoteListItem[]; total: number }> {
    const totalRows = await queryView<{ cnt: number }>('SELECT COUNT(*) AS cnt FROM CrDrNote');
    const rows = await queryViewPaginated<CrDrNoteRow>(
      '*',
      `(${SELECT_SQL}) AS n`,
      '',
      'ID DESC',
      {},
      filters.page,
      filters.limit
    );
    return { items: rows.map(toListItem), total: totalRows[0]?.cnt ?? 0 };
  }

  async findById(id: number): Promise<CrDrNoteListItem | null> {
    const rows = await queryView<CrDrNoteRow>(`SELECT * FROM (${SELECT_SQL}) x WHERE ID = @id`, { id });
    return rows.length ? toListItem(rows[0]) : null;
  }

  async create(input: CrDrNoteInput, userId: string): Promise<{ id: number; refNo: string }> {
    const pool = await getPool();
    const transaction = new mssql.Transaction(pool);
    await transaction.begin(mssql.ISOLATION_LEVEL.SERIALIZABLE);
    try {
      const noteReq = new mssql.Request(transaction);
      const noteMax = await noteReq.query(
        `SELECT
           ISNULL(MAX(ID), 0) AS maxId,
           ISNULL(MAX(CASE WHEN RefNo NOT LIKE '%[^0-9]%' THEN CAST(RefNo AS INT) END), 0) AS maxRefNo
         FROM CrDrNote WITH (UPDLOCK, HOLDLOCK)`
      );
      const nextNoteId = (noteMax.recordset[0]?.maxId ?? 0) + 1;
      const nextRefNo = String((noteMax.recordset[0]?.maxRefNo ?? 0) + 1);

      const acMasterReq = new mssql.Request(transaction);
      const acMasterMax = await acMasterReq.query(
        `SELECT
           ISNULL(MAX(ID), 0) AS maxId,
           ISNULL(MAX(CASE WHEN VSRL NOT LIKE '%[^0-9]%' THEN CAST(VSRL AS INT) END), 0) AS maxVsrl
         FROM ACMASTER WITH (UPDLOCK, HOLDLOCK)`
      );
      const nextAcMasterId = (acMasterMax.recordset[0]?.maxId ?? 0) + 1;
      const nextVsrl = String((acMasterMax.recordset[0]?.maxVsrl ?? 0) + 1);

      const payType = input.type === 'Credit' ? 'CN' : 'DN';

      await new mssql.Request(transaction)
        .input('ID', nextAcMasterId)
        .input('VSRL', nextVsrl)
        .input('Dt', input.refDt)
        .input('VType', input.type)
        .input('Narration', input.narration ?? '')
        .input('RefNo', nextRefNo)
        .input('ACTemp', input.ac)
        .input('PayType', payType).query(`
          INSERT INTO ACMASTER (ID, VSRL, BranchID, DATE, VTYPE, NARRATION, REFNO, ACTEMP, PAYTYPE, POSTED, Checked, AutoPost, Printed, Edited, TempVoucher, PackingDocNo, PDC)
          VALUES (@ID, @VSRL, 0, @Dt, @VType, @Narration, @RefNo, @ACTemp, @PayType, 0, 0, 0, 0, 0, 0, 0, 0)
        `);

      await new mssql.Request(transaction)
        .input('ID', nextAcMasterId)
        .input('VSRL', nextVsrl)
        .input('AC', input.ac)
        .input('Dt', input.refDt)
        .input('Amount', input.amount)
        .input('VAC', input.vac).query(`
          INSERT INTO ACDETAILS (ID, VSRL, AC, DATE, DEBT, CRED, VAC, OnAc, Lnarration, GroupID)
          VALUES (@ID, @VSRL, @AC, @Dt, @Amount, 0, @VAC, 'O', '', 0)
        `);

      await new mssql.Request(transaction)
        .input('ID', nextAcMasterId)
        .input('VSRL', nextVsrl)
        .input('AC', input.vac)
        .input('Dt', input.refDt)
        .input('Amount', input.amount)
        .input('VAC', input.ac).query(`
          INSERT INTO ACDETAILS (ID, VSRL, AC, DATE, DEBT, CRED, VAC, OnAc, Lnarration, GroupID)
          VALUES (@ID, @VSRL, @AC, @Dt, 0, @Amount, @VAC, 'O', '', 0)
        `);

      await new mssql.Request(transaction)
        .input('ID', nextNoteId)
        .input('RefNo', nextRefNo)
        .input('Type', input.type)
        .input('RefDt', input.refDt)
        .input('Vsrl', nextVsrl)
        .input('Narration', input.narration)
        .input('Ac', input.ac)
        .input('Vac', input.vac)
        .input('Amount', input.amount).query(`
          INSERT INTO CrDrNote (ID, Ccode, RefNo, Type, RefDt, Vsrl, Narration, Ac, Vac, Amount)
          VALUES (@ID, '01', @RefNo, @Type, @RefDt, @Vsrl, @Narration, @Ac, @Vac, @Amount)
        `);

      await transaction.commit();
      return { id: nextNoteId, refNo: nextRefNo };
    } catch (err) {
      await transaction.rollback().catch(() => undefined);
      logger.error('CrDrNote create transaction failed', { error: (err as Error).message });
      throw err;
    }
  }
}

export const crDrNoteRepository = new CrDrNoteRepository();
