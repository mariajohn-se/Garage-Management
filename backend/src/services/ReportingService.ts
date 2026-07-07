import { Request } from 'express';
import { reportingRepository } from '../repositories/ReportingRepository';
import { logUserEvent } from '../auth/userlog';
import { NotFoundError, ValidationError } from '../utils/errors';

export class ReportingService {
  async getCompanyHeader() {
    const header = await reportingRepository.getCompanyHeader();
    if (!header) throw new NotFoundError('Company header not found.');
    return header;
  }

  async updateCompanyHeader(req: Request, changes: { companyName?: string; address1?: string }): Promise<void> {
    if (changes.companyName !== undefined && !changes.companyName.trim()) {
      throw new ValidationError('Company name cannot be empty.');
    }
    await reportingRepository.updateCompanyHeader(changes);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Company Header Updated',
      remarks: `Updated company header: ${JSON.stringify(changes)}`
    });
  }

  async listMenu() {
    return reportingRepository.listMenu();
  }
}

export const reportingService = new ReportingService();
