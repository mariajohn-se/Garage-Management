import { queryView, callProcedure } from '../db/callProcedure';
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

  // Placeholder procedure names - matches IMPLEMENTATION_PHASE5_v12.md's own suggested names;
  // not confirmed against the real SP catalog.
  async create(input: Omit<JobStatus, 'statusId'>): Promise<number> {
    const rows = await callProcedure<{ StatusID: number }>('InsertSalesOrdrStatusHead', {
      Description: input.description,
      FinishedStatusYN: input.finishedStatus ? 1 : 0,
      PartsNotAvailYN: input.partsNotAvailable ? 1 : 0,
      INProgressYN: input.inProgress ? 1 : 0,
      ForeColour: input.foreColour,
      BackColour: input.backColour,
      SortOrder: input.sortOrder
    });
    return rows[0]?.StatusID;
  }

  async update(statusId: number, changes: Partial<Omit<JobStatus, 'statusId'>>): Promise<void> {
    await callProcedure('UpdateSalesOrdrStatusHead', {
      StatusID: statusId,
      Description: changes.description,
      FinishedStatusYN: changes.finishedStatus === undefined ? undefined : changes.finishedStatus ? 1 : 0,
      ForeColour: changes.foreColour,
      BackColour: changes.backColour,
      SortOrder: changes.sortOrder
    });
  }

  async delete(statusId: number): Promise<void> {
    await callProcedure('DeleteSalesOrdrStatusHead', { StatusID: statusId });
  }
}

export const jobStatusMasterRepository = new JobStatusMasterRepository();
