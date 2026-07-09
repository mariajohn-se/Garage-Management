import mssql from 'mssql';
import { queryView, queryViewPaginated, executeWrite, withNextNumericId } from '../db/callProcedure';
import { SalesOrder, OrderLineItem } from '../models/Sales';
import { NotImplementedError } from '../utils/errors';

function lineAmount(item: OrderLineItem): number {
  return item.qty * item.rate - (item.discount ?? 0);
}

/** VERIFIED against the live SalesOrdr01Sql view (76 columns, 22835 real rows). */

interface OrderRow {
  ID: number;
  Ordr: string;
  Ordt: string | null;
  CustId: string | null;
  custname: string | null;
  VehId: number | null;
  VehNo: string | null;
  StaffName: string | null;
  Total: number | null;
  Nett: number | null;
  delivered: number | null;
  Invoiced: number | null;
  CLOSED: number | null;
  JobStatus: string | null;
  Bill: string | null;
  BillDt: string | null;
  CustNote: string | null;
}

function toOrder(row: OrderRow): SalesOrder {
  return {
    id: row.ID,
    ordr: row.Ordr,
    orderDate: row.Ordt,
    custId: row.CustId,
    customerName: row.custname,
    vehId: row.VehId,
    vehNo: row.VehNo,
    staffName: row.StaffName,
    total: row.Total,
    net: row.Nett,
    delivered: !!row.delivered,
    invoiced: !!row.Invoiced,
    closed: !!row.CLOSED,
    jobStatus: row.JobStatus,
    billNo: row.Bill,
    billDate: row.BillDt,
    custNote: row.CustNote
  };
}

const SELECT_COLUMNS = `ID, Ordr, Ordt, CustId, custname, VehId, VehNo, StaffName, Total, Nett, delivered, Invoiced, CLOSED, JobStatus, Bill, BillDt, CustNote`;

export class OrderRepository {
  async list(filters: {
    ordr?: string;
    customerName?: string;
    status?: 'delivered' | 'pending';
    page: number;
    limit: number;
  }): Promise<{ items: SalesOrder[]; total: number }> {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};
    if (filters.ordr) {
      conditions.push('Ordr = @ordr');
      params.ordr = filters.ordr;
    }
    if (filters.customerName) {
      conditions.push('custname LIKE @customerName');
      params.customerName = `%${filters.customerName}%`;
    }
    if (filters.status) {
      conditions.push(filters.status === 'delivered' ? 'delivered <> 0' : '(delivered = 0 OR delivered IS NULL)');
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const totalRows = await queryView<{ cnt: number }>(`SELECT COUNT(*) AS cnt FROM SalesOrdr01Sql ${where}`, params);
    const total = totalRows[0]?.cnt ?? 0;

    const rows = await queryViewPaginated<OrderRow>(
      SELECT_COLUMNS,
      'SalesOrdr01Sql',
      where,
      'ID DESC',
      params,
      filters.page,
      filters.limit
    );
    return { items: rows.map(toOrder), total };
  }

  async findById(id: number): Promise<SalesOrder | null> {
    const rows = await queryView<OrderRow>(`SELECT ${SELECT_COLUMNS} FROM SalesOrdr01Sql WHERE ID = @id`, { id });
    return rows.length ? toOrder(rows[0]) : null;
  }

  async findByOrdr(ordr: string): Promise<SalesOrder | null> {
    const rows = await queryView<OrderRow>(`SELECT TOP 1 ${SELECT_COLUMNS} FROM SalesOrdr01Sql WHERE Ordr = @ordr`, {
      ordr
    });
    return rows.length ? toOrder(rows[0]) : null;
  }

