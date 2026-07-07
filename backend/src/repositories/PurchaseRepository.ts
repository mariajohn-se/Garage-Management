import { queryView, queryViewPaginated, callProcedure, executeWrite } from '../db/callProcedure';
import { NotImplementedError } from '../utils/errors';
import {
  LocalPurchaseOrder,
  ForeignPurchaseOrder,
  PurchaseDeliveryOrder,
  PendingPurchaseDO,
  PurchaseDeliveryItem,
  ProdRequest,
  PurchaseReturn,
  PurchaseVehicleLink,
  PurchaseLineItem
} from '../models/Purchase';

interface LocalPurchaseRow {
  ID: number;
  Invoice: string | null;
  InvDt: string | null;
  SuppId: string | null;
  SuppName: string | null;
  Total: number | null;
  Nett: number | null;
  Currency: string | null;
  Remarks: string | null;
}

function toLocalPurchase(row: LocalPurchaseRow): LocalPurchaseOrder {
  return {
    id: row.ID,
    invoice: row.Invoice,
    invoiceDate: row.InvDt,
    suppId: row.SuppId,
    supplierName: row.SuppName,
    total: row.Total,
    net: row.Nett,
    currency: row.Currency,
    remarks: row.Remarks
  };
}

interface ForeignPurchaseRow {
  ID: number;
  POrder: string | null;
  POrdt: string | null;
  SuppId: string | null;
  SuppName: string | null;
  Total: number | null;
  Nett: number | null;
  Currency: string | null;
  Remarks: string | null;
}

function toForeignPurchase(row: ForeignPurchaseRow): ForeignPurchaseOrder {
  return {
    id: row.ID,
    poOrder: row.POrder,
    orderDate: row.POrdt,
    suppId: row.SuppId,
    supplierName: row.SuppName,
    total: row.Total,
    net: row.Nett,
    currency: row.Currency,
    remarks: row.Remarks
  };
}

interface PurchaseDoRow {
  ID: number;
  PDONo: string | null;
  POrdt: string | null;
  SuppName: string | null;
  Total: number | null;
  Nett: number | null;
  Closed: number | null;
  EntryDt: string | null;
}

function toPurchaseDo(row: PurchaseDoRow): PurchaseDeliveryOrder {
  return {
    id: row.ID,
    pdoNo: row.PDONo,
    orderDate: row.POrdt,
    supplierName: row.SuppName,
    total: row.Total,
    net: row.Nett,
    closed: !!row.Closed,
    entryDate: row.EntryDt
  };
}

interface PurchaseDoItemRow {
  ID: number;
  PDONo: string | null;
  dt: string | null;
  ItemCode: string | null;
  Qty: number | null;
  Rate: number | null;
  Amount: number | null;
  Description: string | null;
}

function toPurchaseDoItem(row: PurchaseDoItemRow): PurchaseDeliveryItem {
  return {
    id: row.ID,
    pdoNo: row.PDONo,
    date: row.dt,
    itemCode: row.ItemCode,
    qty: row.Qty,
    rate: row.Rate,
    amount: row.Amount,
    description: row.Description
  };
}

interface ProdRequestRow {
  ID: number;
  RefNo: string | null;
  RefDt: string | null;
  SuppName: string | null;
  Total: number | null;
  Nett: number | null;
  Remarks: string | null;
}

function toProdRequest(row: ProdRequestRow): ProdRequest {
  return {
    id: row.ID,
    refNo: row.RefNo,
    refDate: row.RefDt,
    supplierName: row.SuppName,
    total: row.Total,
    net: row.Nett,
    remarks: row.Remarks
  };
}

interface PreturnRow {
  ID: number;
  PretNo: string | null;
  PretDt: string | null;
  Invoice: string | null;
  SuppId: string | null;
  Total: number | null;
  Nett: number | null;
  Remarks: string | null;
}

function toPurchaseReturn(row: PreturnRow): PurchaseReturn {
  return {
    id: row.ID,
    pretNo: row.PretNo,
    pretDate: row.PretDt,
    invoice: row.Invoice,
    supplierId: row.SuppId,
    total: row.Total,
    net: row.Nett,
    remarks: row.Remarks
  };
}

