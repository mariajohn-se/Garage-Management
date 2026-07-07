import { Request } from 'express';
import { ledgerRepository } from '../repositories/LedgerRepository';
import { logUserEvent } from '../auth/userlog';
import { NotFoundError, ValidationError } from '../utils/errors';

export class LedgerService {
  async listAccountHeads(filters: { search?: string; page: number; limit: number }) {
    return ledgerRepository.listAccountHeads(filters);
  }

  async getAccountHead(codes: string) {
    const head = await ledgerRepository.getAccountHead(codes);
    if (!head) throw new NotFoundError('Account head not found.');
    return head;
  }

  async accountHeadTree() {
    return ledgerRepository.accountHeadTree();
  }

  /** BR-93 analog: description required. RBAC-gated at the route (Administrator). */
  async createAccountHead(req: Request, input: { description: string; headUnder?: string }): Promise<string> {
    if (!input.description?.trim()) throw new ValidationError('Description is required.');
    const codes = await ledgerRepository.createAccountHead(input);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Account Head Created',
      remarks: `Created account head: ${input.description}`
    });
    return codes;
  }

  async updateAccountHead(req: Request, codes: string, changes: { description?: string }): Promise<void> {
    const existing = await ledgerRepository.getAccountHead(codes);
    if (!existing) throw new NotFoundError('Account head not found.');
    if (changes.description !== undefined && !changes.description.trim()) {
      throw new ValidationError('Description cannot be empty.');
    }
    await ledgerRepository.updateAccountHead(codes, changes);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Account Head Updated',
      remarks: `Updated account head ${codes}: ${JSON.stringify(changes)}`
    });
  }

  async trialBalance(fromDate: string, toDate: string) {
    if (!fromDate || !toDate) throw new ValidationError('From date and to date are required.');
    const rows = await ledgerRepository.trialBalance(fromDate, toDate);
    return { rows, summary: ledgerRepository.computeTrialBalanceSummary(rows) };
  }

  async listBulkJournals(filters: { page: number; limit: number }) {
    return ledgerRepository.listBulkJournals(filters);
  }

  async listBulkPdcReceipts(filters: { page: number; limit: number }) {
    return ledgerRepository.listBulkPdcReceipts(filters);
  }

  async listBulkPdcs(filters: { page: number; limit: number }) {
    return ledgerRepository.listBulkPdcs(filters);
  }
}

export const ledgerService = new LedgerService();
