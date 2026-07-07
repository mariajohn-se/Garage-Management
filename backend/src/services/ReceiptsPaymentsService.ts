import { receiptsPaymentsRepository } from '../repositories/ReceiptsPaymentsRepository';
import { ValidationError } from '../utils/errors';

export class ReceiptsPaymentsService {
  async listReceipts(filters: { search?: string; status?: 'paid' | 'outstanding'; page: number; limit: number }) {
    return receiptsPaymentsRepository.listBills({ ...filters, party: 'customer' });
  }

  async listPayments(filters: { search?: string; status?: 'paid' | 'outstanding'; page: number; limit: number }) {
    return receiptsPaymentsRepository.listBills({ ...filters, party: 'supplier' });
  }

  async getBillAllocations(bill: string) {
    if (!bill?.trim()) throw new ValidationError('Bill reference is required.');
    return receiptsPaymentsRepository.getBillAllocations(bill);
  }

  async discountHistory(fromDate: string, toDate: string, maxDiscount?: number) {
    if (!fromDate || !toDate) throw new ValidationError('From date and to date are required.');
    return receiptsPaymentsRepository.discountHistory(fromDate, toDate, maxDiscount);
  }
}

export const receiptsPaymentsService = new ReceiptsPaymentsService();