interface VehicleLinkRow {
  ID: number;
  PInvNo: string | null;
  VehNo: string | null;
  Amount: number | null;
  Ordr: string | null;
  CompletedYN: number | null;
}

function toVehicleLink(row: VehicleLinkRow): PurchaseVehicleLink {
  return {
    id: row.ID,
    pInvNo: row.PInvNo,
    vehNo: row.VehNo,
    amount: row.Amount,
    ordr: row.Ordr,
    completed: !!row.CompletedYN
  };
}

export class PurchaseRepository {
  async listLocalPurchases(filters: {
    supplierName?: string;
    invoice?: string;
    page: number;
    limit: number;
  }): Promise<{ items: LocalPurchaseOrder[]; total: number }> {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};
    if (filters.supplierName) {
      conditions.push('SuppName LIKE @supplierName');
      params.supplierName = `%${filters.supplierName}%`;
    }
    if (filters.invoice) {
      conditions.push('Invoice = @invoice');
      params.invoice = filters.invoice;
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const columns = 'ID, Invoice, InvDt, SuppId, SuppName, Total, Nett, Currency, Remarks';

    const totalRows = await queryView<{ cnt: number }>(
      `SELECT COUNT(*) AS cnt FROM LocalPurchase01Sql ${where}`,
      params
    );
    const rows = await queryViewPaginated<LocalPurchaseRow>(
      columns,
      'LocalPurchase01Sql',
      where,
      'ID DESC',
      params,
      filters.page,
      filters.limit
    );
    return { items: rows.map(toLocalPurchase), total: totalRows[0]?.cnt ?? 0 };
  }

  async findLocalPurchaseById(id: number): Promise<LocalPurchaseOrder | null> {
    const rows = await queryView<LocalPurchaseRow>(
      `SELECT ID, Invoice, InvDt, SuppId, SuppName, Total, Nett, Currency, Remarks FROM LocalPurchase01Sql WHERE ID = @id`,
      { id }
    );
    return rows.length ? toLocalPurchase(rows[0]) : null;
  }

  /**
   * BLOCKED: LocalPurchase01/02 use a Ccode+yr+CorQ partitioned numbering scheme (not a plain
   * identity) plus tax/discount computation (Tda/Txa/Amount) whose formula isn't documented
   * anywhere - guessing it risks silently corrupting 20769 rows of real purchase-accounting
   * data. Needs the real numbering/computation rules from someone who knows this legacy app.
   */
  async createLocalPurchase(_input: {
    suppId: string;
    invoiceDate: string;
    currency: string | null;
    remarks: string | null;
    items: PurchaseLineItem[];
  }): Promise<number> {
    throw new NotImplementedError(
      'Creating local purchase orders requires the real numbering and tax/discount computation rules from ' +
        'the legacy app - not supported yet.'
    );
  }

  async updateLocalPurchase(
    _id: number,
    _changes: { suppId?: string; remarks?: string; items?: PurchaseLineItem[] }
  ): Promise<void> {
    throw new NotImplementedError('Editing local purchase orders is not supported yet - see createLocalPurchase.');
  }

  /** Deletion has no numbering/computation to guess at - plain cleanup of header + detail rows. */
  async deleteLocalPurchase(id: number): Promise<void> {
    await executeWrite('DELETE FROM LocalPurchase02 WHERE ID = @id', { id });
    await executeWrite('DELETE FROM LocalPurchase01 WHERE ID = @id', { id });
  }

  async listForeignPurchases(filters: { supplierName?: string; page: number; limit: number }): Promise<{
    items: ForeignPurchaseOrder[];
    total: number;
  }> {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};
    if (filters.supplierName) {
      conditions.push('SuppName LIKE @supplierName');
      params.supplierName = `%${filters.supplierName}%`;
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const columns = 'ID, POrder, POrdt, SuppId, SuppName, Total, Nett, Currency, Remarks';

    const totalRows = await queryView<{ cnt: number }>(`SELECT COUNT(*) AS cnt FROM Porder01Sql ${where}`, params);
    const rows = await queryViewPaginated<ForeignPurchaseRow>(
      columns,
      'Porder01Sql',
      where,
      'ID DESC',
      params,
      filters.page,
      filters.limit
    );
    return { items: rows.map(toForeignPurchase), total: totalRows[0]?.cnt ?? 0 };
  }

