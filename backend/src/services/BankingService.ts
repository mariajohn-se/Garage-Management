import { Request } from 'express';
import { bankingRepository } from '../repositories/BankingRepository';
import { logUserEvent } from '../auth/userlog';
import { NotFoundError, ValidationError } from '../utils/errors';

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
}

export const bankingService = new BankingService();
