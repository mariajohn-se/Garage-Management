import { Request } from 'express';
import { salesReturnRepository } from '../repositories/SalesReturnRepository';
import { logUserEvent } from '../auth/userlog';
import { NotFoundError, ValidationError } from '../utils/errors';
import { SalesReturnInput } from '../models/SalesReturn';

export class SalesReturnService {
  async list(filters: { page: number; limit: number }) {
    return salesReturnRepository.list(filters);
  }

  async get(id: number) {
    const header = await salesReturnRepository.findById(id);
    if (!header) throw new NotFoundError('Sales return not found.');
    const lines = await salesReturnRepository.getLines(id);
    return { ...header, lines };
  }

  async create(req: Request, input: SalesReturnInput): Promise<{ id: number; sretNo: string }> {
    if (!input.custId?.trim()) throw new ValidationError('Customer is required.');
    if (!input.sretDt) throw new ValidationError('Return date is required.');
    if (!input.lines?.length) throw new ValidationError('At least one line item is required.');
    for (const line of input.lines) {
      if (!line.itemCode?.trim()) throw new ValidationError('Every line requires an item.');
      if (line.qty <= 0) throw new ValidationError('Quantity must be greater than zero.');
    }

    const customerExists = await salesReturnRepository.customerExists(input.custId);
    if (!customerExists) {
      throw new ValidationError('Selected customer was not found - please pick one from the search results.');
    }

    const missingItems = await salesReturnRepository.findMissingItemCodes(input.lines.map((l) => l.itemCode));
    if (missingItems.length) {
      throw new ValidationError(`These items were not found: ${missingItems.join(', ')}`);
    }

    const result = await salesReturnRepository.create(input, req.user!.username);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Sales Return Created',
      remarks: `Sales return ${result.sretNo} for customer ${input.custId}, ${input.lines.length} line(s)`
    });
    return result;
  }
}

export const salesReturnService = new SalesReturnService();