  async findForeignPurchaseById(id: number): Promise<ForeignPurchaseOrder | null> {
    const rows = await queryView<ForeignPurchaseRow>(
      `SELECT ID, POrder, POrdt, SuppId, SuppName, Total, Nett, Currency, Remarks FROM Porder01Sql WHERE ID = @id`,
      { id }
    );
    return rows.length ? toForeignPurchase(rows[0]) : null;
  }

  /** BLOCKED: same Ccode+yr+CorQ numbering/computation gap as createLocalPurchase, above. */
  async createForeignPurchase(_input: {
    suppId: string;
    orderDate: string;
    currency: string | null;
    remarks: string | null;
    items: PurchaseLineItem[];
  }): Promise<number> {
    throw new NotImplementedError(
      'Creating foreign purchase orders requires the real numbering and tax/discount computation rules from ' +
        'the legacy app - not supported yet.'
    );
  }

  async updateForeignPurchase(
    _id: number,
    _changes: { suppId?: string; remarks?: string; items?: PurchaseLineItem[] }
  ): Promise<void> {
    throw new NotImplementedError('Editing foreign purchase orders is not supported yet - see createForeignPurchase.');
  }

  async listDeliveryOrders(filters: { supplierName?: string; page: number; limit: number }): Promise<{
    items: PurchaseDeliveryOrder[];
    total: number;
  }> {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};
    if (filters.supplierName) {
      conditions.push('SuppName LIKE @supplierName');
      params.supplierName = `%${filters.supplierName}%`;
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const columns = 'ID, PDONo, POrdt, SuppName, Total, Nett, Closed, EntryDt';

    const totalRows = await queryView<{ cnt: number }>(`SELECT COUNT(*) AS cnt FROM PurchaseDo01Sql ${where}`, params);
    const rows = await queryViewPaginated<PurchaseDoRow>(
      columns,
      'PurchaseDo01Sql',
      where,
      'ID DESC',
      params,
      filters.page,
      filters.limit
    );
    return { items: rows.map(toPurchaseDo), total: totalRows[0]?.cnt ?? 0 };
  }

  async findDeliveryOrderById(id: number): Promise<PurchaseDeliveryOrder | null> {
    const columns = 'ID, PDONo, POrdt, SuppName, Total, Nett, Closed, EntryDt';
    const rows = await queryView<PurchaseDoRow>(`SELECT ${columns} FROM PurchaseDo01Sql WHERE ID = @id`, { id });
    return rows.length ? toPurchaseDo(rows[0]) : null;
  }

  /**
   * Real stored procedure - not in DB_CONNECTION_SPEC_v12.md's documented catalog, but
   * confirmed to exist via INFORMATION_SCHEMA.ROUTINES and verified live to return 2945 real
   * rows.
   */
  async lpoDetailsReport(fromDate: string, toDate: string): Promise<Record<string, unknown>[]> {
    return callProcedure('spLPODetailsReport', { fromDate, todate: toDate });
  }

  /** Real, documented stored procedure (DB_CONNECTION_SPEC_v12.md) - verified live. */
  async listPendingDeliveryOrders(suppId?: string): Promise<PendingPurchaseDO[]> {
    const rows = await callProcedure<{
      PDONo: string | null;
      ID: number;
      SuppId: string | null;
      Ref: string | null;
      PorDt: string | null;
      PurchaseID: number | null;
    }>('PendingPurchaseDO', suppId ? { mSuppID: suppId } : {});
    return rows.map((r) => ({
      pdoNo: r.PDONo,
      id: r.ID,
      suppId: r.SuppId,
      ref: r.Ref,
      porDt: r.PorDt,
      purchaseId: r.PurchaseID
    }));
  }

