import { Request, Response, NextFunction } from 'express';
import { salesService } from '../services/SalesService';
import { ValidationError } from '../utils/errors';

function parsePaging(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 25));
  return { page, limit };
}

export class SalesController {
  async deliveryNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const { ordr } = req.query;
      res.json(await salesService.listDeliveryNotes({ ordr: ordr as string | undefined, ...parsePaging(req) }));
    } catch (err) {
      next(err);
    }
  }

  async createDeliveryNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { ordr, deliveredBy, remarks } = req.body ?? {};
      const doNo = await salesService.createDeliveryNote(req, { ordr, deliveredBy, remarks: remarks ?? null });
      res.status(201).json({ doNo });
    } catch (err) {
      next(err);
    }
  }

  async updateDeliveryNote(req: Request, res: Response, next: NextFunction) {
    try {
      await salesService.updateDeliveryNote(req, Number(req.params.id), req.body ?? {});
      res.json({ message: 'Delivery note updated.' });
    } catch (err) {
      next(err);
    }
  }

  async invoices(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerName } = req.query;
      res.json(
        await salesService.listInvoices({ customerName: customerName as string | undefined, ...parsePaging(req) })
      );
    } catch (err) {
      next(err);
    }
  }

  async proformas(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await salesService.listProformas(parsePaging(req)));
    } catch (err) {
      next(err);
    }
  }

  async salesBillReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { fromDate, toDate } = req.query;
      if (!fromDate || !toDate) throw new ValidationError('fromDate and toDate are required.');
      res.json(await salesService.salesBillReport(fromDate as string, toDate as string));
    } catch (err) {
      next(err);
    }
  }

  async salesMarginDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { fromDate, toDate } = req.query;
      if (!fromDate || !toDate) throw new ValidationError('fromDate and toDate are required.');
      res.json(await salesService.salesMarginDetails(fromDate as string, toDate as string));
    } catch (err) {
      next(err);
    }
  }

  async salesAnalysisReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { fromDate, toDate } = req.query;
      if (!fromDate || !toDate) throw new ValidationError('fromDate and toDate are required.');
      res.json(await salesService.salesAnalysisReport(fromDate as string, toDate as string));
    } catch (err) {
      next(err);
    }
  }

  async monthlySplitSales(req: Request, res: Response, next: NextFunction) {
    try {
      const { fromDate, toDate } = req.query;
      if (!fromDate || !toDate) throw new ValidationError('fromDate and toDate are required.');
      res.json(await salesService.monthlySplitSales(fromDate as string, toDate as string));
    } catch (err) {
      next(err);
    }
  }
}

export const salesController = new SalesController();
