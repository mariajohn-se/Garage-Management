import { Request } from 'express';
import { insuranceInvoiceRepository } from '../repositories/InsuranceInvoiceRepository';
import { logUserEvent } from '../auth/userlog';
import { NotFoundError, ValidationError } from '../utils/errors';
import { InsuranceInvoiceInput } from '../models/InsuranceInvoice';

export class InsuranceInvoiceService {
  async list(filters: { page: number; limit: number }) {
    return insuranceInvoiceRepository.list(filters);
  }

  async get(id: number) {
    const header = await insuranceInvoiceRepository.findById(id);
    if (!header) throw new NotFoundError('Insurance invoice not found.');
    const lines = await insuranceInvoiceRepository.getLines(id);
    return { ...header, lines };
  }

  async create(req: Request, input: InsuranceInvoiceInput): Promise<{ id: number; billNo: string }> {
    if (!input.estimationNo?.trim()) throw new ValidationError('Estimation is required.');
    if (!input.bill?.trim()) throw new ValidationError('Sales invoice reference is required.');
    if (!input.customerName?.trim()) throw new ValidationError('Customer/insurer name is required.');
    if (!input.invoiceDt) throw new ValidationError('Invoice date is required.');
    if (!input.lines?.length) throw new ValidationError('At least one line item is required.');

    const [estimationOk, billOk] = await Promise.all([
      insuranceInvoiceRepository.estimationExists(input.estimationNo),
      insuranceInvoiceRepository.billExists(input.bill)
    ]);
    if (!estimationOk) {
      throw new ValidationError('Selected estimation was not found - please pick one from the search results.');
    }
    if (!billOk) {
      throw new ValidationError('Selected sales invoice was not found - please pick one from the search results.');
    }

    const result = await insuranceInvoiceRepository.create(input, req.user!.username);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Insurance Invoice Created',
      remarks: `Insurance invoice ${result.billNo} for estimation ${input.estimationNo}, bill ${input.bill}`
    });
    return result;
  }
}

export const insuranceInvoiceService = new InsuranceInvoiceService();
