import { Request, Response, NextFunction } from 'express';
import { estimationService } from '../services/EstimationService';

function parsePaging(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 25));
  return { page, limit };
}

export class EstimationController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerName, vehNo, approved } = req.query;
      const result = await estimationService.list({
        customerName: customerName as string | undefined,
        vehNo: vehNo as string | undefined,
        approved: approved as 'yes' | 'no' | undefined,
        ...parsePaging(req)
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await estimationService.get(Number(req.params.id)));
    } catch (err) {
      next(err);
    }
  }

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const { approved, remarks } = req.body ?? {};
      await estimationService.setApproval(req, Number(req.params.id), !!approved, remarks);
      res.json({ message: approved ? 'Estimation approved.' : 'Estimation rejected.' });
    } catch (err) {
      next(err);
    }
  }
}

export const estimationController = new EstimationController();
