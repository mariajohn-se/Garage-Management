import { Request } from 'express';
import { salesRepository } from '../repositories/SalesRepository';
import { orderRepository } from '../repositories/OrderRepository';
import { logUserEvent } from '../auth/userlog';
import { NotFoundError, ValidationError } from '../utils/errors';

export class SalesService {
  async listDeliveryNotes(filters: { ordr?: string; page: number; limit: number }) {
    return salesRepository.listDeliveryNotes(filters);
  }

  async listInvoices(filters: { customerName?: string; page: number; limit: number }) {
    return salesRepository.listInvoices(filters);
  }

  async listProformas(filters: { page: number; limit: number }) {
    return salesRepository.listProformas(filters);
  }

  /** BR-60: a delivery note must reference a valid order. */
  async createDeliveryNote(
    req: Request,
    input: { ordr: string; deliveredBy: string; remarks: string | null }
  ): Promise<string> {
    if (!input.ordr?.trim()) throw new ValidationError('Order reference is required.');
    if (!input.deliveredBy?.trim()) throw new ValidationError('Delivered By is required.');
    const matched = await orderRepository.findByOrdr(input.ordr);
    if (!matched) throw new ValidationError('No matching sales order found for this reference.', 'INVALID_ORDER_REF');

    const doNo = await salesRepository.createDeliveryNote(input);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Delivery Note Created',
      remarks: `Created delivery note ${doNo} for order ${input.ordr}`
    });
    return doNo;
  }

  async updateDeliveryNote(
    req: Request,
    id: number,
    changes: { deliveredBy?: string; remarks?: string }
  ): Promise<void> {
    const existing = await salesRepository.findDeliveryNoteById(id);
    if (!existing) throw new NotFoundError('Delivery note not found.');
    await salesRepository.updateDeliveryNote(id, changes);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Delivery Note Updated',
      remarks: `Updated delivery note ${id}: ${JSON.stringify(changes)}`
    });
  }

  async salesBillReport(fromDate: string, toDate: string) {
    return salesRepository.salesBillReport(fromDate, toDate);
  }

  async salesMarginDetails(fromDt: string, toDt: string) {
    return salesRepository.salesMarginDetails(fromDt, toDt);
  }
}

export const salesService = new SalesService();
