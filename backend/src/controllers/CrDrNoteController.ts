import { Request, Response, NextFunction } from 'express';
import { crDrNoteService } from '../services/CrDrNoteService';

function parsePaging(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 25));
  return { page, limit };
}

export class CrDrNoteController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await crDrNoteService.list(parsePaging(req)));
    } catch (err) {
      next(err);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await crDrNoteService.get(Number(req.params.id)));
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201).json(await crDrNoteService.create(req, req.body));
    } catch (err) {
      next(err);
    }
  }
}

export const crDrNoteController = new CrDrNoteController();
