import { Request, Response, NextFunction } from 'express';
import { receiptsPaymentsService } from '../services/ReceiptsPaymentsService';

function parsePaging(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 25));
  return { page, limit };
}

export class ReceiptsPaymentsController {
  async listReceipts(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, status } = req.query;
      res.json(
        await receiptsPaymentsService.listReceipts({
          search: search as string | undefined,
          status: status as 'paid' | 'outstanding' | undefined,
          ...parsePaging(req)
        })
      );
    } catch (err) {
      next(err);
    }
  }

  async listPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, status } = req.query;
      res.json(
        await receiptsPaymentsService.listPayments({
          search: search as string | undefined,
          status: status as 'paid' | 'outstanding' | undefined,
          ...parsePaging(req)
        })
      );
    } catch (err) {
      next(err);
    }
  }

  async getBillAllocations(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await receiptsPaymentsService.getBillAllocations(req.params.bill));
    } catch (err) {
      next(err);
    }
  }

  async discountHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { fromDate, toDate, maxDiscount } = req.query;
      res.json(
        await receiptsPaymentsService.discountHistory(
          fromDate as string,
          toDate as string,
          maxDiscount !== undefined ? Number(maxDiscount) : undefined
        )
      );
    } catch (err) {
      next(err);
    }
  }

  async customerOutstandingBySalesperson(req: Request, res: Response, next: NextFunction) {
    try {
      const { date } = req.query;
      res.json(await receiptsPaymentsService.customerOutstandingBySalesperson(date as string));
    } catch (err) {
      next(err);
    }
  }

  async supplierOutstandingSummary(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await receiptsPaymentsService.supplierOutstandingSummary());
    } catch (err) {
      next(err);
    }
  }
}

export const receiptsPaymentsController = new ReceiptsPaymentsController();
