import { Request } from 'express';
import { supplierRepository } from '../repositories/SupplierRepository';
import { logUserEvent } from '../auth/userlog';
import { ValidationError, NotFoundError } from '../utils/errors';
import { Supplier } from '../models/Party';

export class SupplierService {
  async list(filters: { name?: string; phone?: string; page: number; limit: number }) {
    return supplierRepository.list(filters);
  }

  async get(suppId: string): Promise<Supplier> {
    const supplier = await supplierRepository.findBySuppId(suppId);
    if (!supplier) throw new NotFoundError('Supplier not found.');
    return supplier;
  }

  async create(req: Request, input: Omit<Supplier, 'suppId' | 'activeFlag'>): Promise<string> {
    if (!input.name?.trim()) throw new ValidationError('Supplier name is required.');
    if (!input.phone1 && !input.email) {
      throw new ValidationError('At least one of phone or email is required.');
    }
    if (input.phone1) {
      const dup = await supplierRepository.findDuplicate(input.name.trim(), input.phone1);
      if (dup) throw new ValidationError('A supplier with this name and phone already exists.', 'DUPLICATE_SUPPLIER');
    }
    const suppId = await supplierRepository.create({ ...input, activeFlag: null });
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Supplier Created',
      remarks: `Created supplier ${input.name}`
    });
    return suppId;
  }

  async update(req: Request, suppId: string, changes: Partial<Omit<Supplier, 'suppId'>>): Promise<void> {
    const existing = await supplierRepository.findBySuppId(suppId);
    if (!existing) throw new NotFoundError('Supplier not found.');
    await supplierRepository.update(suppId, changes);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Supplier Updated',
      remarks: `Updated supplier ${suppId}: ${JSON.stringify(changes)}`
    });
  }

  async delete(req: Request, suppId: string): Promise<void> {
    const existing = await supplierRepository.findBySuppId(suppId);
    if (!existing) throw new NotFoundError('Supplier not found.');
    await supplierRepository.delete(suppId);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Supplier Deleted',
      remarks: `Deleted supplier ${suppId}`
    });
  }

  async bulkImportSuppliers(
    req: Request,
    rows: Array<Omit<Supplier, 'suppId' | 'activeFlag'>>
  ): Promise<{ created: number; skipped: Array<{ name: string; reason: string }> }> {
    let created = 0;
    const skipped: Array<{ name: string; reason: string }> = [];
    for (const row of rows) {
      try {
        await this.create(req, row);
        created++;
      } catch (err) {
        skipped.push({ name: row.name, reason: (err as Error).message });
      }
    }
    return { created, skipped };
  }
}

export const supplierService = new SupplierService();
