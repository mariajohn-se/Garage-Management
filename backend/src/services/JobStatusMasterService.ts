import { Request } from 'express';
import { jobStatusMasterRepository } from '../repositories/JobStatusMasterRepository';
import { logUserEvent } from '../auth/userlog';
import { ValidationError, NotFoundError } from '../utils/errors';
import { JobStatus } from '../models/Job';

/** BR-50: only Administrator may modify the job status master list - enforced at the route. */
export class JobStatusMasterService {
  async list(): Promise<JobStatus[]> {
    return jobStatusMasterRepository.list();
  }

  async create(req: Request, input: Omit<JobStatus, 'statusId'>): Promise<number> {
    if (!input.description?.trim()) throw new ValidationError('Description is required.');
    const id = await jobStatusMasterRepository.create(input);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Job Status Master Created',
      remarks: `Created status "${input.description}"`
    });
    return id;
  }

  async update(req: Request, statusId: number, changes: Partial<Omit<JobStatus, 'statusId'>>): Promise<void> {
    const existing = await jobStatusMasterRepository.findById(statusId);
    if (!existing) throw new NotFoundError('Status not found.');
    await jobStatusMasterRepository.update(statusId, changes);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Job Status Master Updated',
      remarks: `Updated status ${statusId}: ${JSON.stringify(changes)}`
    });
  }

  async delete(req: Request, statusId: number): Promise<void> {
    const existing = await jobStatusMasterRepository.findById(statusId);
    if (!existing) throw new NotFoundError('Status not found.');
    await jobStatusMasterRepository.delete(statusId);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Job Status Master Deleted',
      remarks: `Deleted status ${statusId}`
    });
  }
}

export const jobStatusMasterService = new JobStatusMasterService();
