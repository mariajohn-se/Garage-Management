import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/OrderService';
import { salesRepository } from '../repositories/SalesRepository';
import { ValidationError } from '../utils/errors';

function parsePaging(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 25));
  return { page, limit };
}

export class OrderController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { ordr, customerName, status } = req.query;
      const result = await orderService.list({
        ordr: ordr as string | undefined,
        customerName: customerName as string | undefined,
        status: status as 'delivered' | 'pending' | undefined,
        ...parsePaging(req)
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await orderService.get(Number(req.params.id)));
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { custId, vehId, orderDate, custNote, items } = req.body ?? {};
      const result = await orderService.create(req, {
        custId,
        vehId: vehId ?? null,
        orderDate,
        custNote: custNote ?? null,
        items: items ?? []
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      await orderService.update(req, Number(req.params.id), req.body ?? {});
      res.json({ message: 'Order updated.' });
    } catch (err) {
      next(err);
    }
  }

  async changeCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { newCustId, reason } = req.body ?? {};
      await orderService.changeCustomer(req, Number(req.params.id), newCustId, reason);
      res.json({ message: 'Customer changed.' });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { statusId } = req.body ?? {};
      if (!statusId) throw new ValidationError('statusId is required.');
      await orderService.updateStatus(req, Number(req.params.id), Number(statusId));
      res.json({ message: 'Order status updated.' });
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await orderService.delete(req, Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async deliveries(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await salesRepository.listDeliveryNotes({ ...parsePaging(req) }));
    } catch (err) {
      next(err);
    }
  }
}

export const orderController = new OrderController();
