import { Request } from 'express';
import { estimationRepository, EstimationInput, EstimationLineInput } from '../repositories/EstimationRepository';
import { logUserEvent } from '../auth/userlog';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors';

export class EstimationService {
  async list(filters: { customerName?: string; vehNo?: string; approved?: 'yes' | 'no'; page: number; limit: number }) {
    return estimationRepository.list(filters);
  }

  async searchStaff(query: string) {
    if (!query?.trim()) return [];
    return estimationRepository.searchStaff(query.trim());
  }

  async get(id: number) {
    const estimation = await estimationRepository.findById(id);
    if (!estimation) throw new NotFoundError('Estimation not found.');
    const lines = await estimationRepository.getLines(id).catch(() => []);
    return { ...estimation, lines };
  }

  private validateLines(lines: EstimationLineInput[]): void {
    if (!lines?.length) throw new ValidationError('At least one line item is required.');
    for (const line of lines) {
      if (!line.description?.trim()) throw new ValidationError('Every line requires a description.');
      if (!line.qty || line.qty <= 0) throw new ValidationError('Every line requires a quantity greater than zero.');
    }
  }

  /**
   * VERIFIED FINDING (2026-07-08): Estimation01Sql INNER JOINs to CustomerVehicleSql (on
   * VehicleId) and StaffSql (on StaffId) - a null/unmatched VehicleId or StaffId makes the row
   * vanish from every read path (list, detail, approval) while still existing in the base
   * table. Confirmed live: a row created with both null was invisible via findById() despite
   * insert succeeding; the identical row with real IDs read back correctly. Both are therefore
   * required here even though the base table itself allows null.
   */
  async create(req: Request, input: EstimationInput): Promise<{ id: number }> {
    if (!input.customerId?.trim()) throw new ValidationError('Customer is required.');
    if (!input.vehicleId) throw new ValidationError('Vehicle is required.');
    if (!input.staffId?.trim()) throw new ValidationError('Advisor is required.');
    if (!input.billDate) throw new ValidationError('Bill date is required.');
    this.validateLines(input.lines);
    const id = await estimationRepository.create(input);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Estimation Created',
      remarks: `Created estimation ${id} for customer ${input.customerId}, ${input.lines.length} line(s)`
    });
    return { id };
  }

  /** Approved estimations lock their line items - same reasoning as Order's BR-57 delivered lock. */
  async update(
    req: Request,
    id: number,
    changes: {
      vehicleId?: number | null;
      staffId?: string | null;
      remarks?: string | null;
      addition?: number;
      less?: number;
      lines?: EstimationLineInput[];
    }
  ): Promise<void> {
    const existing = await this.get(id);
    if (changes.vehicleId === null) throw new ValidationError('Vehicle is required.');
    if (changes.staffId === null) throw new ValidationError('Advisor is required.');
    if (changes.lines) {
      if (existing.approved) {
        throw new ForbiddenError(
          'This estimation has been approved - line items can no longer be edited.',
          'ESTIMATION_LOCKED_APPROVED'
        );
      }
      this.validateLines(changes.lines);
    }
    await estimationRepository.update(id, changes);
    await logUserEvent(req, {
      userId: req.user!.sub,
      userName: req.user!.username,
      action: 'Estimation Updated',
      remarks: `Updated estimation ${id}: ${JSON.stringify({ ...changes, lines: changes.lines?.length })}`
    });
  }

  /**
   * BR-40: only Supervisor/Administrator may approve/reject.
   * VERIFIED FINDING (2026-07-08): Partsavailable01 (the approval audit table) is keyed by
   * `Ordr` alone, but JObCardNo = '0' means "not yet linked to a job card" and is shared by
   * 2227 real estimations. Approving/rejecting one with JObCardNo = '0' writes a Partsavailable01
   * row with Ordr = '0', and Estimation01Sql's per-row Approved/DecisionDt lookup
   * (`WHERE Ordr = JobCardNo`) then matches that same row for *every* unlinked estimation -
   * confirmed live: one real reject action from earlier today made all 2227 of them display as
   * "Rejected" with the same unrelated comment. Blocking approval on unlinked estimations here
   * since the underlying table has no way to key them individually.
   */
  async setApproval(req: Request, id: number, approved: boolean, remarks?: string): Promise<void> {
    if (!req.user?.roles.some((r) => r === 'Supervisor' || r === 'Administrator')) {
      throw new ForbiddenError('Only a supervisor or administrator can approve or reject estimations.');
    }
    if (!approved && !remarks?.trim()) {
      throw new ValidationError('A comment is required when rejecting an estimation.');
    }
    const existing = await estimationRepository.findById(id);
    if (!existing) throw new NotFoundError('Estimation not found.');
    if (!existing.jobCardNo || existing.jobCardNo === '0') {
      throw new ValidationError(
        'This estimation is not linked to a job card yet - link it to a job card before approving or rejecting it.',
        'ESTIMATION_UNLINKED'
      );
    }
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
