import { Request, Response, NextFunction } from 'express';
import { reportingService } from '../services/ReportingService';

export class ReportingController {
  async getCompanyHeader(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await reportingService.getCompanyHeader());
    } catch (err) {
      next(err);
    }
  }

  async updateCompanyHeader(req: Request, res: Response, next: NextFunction) {
    try {
      await reportingService.updateCompanyHeader(req, req.body ?? {});
      res.json({ message: 'Company header updated.' });
    } catch (err) {
      next(err);
    }
  }

  async listMenu(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await reportingService.listMenu());
    } catch (err) {
      next(err);
    }
  }
}

export const reportingController = new ReportingController();
