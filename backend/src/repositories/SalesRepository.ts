import { queryView, queryViewPaginated, callProcedure } from '../db/callProcedure';
import { DeliveryNote, SalesInvoice, Proforma } from '../models/Sales';
import { NotImplementedError } from '../utils/errors';

/**
 * VERIFIED against the live database: Delivery01Sql (42711 rows), Sales01Sql (23021 rows),
 * ProformaSales01Sql (372 rows) all exist with real data. SalesReturn01/SalesReturnBillSql do
 * NOT exist anywhere in the schema (`Invalid object name`) - the Sales Return module
 * (list/create/edit return bills) was not built since there is nothing to bind it to.
 */

interface DeliveryRow {
  ID: number;
  DONo: string | null;
  DODt: string | null;
  Ordr: string | null;
  custname: string | null;
  VehNo: string | null;
  Total: number | null;
  Nett: number | null;
  Remarks: string | null;
}

function toDelivery(row: DeliveryRow): DeliveryNote {
  return {
    id: row.ID,
    doNo: row.DONo,
    doDate: row.DODt,
    ordr: row.Ordr,
    customerName: row.custname,
    vehNo: row.VehNo,
    total: row.Total,
    net: row.Nett,
    remarks: row.Remarks
  };
}

interface SalesInvoiceRow {
  ID: number;
  Bill: string | null;
  BillDt: string | null;
  Ordr: string | null;
  custname: string | null;
  VehNo: string | null;
  Total: number | null;
  Nett: number | null;
  Delivered: number | null;
  paid: string | null;
}

function toInvoice(row: SalesInvoiceRow): SalesInvoice {
  return {
    id: row.ID,
    bill: row.Bill,
    billDate: row.BillDt,
    ordr: row.Ordr,
    customerName: row.custname,
    vehNo: row.VehNo,
    total: row.Total,
    net: row.Nett,
    delivered: !!row.Delivered,
    paid: row.paid
  };
}

interface ProformaRow {
  ID: number;
  Bill: string | null;
  BillDt: string | null;
  Ordr: string | null;
  CustName: string | null;
  VehNo: string | null;
  Total: number | null;
  Nett: number | null;
  VoucherType: string | null;
}

function toProforma(row: ProformaRow): Proforma {
  return {
    id: row.ID,
    bill: row.Bill,
    billDate: row.BillDt,
    ordr: row.Ordr,
    customerName: row.CustName,
    vehNo: row.VehNo,
    total: row.Total,
    net: row.Nett,
    voucherType: row.VoucherType
  };
}

export class SalesRepository {
  async listDeliveryNotes(filters: { ordr?: string; page: number; limit: number }): Promise<{
    items: DeliveryNote[];
    total: number;
  }> {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};
    if (filters.ordr) {
      conditions.push('Ordr = @ordr');
      params.ordr = filters.ordr;
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const columns = 'ID, DONo, DODt, Ordr, custname, VehNo, Total, Nett, Remarks';

    const totalRows = await queryView<{ cnt: number }>(`SELECT COUNT(*) AS cnt FROM Delivery01Sql ${where}`, params);
    const total = totalRows[0]?.cnt ?? 0;
    const rows = await queryViewPaginated<DeliveryRow>(
      columns,
      'Delivery01Sql',
      where,
      'ID DESC',
      params,
      filters.page,
      filters.limit
    );
    return { items: rows.map(toDelivery), total };
  }

  async listInvoices(filters: { customerName?: string; page: number; limit: number }): Promise<{
    items: SalesInvoice[];
    total: number;
  }> {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};
    if (filters.customerName) {
      conditions.push('custname LIKE @customerName');
      params.customerName = `%${filters.customerName}%`;
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const columns = 'ID, Bill, BillDt, Ordr, custname, VehNo, Total, Nett, Delivered, paid';

    const totalRows = await queryView<{ cnt: number }>(`SELECT COUNT(*) AS cnt FROM Sales01Sql ${where}`, params);
    const total = totalRows[0]?.cnt ?? 0;
    const rows = await queryViewPaginated<SalesInvoiceRow>(
      columns,
      'Sales01Sql',
      where,
      'ID DESC',
      params,
      filters.page,
      filters.limit
    );
    return { items: rows.map(toInvoice), total };
  }

  async listProformas(filters: { page: number; limit: number }): Promise<{ items: Proforma[]; total: number }> {
    const columns = 'ID, Bill, BillDt, Ordr, CustName, VehNo, Total, Nett, VoucherType';
    const totalRows = await queryView<{ cnt: number }>('SELECT COUNT(*) AS cnt FROM ProformaSales01Sql');
    const total = totalRows[0]?.cnt ?? 0;
    const rows = await queryViewPaginated<ProformaRow>(
      columns,
      'ProformaSales01Sql',
      '',
      'ID DESC',
      {},
      filters.page,
      filters.limit
    );
    return { items: rows.map(toProforma), total };
  }

  async findDeliveryNoteById(id: number): Promise<DeliveryNote | null> {
    const rows = await queryView<DeliveryRow>(
      `SELECT ID, DONo, DODt, Ordr, custname, VehNo, Total, Nett, Remarks FROM Delivery01Sql WHERE ID = @id`,
      { id }
    );
    return rows.length ? toDelivery(rows[0]) : null;
  }

  /**
   * BLOCKED: Delivery01/02 use the same Ccode+yr partitioned DONo numbering plus a stock-update
   * flag (UpdtStk) whose trigger/logic isn't visible anywhere in this schema - a delivery note
   * likely needs to decrement Items.Stock atomically, and guessing that risks silently
   * corrupting real inventory counts. Needs the real numbering/stock-update rules from someone
   * who knows this legacy app.
   */
  async createDeliveryNote(_input: { ordr: string; deliveredBy: string; remarks: string | null }): Promise<string> {
    throw new NotImplementedError(
      'Creating delivery notes requires the real numbering and stock-update rules from the legacy app - not ' +
        'supported yet.'
    );
  }

  async updateDeliveryNote(_id: number, _changes: { deliveredBy?: string; remarks?: string }): Promise<void> {
    throw new NotImplementedError('Editing delivery notes is not supported yet - see createDeliveryNote().');
  }

  /** Real stored procedure (not in DB_CONNECTION_SPEC_v12.md's catalog, but confirmed to
   *  exist via INFORMATION_SCHEMA.ROUTINES and verified live to return real data). */
  async salesBillReport(fromDate: string, toDate: string): Promise<Record<string, unknown>[]> {
    return callProcedure('spSalesBillReport', { fromDate, toDate, option: 0 });
  }

  /** Real, documented SP (DB_CONNECTION_SPEC_v12.md) - verified live to return real data. */
  async salesMarginDetails(fromDt: string, toDt: string): Promise<Record<string, unknown>[]> {
    return callProcedure('spSalesMarginDetails', { fromDt, toDt, bill: '0' });
  }
}

export const salesRepository = new SalesRepository();
