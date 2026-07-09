import { Request, Response, NextFunction } from 'express';
import { ledgerService } from '../services/LedgerService';
import { ValidationError } from '../utils/errors';

function parsePaging(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 25));
  return { page, limit };
}

export class LedgerController {
  async listAccountHeads(req: Request, res: Response, next: NextFunction) {
    try {
      const { search } = req.query;
      res.json(await ledgerService.listAccountHeads({ search: search as string | undefined, ...parsePaging(req) }));
    } catch (err) {
      next(err);
    }
  }

  async getAccountHead(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await ledgerService.getAccountHead(req.params.codes));
    } catch (err) {
      next(err);
    }
  }

  async accountHeadTree(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await ledgerService.accountHeadTree());
    } catch (err) {
      next(err);
    }
  }

  async createAccountHead(req: Request, res: Response, next: NextFunction) {
    try {
      const codes = await ledgerService.createAccountHead(req, req.body ?? {});
      res.json({ codes, message: 'Account head created.' });
    } catch (err) {
      next(err);
    }
  }

  async updateAccountHead(req: Request, res: Response, next: NextFunction) {
    try {
      await ledgerService.updateAccountHead(req, req.params.codes, req.body ?? {});
      res.json({ message: 'Account head updated.' });
    } catch (err) {
      next(err);
    }
  }

  async trialBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const { fromDate, toDate } = req.query;
      if (!fromDate || !toDate) throw new ValidationError('fromDate and toDate are required.');
      res.json(await ledgerService.trialBalance(fromDate as string, toDate as string));
    } catch (err) {
      next(err);
    }
  }

  async balanceSheet(req: Request, res: Response, next: NextFunction) {
    try {
      const { fromDate, toDate } = req.query;
      if (!fromDate || !toDate) throw new ValidationError('fromDate and toDate are required.');
      res.json(await ledgerService.balanceSheet(fromDate as string, toDate as string));
    } catch (err) {
      next(err);
    }
  }

  async openingBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const { ac, asOfDate } = req.query;
      if (!ac || !asOfDate) throw new ValidationError('ac and asOfDate are required.');
      res.json(await ledgerService.openingBalance(ac as string, asOfDate as string));
    } catch (err) {
      next(err);
    }
  }

  async listBulkJournals(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await ledgerService.listBulkJournals(parsePaging(req)));
    } catch (err) {
      next(err);
    }
  }

  async listBulkPdcReceipts(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await ledgerService.listBulkPdcReceipts(parsePaging(req)));
    } catch (err) {
      next(err);
    }
  }

  async listBulkPdcs(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await ledgerService.listBulkPdcs(parsePaging(req)));
    } catch (err) {
      next(err);
    }
  }

  async createJournalVoucher(req: Request, res: Response, next: NextFunction) {
    try {
      const { date, narration, lines } = req.body ?? {};
      res.status(201).json(
        await ledgerService.createJournalVoucher(req, { date, narration, lines: Array.isArray(lines) ? lines : [] })
      );
    } catch (err) {
      next(err);
    }
  }
}

export const ledgerController = new LedgerController();
