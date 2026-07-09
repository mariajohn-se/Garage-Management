import { Request } from 'express';
import { orderRepository } from '../repositories/OrderRepository';
import { salesRepository } from '../repositories/SalesRepository';
import { logUserEvent } from '../auth/userlog';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors';
import { OrderLineItem } from '../models/Sales';
import { sumLineTotals } from '../utils/calc';

export class OrderService {
  async list(filters: {
    ordr?: string;
    customerName?: string;
    status?: 'delivered' | 'pending';
    page: number;
    limit: number;
  }) {
    return orderRepository.list(filters);
  }

  async get(id: number) {
    const order = await orderRepository.findById(id);
    if (!order) throw new NotFoundError('Order not found.');
    return order;
  }

  /** BR-52: customer, date, and at least one item with qty > 0 are required to submit. */
  private validateOrderInput(input: { custId?: string; orderDate?: string; items?: OrderLineItem[] }): void {
    if (!input.custId?.trim()) throw new ValidationError('Customer is required.');
    if (!input.orderDate) throw new ValidationError('Order date is required.');
    if (!input.items || input.items.length === 0) {
      throw new ValidationError('At least one item is required.');
    }
    for (const item of input.items) {
      if (!item.itemCode?.trim()) throw new ValidationError('Every item line requires a product.');
      if (!item.qty || item.qty <= 0)
        throw new ValidationError('Every item line requires a quantity greater than zero.');
    }
  }

  async create(
    req: Request,
    input: { custId: string; vehId: number | null; orderDate: string; custNote: string | null; items: OrderLineItem[] }
  ): Promise<{ ordr: string; total: number }> {
    this.validateOrderInput(input);
    const total = sumLineTotals(input.items.map((i) => ({ qty: i.qty, rate: i.rate, discountPercent: i.discount })));
    const ordr = await orderRepository.create(input);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Order Created',
      remarks: `Created order ${ordr} for customer ${input.custId}, ${input.items.length} item(s), total ${total}`
    });
    return { ordr, total };
  }

  /** BR-57: delivered orders lock product/quantity - item edits are rejected once delivered. */
  async update(
    req: Request,
    id: number,
    changes: { custId?: string; vehId?: number | null; custNote?: string; items?: OrderLineItem[] }
  ): Promise<void> {
    const existing = await orderRepository.findById(id);
    if (!existing) throw new NotFoundError('Order not found.');
    if (changes.items && existing.delivered) {
      throw new ForbiddenError(
        'This order has been delivered - product/quantity can no longer be edited.',
        'ORDER_LOCKED_DELIVERED'
      );
    }
    if (changes.items) {
      for (const item of changes.items) {
        if (!item.itemCode?.trim() || !item.qty || item.qty <= 0) {
          throw new ValidationError('Every item line requires a product and a quantity greater than zero.');
        }
      }
    }
    await orderRepository.update(id, changes);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Order Updated',
      remarks: `Updated order ${id}: ${JSON.stringify({ ...changes, items: changes.items?.length })}`
    });
  }

  /** BR-53: only Supervisor/Administrator may change the customer on an order (route-gated). */
  async changeCustomer(req: Request, id: number, newCustId: string, reason: string): Promise<void> {
    if (!newCustId?.trim()) throw new ValidationError('New customer is required.');
    if (!reason?.trim()) throw new ValidationError('A reason is required.');
    const existing = await orderRepository.findById(id);
    if (!existing) throw new NotFoundError('Order not found.');
    if (existing.custId === newCustId) {
      throw new ValidationError('New customer must be different from the current customer.');
    }
    await orderRepository.changeCustomer(id, newCustId, reason);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Order Customer Changed',
      remarks: `Order ${id} customer changed from ${existing.custId} to ${newCustId}: ${reason}`
    });
  }

  async updateStatus(req: Request, id: number, statusId: number): Promise<void> {
    if (!statusId || statusId <= 0) throw new ValidationError('A valid status is required.');
    const existing = await orderRepository.findById(id);
    if (!existing) throw new NotFoundError('Order not found.');
    await orderRepository.updateStatus(id, statusId);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Order Status Changed',
      remarks: `Order ${id} -> status ${statusId}`
    });
  }

  /** BR-51: cannot delete an order if a delivery note already exists for it. */
  async delete(req: Request, id: number): Promise<void> {
    const existing = await orderRepository.findById(id);
    if (!existing) throw new NotFoundError('Order not found.');
    const deliveries = await salesRepository.listDeliveryNotes({ ordr: existing.ordr, page: 1, limit: 1 });
    if (deliveries.total > 0) {
      throw new ValidationError(
        'Cannot delete an order that already has a delivery note.',
        'ORDER_CANNOT_DELETE_WITH_DN'
      );
    }
    await orderRepository.delete(id);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Order Deleted',
      remarks: `Deleted order ${id} (${existing.ordr})`
    });
  }
}

export const orderService = new OrderService();
