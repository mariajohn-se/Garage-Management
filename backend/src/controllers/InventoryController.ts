import { Request, Response, NextFunction } from 'express';
import { inventoryService } from '../services/InventoryService';
import { ValidationError } from '../utils/errors';

function parsePaging(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 25));
  return { page, limit };
}

export class InventoryController {
  async listItems(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, category, lowStock } = req.query;
      res.json(
        await inventoryService.listItems({
          search: search as string | undefined,
          category: category as string | undefined,
          lowStock: lowStock === 'true',
          ...parsePaging(req)
        })
      );
    } catch (err) {
      next(err);
    }
  }

  async getItem(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await inventoryService.getItem(req.params.itemCode));
    } catch (err) {
      next(err);
    }
  }

  async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      await inventoryService.updateItem(req, req.params.itemCode, req.body ?? {});
      res.json({ message: 'Item updated.' });
    } catch (err) {
      next(err);
    }
  }

  async listStockIn(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await inventoryService.listStockIn(parsePaging(req)));
    } catch (err) {
      next(err);
    }
  }

  async listStockOut(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await inventoryService.listStockOut(parsePaging(req)));
    } catch (err) {
      next(err);
    }
  }

  async listTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const { itemCode } = req.query;
      res.json(
        await inventoryService.listTransactions({ itemCode: itemCode as string | undefined, ...parsePaging(req) })
      );
    } catch (err) {
      next(err);
    }
  }

  async currentStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { search } = req.query;
      res.json(await inventoryService.currentStock({ search: search as string | undefined, ...parsePaging(req) }));
    } catch (err) {
      next(err);
    }
  }

  async stockValuation(req: Request, res: Response, next: NextFunction) {
    try {
      const { asOfDate, type } = req.query;
      if (!asOfDate) throw new ValidationError('asOfDate is required.');
      res.json(await inventoryService.stockValuation(asOfDate as string, (type as '0' | '1') ?? '0'));
    } catch (err) {
      next(err);
    }
  }

  async stockAging(req: Request, res: Response, next: NextFunction) {
    try {
      const { asOfDate, days, type } = req.query;
      if (!asOfDate) throw new ValidationError('asOfDate is required.');
      res.json(await inventoryService.stockAging(asOfDate as string, Number(days) || 30, (type as '0' | '1') ?? '0'));
    } catch (err) {
      next(err);
    }
  }

  async reorderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await inventoryService.reorderStatus(parsePaging(req)));
    } catch (err) {
      next(err);
    }
  }

  async stockMovementFrequency(req: Request, res: Response, next: NextFunction) {
    try {
      const { fromDate, toDate, direction, limit } = req.query;
      if (!fromDate || !toDate) throw new ValidationError('fromDate and toDate are required.');
      res.json(
        await inventoryService.stockMovementFrequency(
          fromDate as string,
          toDate as string,
          direction === 'slow' ? 'slow' : 'fast',
          Math.min(200, Math.max(1, Number(limit) || 50))
        )
      );
    } catch (err) {
      next(err);
    }
  }

  async listGodowns(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await inventoryService.listGodowns());
    } catch (err) {
      next(err);
    }
  }

  async createStockIn(req: Request, res: Response, next: NextFunction) {
    try {
      const { stockDate, remarks, lines } = req.body ?? {};
      res.status(201).json(
        await inventoryService.createStockIn(req, { stockDate, remarks: remarks || null, lines: Array.isArray(lines) ? lines : [] })
      );
    } catch (err) {
      next(err);
    }
  }

  async createStockOut(req: Request, res: Response, next: NextFunction) {
    try {
      const { stockDate, remarks, lines } = req.body ?? {};
      res.status(201).json(
        await inventoryService.createStockOut(req, { stockDate, remarks: remarks || null, lines: Array.isArray(lines) ? lines : [] })
      );
    } catch (err) {
      next(err);
    }
  }
}

export const inventoryController = new InventoryController();
