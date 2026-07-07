import { Request, Response, NextFunction } from 'express';
import { jobStatusMasterService } from '../services/JobStatusMasterService';

export class JobStatusMasterController {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await jobStatusMasterService.list());
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await jobStatusMasterService.create(req, req.body ?? {});
      res.status(201).json({ statusId: id });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      await jobStatusMasterService.update(req, Number(req.params.id), req.body ?? {});
      res.json({ message: 'Status updated.' });
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await jobStatusMasterService.delete(req, Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export const jobStatusMasterController = new JobStatusMasterController();
