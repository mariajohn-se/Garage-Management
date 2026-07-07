import { Request, Response, NextFunction } from 'express';
import { customerService } from '../services/CustomerService';
import { ValidationError } from '../utils/errors';

function parsePaging(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 25));
  return { page, limit };
}

export class CustomerController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, phone, status } = req.query;
      const result = await customerService.list({
        name: name as string | undefined,
        phone: phone as string | undefined,
        status: status as 'active' | 'inactive' | undefined,
        ...parsePaging(req)
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await customerService.get(req.params.custId));
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const custId = await customerService.create(req, req.body ?? {});
      res.status(201).json({ custId });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      await customerService.update(req, req.params.custId, req.body ?? {});
      res.json({ message: 'Customer updated.' });
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await customerService.delete(req, req.params.custId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async agewise(req: Request, res: Response, next: NextFunction) {
    try {
      const { asOfDate } = req.query;
      if (!asOfDate) throw new ValidationError('asOfDate is required.');
      res.json(await customerService.agewise(asOfDate as string));
    } catch (err) {
      next(err);
    }
  }

  async help(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      const result = await customerService.list({ name: q as string | undefined, page: 1, limit: 20 });
      res.json(result.items);
    } catch (err) {
      next(err);
    }
  }

  async exportCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, phone, status } = req.query;
      const result = await customerService.list({
        name: name as string | undefined,
        phone: phone as string | undefined,
        status: status as 'active' | 'inactive' | undefined,
        page: 1,
        limit: 5000
      });
      const header = 'custId,name,phone1,email,area,status\n';
      const body = result.items
        .map(
          (c) =>
            `${c.custId},${c.name},${c.phone1 ?? ''},${c.email ?? ''},${c.area ?? ''},${c.isActive ? 'active' : 'inactive'}`
        )
        .join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="customers.csv"');
      res.send(header + body);
    } catch (err) {
      next(err);
    }
  }
}

export const customerController = new CustomerController();
