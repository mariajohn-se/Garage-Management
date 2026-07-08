import { Request } from 'express';
import { purchaseRepository } from '../repositories/PurchaseRepository';
import { logUserEvent } from '../auth/userlog';
import { NotFoundError, ValidationError } from '../utils/errors';
import { PurchaseLineItem } from '../models/Purchase';

/** BR-52 analog for purchases: supplier, date, and at least one valid item line required. */
function validatePurchaseInput(input: { suppId?: string; items?: PurchaseLineItem[] }): void {
  if (!input.suppId?.trim()) throw new ValidationError('Supplier is required.');
  if (!input.items || input.items.length === 0) throw new ValidationError('At least one item is required.');
  for (const item of input.items) {
    if (!item.itemCode?.trim()) throw new ValidationError('Every item line requires a product.');
    if (!item.qty || item.qty <= 0) throw new ValidationError('Every item line requires a quantity greater than zero.');
  }
}

export class PurchaseService {
  async listLocalPurchases(filters: { supplierName?: string; invoice?: string; page: number; limit: number }) {
    return purchaseRepository.listLocalPurchases(filters);
  }

  async getLocalPurchase(id: number) {
    const po = await purchaseRepository.findLocalPurchaseById(id);
    if (!po) throw new NotFoundError('Purchase order not found.');
    return po;
  }

