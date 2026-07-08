import { Request, Response, NextFunction } from 'express';
import { estimationService } from '../services/EstimationService';

function parsePaging(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 25));
  return { page, limit };
}

export class EstimationController {
  async staffHelp(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      res.json(q ? await estimationService.searchStaff(q as string) : []);
    } catch (err) {
      next(err);
    }
  }

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

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerId, vehicleId, staffId, billDate, jobCardNo, remarks, addition, less, lines } = req.body ?? {};
      const result = await estimationService.create(req, {
        customerId,
        vehicleId: vehicleId ? Number(vehicleId) : null,
        staffId: staffId || null,
        billDate,
        jobCardNo: jobCardNo || null,
        remarks: remarks || null,
        addition: Number(addition) || 0,
        less: Number(less) || 0,
        lines: Array.isArray(lines) ? lines : []
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicleId, staffId, remarks, addition, less, lines } = req.body ?? {};
      await estimationService.update(req, Number(req.params.id), {
        vehicleId: vehicleId !== undefined ? (vehicleId ? Number(vehicleId) : null) : undefined,
        staffId: staffId !== undefined ? staffId || null : undefined,
        remarks: remarks !== undefined ? remarks || null : undefined,
        addition: addition !== undefined ? Number(addition) : undefined,
        less: less !== undefined ? Number(less) : undefined,
        lines: Array.isArray(lines) ? lines : undefined
      });
      res.json({ message: 'Estimation updated.' });
    } catch (err) {
      next(err);
    }
  }
}

export const estimationController = new EstimationController();
