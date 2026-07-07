import { Request } from 'express';
import { jobRepository } from '../repositories/JobRepository';
import { logUserEvent } from '../auth/userlog';
import { NotFoundError, ValidationError } from '../utils/errors';

export class JobService {
  async list(filters: { status?: string; customerName?: string; page: number; limit: number }) {
    return jobRepository.list(filters);
  }

  async get(id: number) {
    const job = await jobRepository.findById(id);
    if (!job) throw new NotFoundError('Job not found.');
    return job;
  }

  /** BR-42: cannot assign an inactive status to a job (statusId <= 0 treated as invalid). */
  async updateStatus(req: Request, id: number, statusId: number): Promise<void> {
    if (!statusId || statusId <= 0) throw new ValidationError('A valid status is required.');
    const existing = await jobRepository.findById(id);
    if (!existing) throw new NotFoundError('Job not found.');
    await jobRepository.updateStatus(id, statusId);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Job Status Changed',
      remarks: `Job ${id} -> status ${statusId}`
    });
  }

  async listWorkInProgress(filters: { page: number; limit: number }) {
    return jobRepository.listWorkInProgress(filters);
  }

  async listAssigned(filters: { ordr?: string; page: number; limit: number }) {
    return jobRepository.listAssigned(filters);
  }

  async assignStaff(req: Request, ordr: string, empId: number): Promise<void> {
    if (!ordr?.trim()) throw new ValidationError('Order reference is required.');
    if (!empId) throw new ValidationError('Staff is required.');
    await jobRepository.assignStaff(ordr, empId);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Job Assigned',
      remarks: `Order ${ordr} assigned to staff ${empId}`
    });
  }
}

export const jobService = new JobService();
