import { Request, Response, NextFunction } from 'express';
import { jobService } from '../services/JobService';
import { ValidationError } from '../utils/errors';

function parsePaging(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 25));
  return { page, limit };
}

export class JobController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, customerName } = req.query;
      const result = await jobService.list({
        status: status as string | undefined,
        customerName: customerName as string | undefined,
        ...parsePaging(req)
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await jobService.get(Number(req.params.id)));
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { statusId } = req.body ?? {};
      if (!statusId) throw new ValidationError('statusId is required.');
      await jobService.updateStatus(req, Number(req.params.id), Number(statusId));
      res.json({ message: 'Job status updated.' });
    } catch (err) {
      next(err);
    }
  }

  async listWorkInProgress(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await jobService.listWorkInProgress(parsePaging(req)));
    } catch (err) {
      next(err);
    }
  }

  async listAssigned(req: Request, res: Response, next: NextFunction) {
    try {
      const { ordr } = req.query;
      res.json(await jobService.listAssigned({ ordr: ordr as string | undefined, ...parsePaging(req) }));
    } catch (err) {
      next(err);
    }
  }

  async assign(req: Request, res: Response, next: NextFunction) {
    try {
      const { ordr, empId } = req.body ?? {};
      await jobService.assignStaff(req, ordr, Number(empId));
      res.status(201).json({ message: 'Staff assigned.' });
    } catch (err) {
      next(err);
    }
  }
}

export const jobController = new JobController();
