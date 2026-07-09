import { Request } from 'express';
import { ledgerRepository } from '../repositories/LedgerRepository';
import { logUserEvent } from '../auth/userlog';
import { NotFoundError, ValidationError } from '../utils/errors';
import { JournalVoucherInput } from '../models/Ledger';

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

  async balanceSheet(fromDate: string, toDate: string) {
    if (!fromDate || !toDate) throw new ValidationError('From date and to date are required.');
    return ledgerRepository.balanceSheet(fromDate, toDate);
  }

  async openingBalance(ac: string, asOfDate: string) {
    if (!ac?.trim()) throw new ValidationError('Account code is required.');
    if (!asOfDate) throw new ValidationError('As-of date is required.');
    const head = await ledgerRepository.getAccountHead(ac);
    if (!head) throw new NotFoundError('Account head not found.');
    return ledgerRepository.openingBalance(ac, asOfDate);
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

  /**
   * BR-style validation for the first direct general-ledger write path in this codebase - see
   * LedgerRepository.createJournalVoucher's own comment for the schema-level judgment calls
   * (CurBal, ACTEMP/VAC sentinels, GroupID). Every account code is verified against the real
   * chart of accounts before writing, since ACDETAILSSQL inner-joins both AC and VAC to
   * ACHEADSQL - an unmatched code would silently make the new lines invisible rather than error.
   */
  async createJournalVoucher(req: Request, input: JournalVoucherInput): Promise<{ id: number; vsrl: string }> {
    if (!input.date) throw new ValidationError('Date is required.');
    if (!input.narration?.trim()) throw new ValidationError('Narration is required.');
    if (!input.lines || input.lines.length < 2) {
      throw new ValidationError('At least two lines are required for a balanced journal entry.');
    }
    for (const line of input.lines) {
      if (!line.ac?.trim()) throw new ValidationError('Every line requires an account.');
      if ((line.debit ?? 0) < 0 || (line.credit ?? 0) < 0) {
        throw new ValidationError('Debit and credit amounts cannot be negative.');
      }
      if ((line.debit ?? 0) > 0 && (line.credit ?? 0) > 0) {
        throw new ValidationError('A line cannot have both a debit and a credit amount.');
      }
      if ((line.debit ?? 0) === 0 && (line.credit ?? 0) === 0) {
        throw new ValidationError('Every line requires a nonzero debit or credit amount.');
      }
      const head = await ledgerRepository.getAccountHead(line.ac.trim());
      if (!head) throw new ValidationError(`Account ${line.ac} does not exist.`);
      if (head.locked) throw new ValidationError(`Account ${line.ac} (${head.description}) is locked.`);
    }
    const totalDebit = input.lines.reduce((sum, l) => sum + (l.debit ?? 0), 0);
    const totalCredit = input.lines.reduce((sum, l) => sum + (l.credit ?? 0), 0);
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new ValidationError(
        `Journal entry is not balanced: total debit ${totalDebit.toFixed(2)} does not equal total credit ${totalCredit.toFixed(2)}.`
      );
    }

    const result = await ledgerRepository.createJournalVoucher(input);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Journal Voucher Created',
      remarks: `Created journal voucher ${result.vsrl}, ${input.lines.length} line(s), total ${totalDebit.toFixed(2)}`
    });
    return result;
  }
}

export const ledgerService = new LedgerService();
