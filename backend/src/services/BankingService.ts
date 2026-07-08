import { Request } from 'express';
import { bankingRepository } from '../repositories/BankingRepository';
import { ledgerRepository } from '../repositories/LedgerRepository';
import { logUserEvent } from '../auth/userlog';
import { NotFoundError, ValidationError } from '../utils/errors';
import { ReceiptPaymentVoucherInput } from '../models/Banking';

export class BankingService {
  async listVouchers(filters: { vtype?: string; payType?: string; page: number; limit: number }) {
    return bankingRepository.listVouchers(filters);
  }

  async getVoucher(id: number, vsrl: string) {
    const voucher = await bankingRepository.getVoucher(id, vsrl);
    if (!voucher) throw new NotFoundError('Voucher not found.');
    return voucher;
  }

  async listBankAccounts() {
    return bankingRepository.listBankAccounts();
  }

  async cashBankDetails(account: string, fromDate: string, toDate: string, type?: string) {
    if (!account) throw new ValidationError('Account is required.');
    if (!fromDate || !toDate) throw new ValidationError('From date and to date are required.');
    return bankingRepository.cashBankDetails(account, fromDate, toDate, type);
  }

  async listVerification(userId: string, checked: boolean, payType?: string) {
    return bankingRepository.listVerification(userId, checked, payType);
  }

  /** BR-83 analog: verification actions are audit logged. RBAC-gated at the route. */
  async markVerified(req: Request, vsrl: string): Promise<void> {
    if (!vsrl?.trim()) throw new ValidationError('Voucher reference is required.');
    await bankingRepository.markVerified(vsrl, req.user!.username);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Voucher Verified',
      remarks: `Marked voucher ${vsrl} as verified`
    });
  }

  async filterAccountEntries(dateFrom: string, dateTo: string, ac?: string) {
    if (!dateFrom || !dateTo) throw new ValidationError('Date from and date to are required.');
    return bankingRepository.filterAccountEntries(dateFrom, dateTo, ac);
  }

  async voucherActionLog(filters: { vsrl?: string; page: number; limit: number }) {
    return bankingRepository.voucherActionLog(filters);
  }

  /**
   * Same validation spirit as LedgerService.createJournalVoucher - every account is verified
   * against the real chart of accounts before writing, since ACDETAILSSQL inner-joins both AC
   * and VAC. The cash/bank account is additionally required to be a real BANK=1 account (the
   * same list Cash/Bank Book already uses), since that's what makes a Receipt/Payment a
   * Receipt/Payment rather than a generic Journal.
   */
  async createReceiptPaymentVoucher(req: Request, input: ReceiptPaymentVoucherInput): Promise<{ id: number; vsrl: string }> {
    if (input.type !== 'Receipt' && input.type !== 'Payment') {
      throw new ValidationError('Type must be Receipt or Payment.');
    }
    if (!input.date) throw new ValidationError('Date is required.');
    if (!input.narration?.trim()) throw new ValidationError('Narration is required.');
    if (!input.cashBankAc?.trim()) throw new ValidationError('Cash/bank account is required.');
    if (!input.lines?.length) throw new ValidationError('At least one line is required.');

    const bankAccounts = await bankingRepository.listBankAccounts();
    if (!bankAccounts.some((a) => a.code === input.cashBankAc)) {
      throw new ValidationError(`${input.cashBankAc} is not a real cash/bank account.`);
    }
    for (const line of input.lines) {
      if (!line.ac?.trim()) throw new ValidationError('Every line requires an account.');
      if (line.ac === input.cashBankAc) {
        throw new ValidationError('A line cannot use the same account as the cash/bank side.');
      }
      if (!line.amount || line.amount <= 0) {
        throw new ValidationError('Every line requires an amount greater than zero.');
      }
      const head = await ledgerRepository.getAccountHead(line.ac.trim());
      if (!head) throw new ValidationError(`Account ${line.ac} does not exist.`);
      if (head.locked) throw new ValidationError(`Account ${line.ac} (${head.description}) is locked.`);
    }

    const result = await bankingRepository.createReceiptPaymentVoucher(input);
    const total = input.lines.reduce((sum, l) => sum + l.amount, 0);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: input.type === 'Receipt' ? 'Receipt Voucher Created' : 'Payment Voucher Created',
      remarks: `Created ${input.type.toLowerCase()} voucher ${result.vsrl} against ${input.cashBankAc}, ${input.lines.length} line(s), total ${total.toFixed(2)}`
    });
    return result;
  }
}

export const bankingService = new BankingService();
