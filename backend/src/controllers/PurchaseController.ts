import { Request, Response, NextFunction } from 'express';
import { purchaseService } from '../services/PurchaseService';
import { ValidationError } from '../utils/errors';

function parsePaging(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 25));
  return { page, limit };
}

export class PurchaseController {
  async listLocalPurchases(req: Request, res: Response, next: NextFunction) {
    try {
      const { supplierName, invoice } = req.query;
      res.json(
        await purchaseService.listLocalPurchases({
          supplierName: supplierName as string | undefined,
          invoice: invoice as string | undefined,
          ...parsePaging(req)
        })
      );
    } catch (err) {
      next(err);
    }
  }

  async getLocalPurchase(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await purchaseService.getLocalPurchase(Number(req.params.id)));
    } catch (err) {
      next(err);
    }
  }

  async createLocalPurchase(req: Request, res: Response, next: NextFunction) {
    try {
      const { suppId, invoiceDate, currency, remarks, items } = req.body ?? {};
      const id = await purchaseService.createLocalPurchase(req, {
        suppId,
        invoiceDate,
        currency: currency ?? null,
        remarks: remarks ?? null,
        items: items ?? []
      });
      res.status(201).json({ id });
    } catch (err) {
      next(err);
    }
  }

  async updateLocalPurchase(req: Request, res: Response, next: NextFunction) {
    try {
      await purchaseService.updateLocalPurchase(req, Number(req.params.id), req.body ?? {});
      res.json({ message: 'Purchase order updated.' });
    } catch (err) {
      next(err);
    }
  }

  async deleteLocalPurchase(req: Request, res: Response, next: NextFunction) {
    try {
      await purchaseService.deleteLocalPurchase(req, Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async listForeignPurchases(req: Request, res: Response, next: NextFunction) {
    try {
      const { supplierName } = req.query;
      res.json(
        await purchaseService.listForeignPurchases({
          supplierName: supplierName as string | undefined,
          ...parsePaging(req)
        })
      );
    } catch (err) {
      next(err);
    }
  }

  async getForeignPurchase(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await purchaseService.getForeignPurchase(Number(req.params.id)));
    } catch (err) {
      next(err);
    }
  }

  async createForeignPurchase(req: Request, res: Response, next: NextFunction) {
    try {
      const { suppId, orderDate, currency, remarks, items } = req.body ?? {};
      const id = await purchaseService.createForeignPurchase(req, {
        suppId,
        orderDate,
        currency: currency ?? null,
        remarks: remarks ?? null,
        items: items ?? []
      });
      res.status(201).json({ id });
    } catch (err) {
      next(err);
    }
  }

  async updateForeignPurchase(req: Request, res: Response, next: NextFunction) {
    try {
      await purchaseService.updateForeignPurchase(req, Number(req.params.id), req.body ?? {});
      res.json({ message: 'Foreign purchase order updated.' });
    } catch (err) {
      next(err);
    }
  }

  async listDeliveryOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { supplierName, pdoNo } = req.query;
      res.json(
        await purchaseService.listDeliveryOrders({
          supplierName: supplierName as string | undefined,
          pdoNo: pdoNo as string | undefined,
          ...parsePaging(req)
        })
      );
    } catch (err) {
      next(err);
    }
  }

  async getDeliveryOrder(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await purchaseService.getDeliveryOrder(Number(req.params.id)));
    } catch (err) {
      next(err);
    }
  }

  async lpoDetailsReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { fromDate, toDate } = req.query;
      if (!fromDate || !toDate) throw new ValidationError('fromDate and toDate are required.');
      res.json(await purchaseService.lpoDetailsReport(fromDate as string, toDate as string));
    } catch (err) {
      next(err);
    }
  }

  async listPendingDeliveryOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { supplierId } = req.query;
      res.json(await purchaseService.listPendingDeliveryOrders(supplierId as string | undefined));
    } catch (err) {
      next(err);
    }
  }

  async listDeliveryItems(req: Request, res: Response, next: NextFunction) {
    try {
      const { pdoNo, itemCode } = req.query;
      res.json(
        await purchaseService.listDeliveryItems({
          pdoNo: pdoNo as string | undefined,
          itemCode: itemCode as string | undefined,
          ...parsePaging(req)
        })
      );
    } catch (err) {
      next(err);
    }
  }

  async listProdRequests(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await purchaseService.listProdRequests(parsePaging(req)));
    } catch (err) {
      next(err);
    }
  }

  async createProdRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { supplierId, remarks } = req.body ?? {};
      const id = await purchaseService.createProdRequest(req, { supplierId, remarks: remarks ?? null });
      res.status(201).json({ id });
    } catch (err) {
      next(err);
    }
  }

  async deleteProdRequest(req: Request, res: Response, next: NextFunction) {
    try {
      await purchaseService.deleteProdRequest(req, Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async listReturns(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await purchaseService.listReturns(parsePaging(req)));
    } catch (err) {
      next(err);
    }
  }

  async listVehicleLinks(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await purchaseService.listVehicleLinks(parsePaging(req)));
    } catch (err) {
      next(err);
    }
  }

  async createVehicleLink(req: Request, res: Response, next: NextFunction) {
    try {
      const { pInvNo, vehNo } = req.body ?? {};
      if (!pInvNo || !vehNo) throw new ValidationError('pInvNo and vehNo are required.');
      const id = await purchaseService.createVehicleLink(req, { pInvNo, vehNo });
      res.status(201).json({ id });
    } catch (err) {
      next(err);
    }
  }

  async deleteVehicleLink(req: Request, res: Response, next: NextFunction) {
    try {
      await purchaseService.deleteVehicleLink(req, Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export const purchaseController = new PurchaseController();
