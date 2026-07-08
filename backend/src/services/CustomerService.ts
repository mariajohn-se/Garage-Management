import { Request } from 'express';
import { customerRepository } from '../repositories/CustomerRepository';
import { logUserEvent } from '../auth/userlog';
import { ValidationError, NotFoundError } from '../utils/errors';
import { Customer, AgewiseBucket } from '../models/Party';

export class CustomerService {
  async list(filters: { name?: string; phone?: string; status?: 'active' | 'inactive'; page: number; limit: number }) {
    return customerRepository.list(filters);
  }

  async get(custId: string): Promise<Customer> {
    const customer = await customerRepository.findByCustId(custId);
    if (!customer) throw new NotFoundError('Customer not found.');
    return customer;
  }

  async create(req: Request, input: Omit<Customer, 'custId'>): Promise<string> {
    if (!input.name?.trim()) throw new ValidationError('Customer name is required.');
    if (!input.phone1 && !input.email) {
      throw new ValidationError('At least one of phone or email is required.');
    }
    if (input.phone1) {
      const dup = await customerRepository.findDuplicate(input.name.trim(), input.phone1);
      if (dup) throw new ValidationError('A customer with this name and phone already exists.', 'DUPLICATE_CUSTOMER');
    }
    const custId = await customerRepository.create(input);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Customer Created',
      remarks: `Created customer ${input.name}`
    });
    return custId;
  }

  async update(req: Request, custId: string, changes: Partial<Omit<Customer, 'custId'>>): Promise<void> {
    const existing = await customerRepository.findByCustId(custId);
    if (!existing) throw new NotFoundError('Customer not found.');
    await customerRepository.update(custId, changes);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Customer Updated',
      remarks: `Updated customer ${custId}: ${JSON.stringify(changes)}`
    });
  }

  async delete(req: Request, custId: string): Promise<void> {
    const existing = await customerRepository.findByCustId(custId);
    if (!existing) throw new NotFoundError('Customer not found.');
    await customerRepository.delete(custId);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Customer Deleted',
      remarks: `Deleted customer ${custId}`
    });
  }

  async agewise(asOfDate: string): Promise<AgewiseBucket[]> {
    return customerRepository.agewise(asOfDate);
  }

  async bulkImportCustomers(
    req: Request,
    rows: Array<Omit<Customer, 'custId' | 'isActive'>>
  ): Promise<{ created: number; skipped: Array<{ name: string; reason: string }> }> {
    let created = 0;
    const skipped: Array<{ name: string; reason: string }> = [];
    for (const row of rows) {
      try {
        await this.create(req, { ...row, isActive: true });
        created++;
      } catch (err) {
        skipped.push({ name: row.name, reason: (err as Error).message });
      }
    }
    return { created, skipped };
  }
}

export const customerService = new CustomerService();