  async createLocalPurchase(
    req: Request,
    input: {
      suppId: string;
      invoiceDate: string;
      currency: string | null;
      remarks: string | null;
      items: PurchaseLineItem[];
    }
  ): Promise<number> {
    validatePurchaseInput(input);
    if (!input.invoiceDate) throw new ValidationError('Invoice date is required.');
    const id = await purchaseRepository.createLocalPurchase(input);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Local Purchase Order Created',
      remarks: `Created local purchase order for supplier ${input.suppId}, ${input.items.length} item(s)`
    });
    return id;
  }

  /** BR-67: once a PO is supervisor-approved, mutation is forbidden except by admin override
   *  - this schema has no approval flag surfaced on LocalPurchase01Sql, so this cannot be
   *  enforced from the view alone; the route itself is gated to Supervisor/Administrator. */
  async updateLocalPurchase(
    req: Request,
    id: number,
    changes: { suppId?: string; remarks?: string; items?: PurchaseLineItem[] }
  ): Promise<void> {
    const existing = await purchaseRepository.findLocalPurchaseById(id);
    if (!existing) throw new NotFoundError('Purchase order not found.');
    if (changes.items) {
      for (const item of changes.items) {
        if (!item.itemCode?.trim() || !item.qty || item.qty <= 0) {
          throw new ValidationError('Every item line requires a product and a quantity greater than zero.');
        }
      }
    }
    await purchaseRepository.updateLocalPurchase(id, changes);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Local Purchase Order Updated',
      remarks: `Updated local purchase order ${id}`
    });
  }

  /** BR-67: mutation/delete is only reachable via the Supervisor/Administrator route gate. */
  async deleteLocalPurchase(req: Request, id: number): Promise<void> {
    const existing = await purchaseRepository.findLocalPurchaseById(id);
    if (!existing) throw new NotFoundError('Purchase order not found.');
    await purchaseRepository.deleteLocalPurchase(id);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Local Purchase Order Deleted',
      remarks: `Deleted local purchase order ${id} (${existing.invoice ?? ''})`
    });
  }

  async listForeignPurchases(filters: { supplierName?: string; page: number; limit: number }) {
    return purchaseRepository.listForeignPurchases(filters);
  }

  async getForeignPurchase(id: number) {
    const po = await purchaseRepository.findForeignPurchaseById(id);
    if (!po) throw new NotFoundError('Foreign purchase order not found.');
    return po;
  }

  async createForeignPurchase(
    req: Request,
    input: {
      suppId: string;
      orderDate: string;
      currency: string | null;
      remarks: string | null;
      items: PurchaseLineItem[];
    }
  ): Promise<number> {
    validatePurchaseInput(input);
    if (!input.orderDate) throw new ValidationError('Order date is required.');
    const id = await purchaseRepository.createForeignPurchase(input);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Foreign Purchase Order Created',
      remarks: `Created foreign purchase order for supplier ${input.suppId}, ${input.items.length} item(s)`
    });
    return id;
  }

  async updateForeignPurchase(
    req: Request,
    id: number,
    changes: { suppId?: string; remarks?: string; items?: PurchaseLineItem[] }
  ): Promise<void> {
    const existing = await purchaseRepository.findForeignPurchaseById(id);
    if (!existing) throw new NotFoundError('Foreign purchase order not found.');
    if (changes.items) {
      for (const item of changes.items) {
        if (!item.itemCode?.trim() || !item.qty || item.qty <= 0) {
          throw new ValidationError('Every item line requires a product and a quantity greater than zero.');
        }
      }
    }
    await purchaseRepository.updateForeignPurchase(id, changes);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Foreign Purchase Order Updated',
      remarks: `Updated foreign purchase order ${id}`
    });
  }

  async listDeliveryOrders(filters: { supplierName?: string; pdoNo?: string; page: number; limit: number }) {
    return purchaseRepository.listDeliveryOrders(filters);
  }

  async getDeliveryOrder(id: number) {
    const po = await purchaseRepository.findDeliveryOrderById(id);
    if (!po) throw new NotFoundError('Delivery order not found.');
    const items = await purchaseRepository.listDeliveryItems({ pdoNo: po.pdoNo ?? undefined, page: 1, limit: 200 });
    return { ...po, items: items.items };
  }

  async listPendingDeliveryOrders(suppId?: string) {
    return purchaseRepository.listPendingDeliveryOrders(suppId);
  }

  async lpoDetailsReport(fromDate: string, toDate: string) {
    return purchaseRepository.lpoDetailsReport(fromDate, toDate);
  }

  async listDeliveryItems(filters: { pdoNo?: string; itemCode?: string; page: number; limit: number }) {
    return purchaseRepository.listDeliveryItems(filters);
  }

  async listProdRequests(filters: { page: number; limit: number }) {
    return purchaseRepository.listProdRequests(filters);
  }

  async createProdRequest(req: Request, input: { supplierId: string; remarks: string | null }): Promise<number> {
    if (!input.supplierId?.trim()) throw new ValidationError('Supplier is required.');
    const id = await purchaseRepository.createProdRequest(input);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Product Request Created',
      remarks: `Created product request for supplier ${input.supplierId}`
    });
    return id;
  }

  async deleteProdRequest(req: Request, id: number): Promise<void> {
    await purchaseRepository.deleteProdRequest(id);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Product Request Deleted',
      remarks: `Deleted product request ${id}`
    });
  }

  async listReturns(filters: { page: number; limit: number }) {
    return purchaseRepository.listReturns(filters);
  }

  async listVehicleLinks(filters: { page: number; limit: number }) {
    return purchaseRepository.listVehicleLinks(filters);
  }

  /** Vehicle-link business rule: only one active (non-completed) link allowed per vehicle. */
  async createVehicleLink(req: Request, input: { pInvNo: string; vehNo: string }): Promise<number> {
    if (!input.pInvNo?.trim() || !input.vehNo?.trim()) {
      throw new ValidationError('Purchase invoice and vehicle are both required.');
    }
    const existing = await purchaseRepository.listVehicleLinks({ page: 1, limit: 500 });
    const activeForVehicle = existing.items.find((l) => l.vehNo === input.vehNo && !l.completed);
    if (activeForVehicle) {
      throw new ValidationError(
        'This vehicle already has an active, uncompleted purchase link.',
        'DUPLICATE_VEHICLE_LINK'
      );
    }
    const id = await purchaseRepository.createVehicleLink(input);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Vehicle Link Created',
      remarks: `Linked vehicle ${input.vehNo} to purchase invoice ${input.pInvNo}`
    });
    return id;
  }

  async deleteVehicleLink(req: Request, id: number): Promise<void> {
    await purchaseRepository.deleteVehicleLink(id);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Vehicle Link Deleted',
      remarks: `Deleted vehicle link ${id}`
    });
  }
}

export const purchaseService = new PurchaseService();
