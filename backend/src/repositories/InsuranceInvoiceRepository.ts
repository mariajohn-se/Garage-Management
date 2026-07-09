import mssql from 'mssql';
import { queryView, queryViewPaginated } from '../db/callProcedure';
import { getPool } from '../db/connection';
import { logger } from '../utils/logger';
import { InsuranceInvoiceListItem, InsuranceInvoiceLine, InsuranceInvoiceInput } from '../models/InsuranceInvoice';

interface InsrInvoice01Row {
  ID: number;
  BillNo: string | null;
  InternalInvNo: string | null;
  EstimationNo: string | null;
  InvoiceDt: string | null;
  CustomerName: string | null;
  CustTel: string | null;
  ClaimNumber: string | null;
  ExcessAmount: number | null;
  Addition: number | null;
  Less: number | null;
  Remarks: string | null;
}

function toListItem(row: InsrInvoice01Row): InsuranceInvoiceListItem {
  return {
    id: row.ID,
    billNo: row.BillNo,
    internalInvNo: row.InternalInvNo,
    estimationNo: row.EstimationNo,
    invoiceDt: row.InvoiceDt,
    customerName: row.CustomerName,
    custTel: row.CustTel,
    claimNumber: row.ClaimNumber,
    excessAmount: row.ExcessAmount,
    addition: row.Addition,
    less: row.Less,
    remarks: row.Remarks
  };
}

const SELECT_COLUMNS =
  'ID, BillNo, InternalInvNo, EstimationNo, InvoiceDt, CustomerName, CustTel, ClaimNumber, ExcessAmount, Addition, Less, Remarks';

export class InsuranceInvoiceRepository {
  async list(filters: { page: number; limit: number }): Promise<{ items: InsuranceInvoiceListItem[]; total: number }> {
    const totalRows = await queryView<{ cnt: number }>('SELECT COUNT(*) AS cnt FROM InsrInvoice01');
    const rows = await queryViewPaginated<InsrInvoice01Row>(
      SELECT_COLUMNS,
      'InsrInvoice01',
      '',
      'ID DESC',
      {},
      filters.page,
      filters.limit
    );
    return { items: rows.map(toListItem), total: totalRows[0]?.cnt ?? 0 };
  }

  async findById(id: number): Promise<InsuranceInvoiceListItem | null> {
    const rows = await queryView<InsrInvoice01Row>(`SELECT ${SELECT_COLUMNS} FROM InsrInvoice01 WHERE ID = @id`, {
      id
    });
    return rows.length ? toListItem(rows[0]) : null;
  }

  async getLines(id: number): Promise<InsuranceInvoiceLine[]> {
    const rows = await queryView<{ Description: string | null; Qty: number | null; UnitPrice: number | null }>(
      'SELECT Description, Qty, UnitPrice FROM InsrInvoice02 WHERE ID = @id ORDER BY Sort',
      { id }
    );
    return rows.map((r) => ({
      description: r.Description,
      qty: r.Qty ?? 0,
      unitPrice: r.UnitPrice ?? 0,
      amount: (r.Qty ?? 0) * (r.UnitPrice ?? 0)
    }));
  }

  /** Confirms EstimationNo resolves in Estimation01 before insert - see InsuranceInvoice.ts header. */
  async estimationExists(estimationNo: string): Promise<boolean> {
    const rows = await queryView<{ EstimationNo: string }>(
      'SELECT EstimationNo FROM Estimation01 WHERE EstimationNo = @estimationNo',
      { estimationNo }
    );
    return rows.length > 0;
  }

  /** Confirms the linked Sales Bill resolves in Sales01 before insert - see InsuranceInvoice.ts header. */
  async billExists(bill: string): Promise<boolean> {
    const rows = await queryView<{ Bill: string }>('SELECT Bill FROM Sales01 WHERE Bill = @bill', { bill });
    return rows.length > 0;
  }

  /**
   * ID is computed as MAX+1 across BOTH InsrInvoice01 AND InsrInvoice02 (43 known pre-existing
   * orphaned rows in InsrInvoice02 - the same cross-table collision class fixed on Sales Return).
   * BillNo is a separate MAX+1 within InsrInvoice01 alone.
   */
  async create(input: InsuranceInvoiceInput, userId: string): Promise<{ id: number; billNo: string }> {
    const pool = await getPool();
    const transaction = new mssql.Transaction(pool);
    await transaction.begin(mssql.ISOLATION_LEVEL.SERIALIZABLE);
    try {
      const req = new mssql.Request(transaction);
      const maxResult = await req.query(
        `SELECT
           ISNULL((SELECT MAX(id) FROM (
             SELECT ID AS id FROM InsrInvoice01 WITH (UPDLOCK, HOLDLOCK)
             UNION ALL
             SELECT ID AS id FROM InsrInvoice02 WITH (UPDLOCK, HOLDLOCK)
           ) combined), 0) AS maxId,
           ISNULL((SELECT MAX(CAST(BillNo AS INT)) FROM InsrInvoice01 WITH (UPDLOCK, HOLDLOCK)
             WHERE BillNo NOT LIKE '%[^0-9]%'), 0) AS maxBillNo`
      );
      const nextId = Number(maxResult.recordset[0]?.maxId ?? 0) + 1;
      const nextBillNo = String(Number(maxResult.recordset[0]?.maxBillNo ?? 0) + 1);

      await req
        .input('ID', nextId)
        .input('BillNo', nextBillNo)
        .input('EstimationNo', input.estimationNo)
        .input('Remarks', input.remarks)
        .input('Addition', input.addition)
        .input('Less', input.less)
        .input('User', userId)
        .input('InternalInvNo', input.bill)
        .input('InvoiceDt', input.invoiceDt)
        .input('ClaimNumber', input.claimNumber)
        .input('ExcessAmount', input.excessAmount)
        .input('CustomerName', input.customerName)
        .input('CustTel', input.custTel).query(`
          INSERT INTO InsrInvoice01
            (ID, Yr, cCode, BillNo, EstimationNo, Remarks, Addition, Less, [User], InternalInvNo, InvoiceDt, ClaimNumber, ExcessAmount, CustomerName, CustTel)
          VALUES
            (@ID, '', '01', @BillNo, @EstimationNo, @Remarks, @Addition, @Less, @User, @InternalInvNo, @InvoiceDt, @ClaimNumber, @ExcessAmount, @CustomerName, @CustTel)
        `);

      let sort = 1;
      for (const line of input.lines) {
        await new mssql.Request(transaction)
          .input('ID', nextId)
          .input('Description', line.description)
          .input('Qty', line.qty)
          .input('UnitPrice', line.unitPrice)
          .input('Sort', sort).query(`
            INSERT INTO InsrInvoice02 (ID, Description, Qty, UnitPrice, Sort)
            VALUES (@ID, @Description, @Qty, @UnitPrice, @Sort)
          `);
        sort += 1;
      }

      await transaction.commit();
      return { id: nextId, billNo: nextBillNo };
    } catch (err) {
      await transaction.rollback().catch(() => undefined);
      logger.error('Insurance invoice create transaction failed', { error: (err as Error).message });
      throw err;
    }
  }
}

export const insuranceInvoiceRepository = new InsuranceInvoiceRepository();
