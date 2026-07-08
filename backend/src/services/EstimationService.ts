import { Request } from 'express';
import { estimationRepository } from '../repositories/EstimationRepository';
import { logUserEvent } from '../auth/userlog';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors';

export class EstimationService {
  async list(filters: { customerName?: string; vehNo?: string; approved?: 'yes' | 'no'; page: number; limit: number }) {
    return estimationRepository.list(filters);
  }

  async get(id: number) {
    const estimation = await estimationRepository.findById(id);
    if (!estimation) throw new NotFoundError('Estimation not found.');
    const lines = await estimationRepository.getLines(id).catch(() => []);
    return { ...estimation, lines };
  }

  /** BR-40: only Supervisor/Administrator may approve/reject. */
  async setApproval(req: Request, id: number, approved: boolean, remarks?: string): Promise<void> {
    if (!req.user?.roles.some((r) => r === 'Supervisor' || r === 'Administrator')) {
      throw new ForbiddenError('Only a supervisor or administrator can approve or reject estimations.');
    }
    if (!approved && !remarks?.trim()) {
      throw new ValidationError('A comment is required when rejecting an estimation.');
    }
    const existing = await estimationRepository.findById(id);
    if (!existing) throw new NotFoundError('Estimation not found.');
    await estimationRepository.setApproval(id, approved, remarks, req.user!.username);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: approved ? 'Estimation Approved' : 'Estimation Rejected',
      remarks: `Estimation ${id}${remarks ? `: ${remarks}` : ''}`
    });
  }
}

export const estimationService = new EstimationService();
