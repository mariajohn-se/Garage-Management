import { Request } from 'express';
import { remarksRepository } from '../repositories/RemarksRepository';
import { logUserEvent } from '../auth/userlog';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors';
import { AdditionalRemark } from '../models/Document';

function validateText(remarks: string): void {
  if (!remarks?.trim()) throw new ValidationError('Remarks text is required.');
  if (remarks.length > 500) throw new ValidationError('Remarks must be 500 characters or fewer.');
}

export class RemarksService {
  async listByOrder(ordr: string): Promise<AdditionalRemark[]> {
    if (!ordr) throw new ValidationError('ordr is required.');
    return remarksRepository.listByOrder(ordr);
  }

  async report(filters: { ordr?: string; search?: string; page: number; limit: number }) {
    return remarksRepository.report(filters);
  }

  async create(req: Request, input: { ordr: string; remarks: string }): Promise<number> {
    if (!input.ordr?.trim()) throw new ValidationError('An order/transaction reference is required.');
    validateText(input.remarks);
    const id = await remarksRepository.create({ ordr: input.ordr.trim(), remarks: input.remarks.trim() });
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Remark Added',
      remarks: `Added remark to order ${input.ordr}`
    });
    return id;
  }

  async update(req: Request, id: number, remarks: string): Promise<void> {
    validateText(remarks);
    const existing = await remarksRepository.findById(id);
    if (!existing) throw new NotFoundError('Remark not found.');
    await remarksRepository.update(id, remarks.trim());
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Remark Updated',
      remarks: `Updated remark ${id}`
    });
  }

  /** BR-35 analog: only supervisor/admin can delete, per IMPLEMENTATION_PHASE4_v12.md. */
  async delete(req: Request, id: number): Promise<void> {
    if (!req.user?.roles.some((r) => r === 'Supervisor' || r === 'Administrator')) {
      throw new ForbiddenError('Only a supervisor or administrator can delete remarks.');
    }
    const existing = await remarksRepository.findById(id);
    if (!existing) throw new NotFoundError('Remark not found.');
    await remarksRepository.delete(id);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Remark Deleted',
      remarks: `Deleted remark ${id}`
    });
  }
}

export const remarksService = new RemarksService();
