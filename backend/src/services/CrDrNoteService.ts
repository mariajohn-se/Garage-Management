import { Request } from 'express';
import { crDrNoteRepository } from '../repositories/CrDrNoteRepository';
import { ledgerRepository } from '../repositories/LedgerRepository';
import { logUserEvent } from '../auth/userlog';
import { NotFoundError, ValidationError } from '../utils/errors';
import { CrDrNoteInput } from '../models/CrDrNote';

export class CrDrNoteService {
  async list(filters: { page: number; limit: number }) {
    return crDrNoteRepository.list(filters);
  }

  async get(id: number) {
    const note = await crDrNoteRepository.findById(id);
    if (!note) throw new NotFoundError('Credit/debit note not found.');
    return note;
  }

  async create(req: Request, input: CrDrNoteInput): Promise<{ id: number; refNo: string }> {
    if (!input.ac?.trim()) throw new ValidationError('Account is required.');
    if (!input.vac?.trim()) throw new ValidationError('Contra account is required.');
    if (input.ac === input.vac) throw new ValidationError('Account and contra account cannot be the same.');
    if (!input.amount || input.amount <= 0) throw new ValidationError('Amount must be greater than zero.');
    if (!input.refDt) throw new ValidationError('Date is required.');

    const [acHead, vacHead] = await Promise.all([
      ledgerRepository.getAccountHead(input.ac),
      ledgerRepository.getAccountHead(input.vac)
    ]);
    if (!acHead) throw new ValidationError('Selected account was not found - please pick one from the search results.');
    if (!vacHead) {
      throw new ValidationError('Selected contra account was not found - please pick one from the search results.');
    }

    const result = await crDrNoteRepository.create(input, req.user!.username);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: input.type === 'Credit' ? 'Credit Note Created' : 'Debit Note Created',
      remarks: `${input.type} note ${result.refNo}: ${input.ac} / ${input.vac}, amount ${input.amount}`
    });
    return result;
  }
}

export const crDrNoteService = new CrDrNoteService();
