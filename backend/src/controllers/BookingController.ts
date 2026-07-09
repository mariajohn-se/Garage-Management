import { Request, Response, NextFunction } from 'express';
import { bookingService } from '../services/BookingService';

function parsePaging(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 25));
  return { page, limit };
}

export class BookingController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await bookingService.list(parsePaging(req)));
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201).json(await bookingService.create(req, req.body));
    } catch (err) {
      next(err);
    }
  }
}

export const bookingController = new BookingController();
