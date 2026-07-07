import { queryView, queryViewPaginated, executeWrite } from '../db/callProcedure';
import { SalesOrder, OrderLineItem } from '../models/Sales';
import { NotImplementedError } from '../utils/errors';

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

  async search(query: string): Promise<SalesOrder[]> {
    const rows = await queryView<OrderRow>(
      `SELECT TOP 20 ${SELECT_COLUMNS} FROM SalesOrdr01Sql WHERE Ordr LIKE @q OR custname LIKE @q ORDER BY ID DESC`,
      { q: `%${query}%` }
    );
    return rows.map(toOrder);
  }

  /**
   * BLOCKED: SalesOrdr01/02 use a Ccode+yr partitioned Ordr numbering scheme plus tax/discount
   * computation (Tda/Txa/Amount) that isn't documented anywhere - guessing it risks corrupting
   * 22835 rows of real sales-order data and any downstream invoicing/ledger totals that depend
   * on it. Needs the real numbering/computation rules from someone who knows this legacy app.
   */
  async create(_input: {
    custId: string;
    vehId: number | null;
    orderDate: string;
    custNote: string | null;
    items: OrderLineItem[];
  }): Promise<string> {
    throw new NotImplementedError(
      'Creating sales orders requires the real order-numbering and tax/discount computation rules from the ' +
        'legacy app - not supported yet.'
    );
  }

  async update(
    _id: number,
    _changes: { custId?: string; vehId?: number | null; custNote?: string; items?: OrderLineItem[] }
  ): Promise<void> {
    throw new NotImplementedError('Editing sales orders is not supported yet - see create().');
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
