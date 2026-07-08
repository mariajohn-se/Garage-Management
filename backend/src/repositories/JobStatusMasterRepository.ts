import { queryView, executeWrite, withNextNumericId } from '../db/callProcedure';
import { JobStatus } from '../models/Job';

/**
 * VERIFIED against the live salesOrdrStatusHead table (10 columns, 17 real rows - small
 * reference/master data). No separate read view exists for it, so this reads the base table
 * directly, which STANDARDS.md explicitly allows when no SP/view exists.
 */

interface StatusRow {
  StatusID: number;
  Description: string;
  FinishedStatusYN: number | null;
  PartsNotAvailYN: number | null;
  INProgressYN: number | null;
  ForeColour: string | null;
  BackColour: string | null;
  AssignedYN: number | null;
  ApprovedYN: number | null;
  SortOrder: number | null;
}

function toStatus(row: StatusRow): JobStatus {
  return {
    statusId: row.StatusID,
    description: row.Description,
    finishedStatus: !!row.FinishedStatusYN,
    partsNotAvailable: !!row.PartsNotAvailYN,
    inProgress: !!row.INProgressYN,
    foreColour: row.ForeColour,
    backColour: row.BackColour,
    assigned: !!row.AssignedYN,
    approved: !!row.ApprovedYN,
    sortOrder: row.SortOrder
  };
}

const SELECT_COLUMNS = `StatusID, Description, FinishedStatusYN, PartsNotAvailYN, INProgressYN, ForeColour, BackColour, AssignedYN, ApprovedYN, SortOrder`;

export class JobStatusMasterRepository {
  async list(): Promise<JobStatus[]> {
    const rows = await queryView<StatusRow>(`SELECT ${SELECT_COLUMNS} FROM salesOrdrStatusHead ORDER BY SortOrder`);
    return rows.map(toStatus);
  }

  async findById(statusId: number): Promise<JobStatus | null> {
    const rows = await queryView<StatusRow>(
      `SELECT ${SELECT_COLUMNS} FROM salesOrdrStatusHead WHERE StatusID = @statusId`,
      { statusId }
    );
    return rows.length ? toStatus(rows[0]) : null;
  }

  /** salesOrdrStatusHead.StatusID (PK) has no identity backing it live - app-generated MAX+1. */
  async create(input: Omit<JobStatus, 'statusId'>): Promise<number> {
    return withNextNumericId('salesOrdrStatusHead', 'StatusID', async (nextId, req) => {
      await req
        .input('StatusID', nextId)
        .input('Description', input.description)
        .input('FinishedStatusYN', input.finishedStatus ? 1 : 0)
        .input('PartsNotAvailYN', input.partsNotAvailable ? 1 : 0)
        .input('INProgressYN', input.inProgress ? 1 : 0)
        .input('ForeColour', input.foreColour ?? null)
        .input('BackColour', input.backColour ?? null)
        .input('AssignedYN', input.assigned ? 1 : 0)
        .input('ApprovedYN', input.approved ? 1 : 0)
        .input('SortOrder', input.sortOrder ?? null).query(`
          INSERT INTO salesOrdrStatusHead
            (StatusID, Description, FinishedStatusYN, PartsNotAvailYN, INProgressYN, ForeColour, BackColour, AssignedYN, ApprovedYN, SortOrder)
          VALUES
            (@StatusID, @Description, @FinishedStatusYN, @PartsNotAvailYN, @INProgressYN, @ForeColour, @BackColour, @AssignedYN, @ApprovedYN, @SortOrder)
        `);
      return nextId;
    });
  }

  async update(statusId: number, changes: Partial<Omit<JobStatus, 'statusId'>>): Promise<void> {
    const sets: string[] = [];
    const params: Record<string, unknown> = { statusId };
    if (changes.description !== undefined) { sets.push('Description = @Description'); params.Description = changes.description; }
    if (changes.finishedStatus !== undefined) { sets.push('FinishedStatusYN = @FinishedStatusYN'); params.FinishedStatusYN = changes.finishedStatus ? 1 : 0; }
    if (changes.partsNotAvailable !== undefined) { sets.push('PartsNotAvailYN = @PartsNotAvailYN'); params.PartsNotAvailYN = changes.partsNotAvailable ? 1 : 0; }
    if (changes.inProgress !== undefined) { sets.push('INProgressYN = @INProgressYN'); params.INProgressYN = changes.inProgress ? 1 : 0; }
    if (changes.foreColour !== undefined) { sets.push('ForeColour = @ForeColour'); params.ForeColour = changes.foreColour; }
    if (changes.backColour !== undefined) { sets.push('BackColour = @BackColour'); params.BackColour = changes.backColour; }
    if (changes.assigned !== undefined) { sets.push('AssignedYN = @AssignedYN'); params.AssignedYN = changes.assigned ? 1 : 0; }
    if (changes.approved !== undefined) { sets.push('ApprovedYN = @ApprovedYN'); params.ApprovedYN = changes.approved ? 1 : 0; }
    if (changes.sortOrder !== undefined) { sets.push('SortOrder = @SortOrder'); params.SortOrder = changes.sortOrder; }
    if (!sets.length) return;
    await executeWrite(`UPDATE salesOrdrStatusHead SET ${sets.join(', ')} WHERE StatusID = @statusId`, params);
  }

  async delete(statusId: number): Promise<void> {
    await executeWrite('DELETE FROM salesOrdrStatusHead WHERE StatusID = @statusId', { statusId });
  }
}

export const jobStatusMasterRepository = new JobStatusMasterRepository();
