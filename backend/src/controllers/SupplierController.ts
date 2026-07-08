import { Request, Response, NextFunction } from 'express';
import { supplierService } from '../services/SupplierService';
import { ValidationError } from '../utils/errors';
import { parseCsv } from '../utils/csv';

function parsePaging(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 25));
  return { page, limit };
}

export class SupplierController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, phone } = req.query;
      const result = await supplierService.list({
        name: name as string | undefined,
        phone: phone as string | undefined,
        ...parsePaging(req)
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await supplierService.get(req.params.suppId));
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const suppId = await supplierService.create(req, req.body ?? {});
      res.status(201).json({ suppId });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      await supplierService.update(req, req.params.suppId, req.body ?? {});
      res.json({ message: 'Supplier updated.' });
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await supplierService.delete(req, req.params.suppId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async help(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      const result = await supplierService.list({ name: q as string | undefined, page: 1, limit: 20 });
      res.json(result.items);
    } catch (err) {
      next(err);
    }
  }

  async exportCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, phone } = req.query;
      const result = await supplierService.list({
        name: name as string | undefined,
        phone: phone as string | undefined,
        page: 1,
        limit: 5000
      });
      const header = 'suppId,name,phone1,email,area\n';
      const body = result.items
        .map((s) => `${s.suppId},${s.name},${s.phone1 ?? ''},${s.email ?? ''},${s.area ?? ''}`)
        .join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="suppliers.csv"');
      res.send(header + body);
    } catch (err) {
      next(err);
    }
  }

  /** Same format/columns as CustomerController.importCsv. */
  async importCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const { csv } = req.body ?? {};
      if (!csv || typeof csv !== 'string') throw new ValidationError('CSV file content is required.');
      const { columns, rows } = parseCsv(csv);
      const idx = (name: string) => columns.indexOf(name);
      const nameIdx = idx('name');
      if (nameIdx === -1) throw new ValidationError('CSV must have a "name" column.');
      const parsed = rows.map((cells) => ({
        name: cells[nameIdx] ?? '',
        phone1: cells[idx('phone1')] || null,
        phone2: cells[idx('phone2')] || null,
        email: cells[idx('email')] || null,
        address: cells[idx('address')] || '',
        area: cells[idx('area')] || null,
        emirate: cells[idx('emirate')] || null,
        contactPerson: cells[idx('contactperson')] || null,
        remarks: cells[idx('remarks')] || null
      }));
      res.json(await supplierService.bulkImportSuppliers(req, parsed));
    } catch (err) {
      next(err);
    }
  }
}

export const supplierController = new SupplierController();