  /**
   * VERIFIED FINDING (2026-07-08): SalesOrdr01.yr is always '' in live data (not a real
   * partition key), and the Ordr-vs-ID offset drifts unpredictably across 20 years of history
   * with no fixed formula - they're two independently-incrementing legacy counters, not one
   * derived from the other, so each gets its own MAX+1 (same pattern as Customer/Supplier).
   * SalesOrdr02 detail rows key off the header's own ID (verified: every real row has
   * detail.ID = header.ID, not a separate sequence) plus a per-order line counter (Srl).
   * The order form collects no tax/discount input, so Amount is plain Qty*Rate (minus the
   * optional per-line discount field, unused by the current UI but supported by the API type).
   */
  /**
   * VERIFIED (2026-07-09): SalesOrdr01.Estimation (nvarchar) is a real, existing column - the
   * legacy system's own field for linking a job order back to the estimation it was created
   * from. Populated with the estimation's human-facing EstimationNo when provided; left null
   * otherwise. Not populated by anything else currently, so this is a genuine gap being filled,
   * not a guess at an undocumented convention.
   */
  async create(input: {
    custId: string;
    vehId: number | null;
    orderDate: string;
    custNote: string | null;
    estimationRef: string | null;
    items: OrderLineItem[];
  }): Promise<string> {
    return withNextNumericId('SalesOrdr01', 'ID', async (nextId, req, transaction) => {
      const maxOrdrResult = await req.query(
        `SELECT ISNULL(MAX(CASE WHEN Ordr NOT LIKE '%[^0-9]%' THEN CAST(Ordr AS INT) END), 0) AS maxOrdr
         FROM SalesOrdr01 WITH (UPDLOCK, HOLDLOCK)`
      );
      const nextOrdr = String((maxOrdrResult.recordset[0]?.maxOrdr ?? 0) + 1);
      const total = input.items.reduce((sum, item) => sum + lineAmount(item), 0);

      await req
        .input('ID', nextId)
        .input('Ordr', nextOrdr)
        .input('Ordt', input.orderDate)
        .input('CustId', input.custId)
        .input('VehId', input.vehId)
        .input('CustNote', input.custNote)
        .input('Estimation', input.estimationRef)
        .input('Total', total)
        .input('Nett', total).query(`
          INSERT INTO SalesOrdr01 (ID, Ccode, yr, Ordr, Ordt, CustId, VehId, CustNote, Estimation, Total, Nett)
          VALUES (@ID, '01', '', @Ordr, @Ordt, @CustId, @VehId, @CustNote, @Estimation, @Total, @Nett)
        `);

      let srl = 1;
      for (const item of input.items) {
        await new mssql.Request(transaction)
          .input('ID', nextId)
          .input('OrDr', nextOrdr)
          .input('ItemCode', item.itemCode)
          .input('Qty', item.qty)
          .input('Rate', item.rate)
          .input('Amount', lineAmount(item))
          .input('Srl', srl++).query(`
            INSERT INTO SalesOrdr02 (ID, OrDr, ItemCode, Qty, Rate, Amount, Srl, Tdr, Tda, UpdtStk)
            VALUES (@ID, @OrDr, @ItemCode, @Qty, @Rate, @Amount, @Srl, 0, 0, 0)
          `);
      }

      return nextOrdr;
    });
  }

  async update(
    id: number,
    changes: { custId?: string; vehId?: number | null; custNote?: string; items?: OrderLineItem[] }
  ): Promise<void> {
    const sets: string[] = [];
    const params: Record<string, unknown> = { id };
    if (changes.custId !== undefined) { sets.push('CustId = @custId'); params.custId = changes.custId; }
    if (changes.vehId !== undefined) { sets.push('VehId = @vehId'); params.vehId = changes.vehId; }
    if (changes.custNote !== undefined) { sets.push('CustNote = @custNote'); params.custNote = changes.custNote; }
    if (changes.items) {
      const total = changes.items.reduce((sum, item) => sum + lineAmount(item), 0);
      sets.push('Total = @total', 'Nett = @total');
      params.total = total;
    }
    if (sets.length) {
      await executeWrite(`UPDATE SalesOrdr01 SET ${sets.join(', ')} WHERE ID = @id`, params);
    }

    if (changes.items) {
      const rows = await queryView<{ Ordr: string }>('SELECT Ordr FROM SalesOrdr01 WHERE ID = @id', { id });
      const ordr = rows[0]?.Ordr;
      if (ordr) {
        await executeWrite('DELETE FROM SalesOrdr02 WHERE ID = @id', { id });
        let srl = 1;
        for (const item of changes.items) {
          await executeWrite(
            `INSERT INTO SalesOrdr02 (ID, OrDr, ItemCode, Qty, Rate, Amount, Srl, Tdr, Tda, UpdtStk)
             VALUES (@id, @ordr, @itemCode, @qty, @rate, @amount, @srl, 0, 0, 0)`,
            { id, ordr, itemCode: item.itemCode, qty: item.qty, rate: item.rate, amount: lineAmount(item), srl: srl++ }
          );
        }
      }
    }
  }

  /** BLOCKED: same reasoning - reassigning a paid/ordered job to a different customer needs real business rules. */
  async changeCustomer(_id: number, _newCustId: string, _reason: string): Promise<void> {
    throw new NotImplementedError('Changing a sales order\'s customer is not supported yet.');
  }

  /** salesOrdrStatusDtl (real base table, identity DtlId) is a plain status-history log - looks up Ordr by ID first. */
  async updateStatus(id: number, statusId: number): Promise<void> {
    const rows = await queryView<{ Ordr: string }>('SELECT Ordr FROM SalesOrdr01 WHERE ID = @id', { id });
    const ordr = rows[0]?.Ordr;
    if (!ordr) return;
    await executeWrite(
      'INSERT INTO salesOrdrStatusDtl (Ordr, StatusDate, StatusId) VALUES (@ordr, GETDATE(), @statusId)',
      { ordr, statusId }
    );
  }

  /**
   * BR-51 (cannot delete if a delivery note exists) is checked by the caller (OrderService)
   * before this runs. Deletion has no numbering/computation to guess at - plain header+detail cleanup.
   */
  async delete(id: number): Promise<void> {
    await executeWrite('DELETE FROM SalesOrdr02 WHERE ID = @id', { id });
    await executeWrite('DELETE FROM SalesOrdr01 WHERE ID = @id', { id });
  }
}

export const orderRepository = new OrderRepository();
