import { Request, Response, NextFunction } from 'express';
import { insuranceInvoiceService } from '../services/InsuranceInvoiceService';

function parsePaging(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 25));
  return { page, limit };
}

export class InsuranceInvoiceController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await insuranceInvoiceService.list(parsePaging(req)));
    } catch (err) {
      next(err);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await insuranceInvoiceService.get(Number(req.params.id)));
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201).json(await insuranceInvoiceService.create(req, req.body));
    } catch (err) {
      next(err);
    }
  }
}

export const insuranceInvoiceController = new InsuranceInvoiceController();
