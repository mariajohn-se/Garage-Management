import { Request, Response, NextFunction } from 'express';
import { bankingService } from '../services/BankingService';
import { ValidationError } from '../utils/errors';

function parsePaging(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 25));
  return { page, limit };
}

export class BankingController {
  async listVouchers(req: Request, res: Response, next: NextFunction) {
    try {
      const { vtype, payType } = req.query;
      res.json(
        await bankingService.listVouchers({
          vtype: vtype as string | undefined,
          payType: payType as string | undefined,
          ...parsePaging(req)
        })
      );
    } catch (err) {
      next(err);
    }
  }

  async getVoucher(req: Request, res: Response, next: NextFunction) {
    try {
      const { vsrl } = req.query;
      if (!vsrl) throw new ValidationError('vsrl is required.');
      res.json(await bankingService.getVoucher(Number(req.params.id), vsrl as string));
    } catch (err) {
      next(err);
    }
  }

  async listBankAccounts(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await bankingService.listBankAccounts());
    } catch (err) {
      next(err);
    }
  }

  async cashBankDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { account, fromDate, toDate, type } = req.query;
      res.json(
        await bankingService.cashBankDetails(
          account as string,
          fromDate as string,
          toDate as string,
          type as string | undefined
        )
      );
    } catch (err) {
      next(err);
    }
  }

  async listVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { checked, payType } = req.query;
      res.json(
        await bankingService.listVerification(req.user!.username, checked === 'true', payType as string | undefined)
      );
    } catch (err) {
      next(err);
    }
  }

  async markVerified(req: Request, res: Response, next: NextFunction) {
    try {
      await bankingService.markVerified(req, req.params.vsrl);
      res.json({ message: 'Voucher marked as verified.' });
    } catch (err) {
      next(err);
    }
  }

  async filterAccountEntries(req: Request, res: Response, next: NextFunction) {
    try {
      const { dateFrom, dateTo, ac } = req.query;
      res.json(
        await bankingService.filterAccountEntries(dateFrom as string, dateTo as string, ac as string | undefined)
      );
    } catch (err) {
      next(err);
    }
  }

  async voucherActionLog(req: Request, res: Response, next: NextFunction) {
    try {
      const { vsrl } = req.query;
      res.json(await bankingService.voucherActionLog({ vsrl: vsrl as string | undefined, ...parsePaging(req) }));
    } catch (err) {
      next(err);
    }
  }

  async createReceiptPaymentVoucher(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, date, cashBankAc, narration, chq, lines } = req.body ?? {};
      res.status(201).json(
        await bankingService.createReceiptPaymentVoucher(req, {
          type,
          date,
          cashBankAc,
          narration,
          chq: chq || undefined,
          lines: Array.isArray(lines) ? lines : []
        })
      );
    } catch (err) {
      next(err);
    }
  }
}

export const bankingController = new BankingController();
