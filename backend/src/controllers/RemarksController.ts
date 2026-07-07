import { Request, Response, NextFunction } from 'express';
import { remarksService } from '../services/RemarksService';
import { ValidationError } from '../utils/errors';

function parsePaging(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 25));
  return { page, limit };
}

export class RemarksController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { ordr } = req.query;
      if (!ordr) throw new ValidationError('ordr query param is required.');
      res.json(await remarksService.listByOrder(ordr as string));
    } catch (err) {
      next(err);
    }
  }

  async report(req: Request, res: Response, next: NextFunction) {
    try {
      const { ordr, search } = req.query;
      const result = await remarksService.report({
        ordr: ordr as string | undefined,
        search: search as string | undefined,
        ...parsePaging(req)
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await remarksService.create(req, req.body ?? {});
      res.status(201).json({ id });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      await remarksService.update(req, Number(req.params.id), req.body?.remarks ?? '');
      res.json({ message: 'Remark updated.' });
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await remarksService.delete(req, Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export const remarksController = new RemarksController();