  async listDeliveryItems(filters: { pdoNo?: string; itemCode?: string; page: number; limit: number }): Promise<{
    items: PurchaseDeliveryItem[];
    total: number;
  }> {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};
    if (filters.pdoNo) {
      conditions.push('PDONo = @pdoNo');
      params.pdoNo = filters.pdoNo;
    }
    if (filters.itemCode) {
      conditions.push('ItemCode LIKE @itemCode');
      params.itemCode = `%${filters.itemCode}%`;
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const columns = 'ID, PDONo, dt, ItemCode, Qty, Rate, Amount, Description';

    const totalRows = await queryView<{ cnt: number }>(`SELECT COUNT(*) AS cnt FROM PurchaseDo02Sql ${where}`, params);
    const rows = await queryViewPaginated<PurchaseDoItemRow>(
      columns,
      'PurchaseDo02Sql',
      where,
      'ID DESC',
      params,
      filters.page,
      filters.limit
    );
    return { items: rows.map(toPurchaseDoItem), total: totalRows[0]?.cnt ?? 0 };
  }

  async listProdRequests(filters: { page: number; limit: number }): Promise<{ items: ProdRequest[]; total: number }> {
    const columns = 'ID, RefNo, RefDt, SuppName, Total, Nett, Remarks';
    const totalRows = await queryView<{ cnt: number }>('SELECT COUNT(*) AS cnt FROM ProdRequest01Sql');
    const rows = await queryViewPaginated<ProdRequestRow>(
      columns,
      'ProdRequest01Sql',
      '',
      'ID DESC',
      {},
      filters.page,
      filters.limit
    );
    return { items: rows.map(toProdRequest), total: totalRows[0]?.cnt ?? 0 };
  }

  /** BLOCKED: ProdRequest01.ID uses the same undocumented Ccode+yr partitioned numbering scheme. */
  async createProdRequest(_input: { supplierId: string; remarks: string | null }): Promise<number> {
    throw new NotImplementedError(
      'Creating a production/purchase request requires the real numbering rules from the legacy app - not ' +
        'supported yet.'
    );
  }

  /** Deletion has no numbering to guess at - plain cleanup of header + detail rows. */
  async deleteProdRequest(id: number): Promise<void> {
    await executeWrite('DELETE FROM ProdRequest02 WHERE ID = @id', { id });
    await executeWrite('DELETE FROM ProdRequest01 WHERE ID = @id', { id });
  }

  /** No resolved view exists for Preturn01 - reads the base table directly per STANDARDS.md. */
  async listReturns(filters: { page: number; limit: number }): Promise<{ items: PurchaseReturn[]; total: number }> {
    const columns = 'ID, PretNo, PretDt, Invoice, SuppId, Total, Nett, Remarks';
    const totalRows = await queryView<{ cnt: number }>('SELECT COUNT(*) AS cnt FROM Preturn01');
    const rows = await queryViewPaginated<PreturnRow>(
      columns,
      'Preturn01',
      '',
      'ID DESC',
      {},
      filters.page,
      filters.limit
    );
    return { items: rows.map(toPurchaseReturn), total: totalRows[0]?.cnt ?? 0 };
  }

  async listVehicleLinks(filters: { page: number; limit: number }): Promise<{
    items: PurchaseVehicleLink[];
    total: number;
  }> {
    const columns = 'ID, PInvNo, VehNo, Amount, Ordr, CompletedYN';
    const totalRows = await queryView<{ cnt: number }>('SELECT COUNT(*) AS cnt FROM PurchaseVehicleLink');
    const rows = await queryViewPaginated<VehicleLinkRow>(
      columns,
      'PurchaseVehicleLink',
      '',
      'ID DESC',
      {},
      filters.page,
      filters.limit
    );
    return { items: rows.map(toVehicleLink), total: totalRows[0]?.cnt ?? 0 };
  }

  /** PurchaseVehicleLink.ID is a real identity column - safe to let SQL Server assign it. */
  async createVehicleLink(input: { pInvNo: string; vehNo: string }): Promise<number> {
    const rows = await executeWrite<{ ID: number }>(
      `INSERT INTO PurchaseVehicleLink (PInvNo, VehNo)
       OUTPUT INSERTED.ID
       VALUES (@pInvNo, @vehNo)`,
      { pInvNo: input.pInvNo, vehNo: input.vehNo }
    );
    return rows[0]?.ID;
  }

  async deleteVehicleLink(id: number): Promise<void> {
    await executeWrite('DELETE FROM PurchaseVehicleLink WHERE ID = @id', { id });
  }
}

export const purchaseRepository = new PurchaseRepository();
