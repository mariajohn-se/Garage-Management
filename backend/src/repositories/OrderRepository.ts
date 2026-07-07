import { queryView, queryViewPaginated, callProcedure } from '../db/callProcedure';
import { SalesOrder, OrderLineItem } from '../models/Sales';

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
   * Placeholder procedure names - not confirmed against the real SP catalog. Follows the
   * schema's own header/detail table pattern (SalesOrdr01 header + SalesOrdr02 line items,
   * mirroring LocalPurchase01/02, Estimation01/02, etc.) rather than guessing at a single
   * do-everything procedure. NOT executed against production in this build's verification.
   */
  async create(input: {
    custId: string;
    vehId: number | null;
    orderDate: string;
    custNote: string | null;
    items: OrderLineItem[];
  }): Promise<string> {
    const rows = await callProcedure<{ Ordr: string }>('InsertSalesOrder', {
      CustId: input.custId,
      VehId: input.vehId,
      Ordt: input.orderDate,
      CustNote: input.custNote
    });
    const ordr = rows[0]?.Ordr;
    for (const item of input.items) {
      await callProcedure('InsertSalesOrderItem', {
        Ordr: ordr,
        ItemCode: item.itemCode,
        Qty: item.qty,
        Rate: item.rate,
        Discount: item.discount ?? 0
      });
    }
    return ordr;
  }

  async update(
    id: number,
    changes: { custId?: string; vehId?: number | null; custNote?: string; items?: OrderLineItem[] }
  ): Promise<void> {
    await callProcedure('UpdateSalesOrder', {
      ID: id,
      CustId: changes.custId,
      VehId: changes.vehId,
      CustNote: changes.custNote
    });
    if (changes.items) {
      await callProcedure('DeleteSalesOrderItems', { ID: id });
      for (const item of changes.items) {
        await callProcedure('InsertSalesOrderItem', {
          ID: id,
          ItemCode: item.itemCode,
          Qty: item.qty,
          Rate: item.rate,
          Discount: item.discount ?? 0
        });
      }
    }
  }

  // Placeholder procedure name - not confirmed against the real SP catalog.
  async changeCustomer(id: number, newCustId: string, reason: string): Promise<void> {
    await callProcedure('ChangeOrderCustomer', { ID: id, NewCustId: newCustId, Reason: reason });
  }

  // Placeholder procedure name - not confirmed against the real SP catalog.
  async updateStatus(id: number, statusId: number): Promise<void> {
    await callProcedure('InsertOrUpdateSalesOrdrStatusDtl', { ID: id, StatusID: statusId });
  }

  // Placeholder procedure name - BR-51 (cannot delete if a delivery note exists) is checked
  // by the caller (OrderService) before this runs.
  async delete(id: number): Promise<void> {
    await callProcedure('DeleteSalesOrder', { ID: id });
  }
}

export const orderRepository = new OrderRepository();
