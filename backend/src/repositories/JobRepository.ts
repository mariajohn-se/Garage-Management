import { queryView, queryViewPaginated, callProcedure } from '../db/callProcedure';
import { JobListItem, WorkInProgressItem, AssignedJobItem } from '../models/Job';

/** VERIFIED against the live JobInProgressSql view (30 columns, ~425 real rows). */

interface JobRow {
  ID: number;
  Ordr: string;
  Date: string | null;
  StatusID: number | null;
  Status: string | null;
  StatusDescription: string | null;
  StaffName: string | null;
  VehNo: string | null;
  custname: string | null;
  CLOSED: number | null;
  FinishedStatusYN: number | null;
  Remarks: string | null;
}

function toJob(row: JobRow): JobListItem {
  return {
    id: row.ID,
    ordr: row.Ordr,
    date: row.Date,
    statusId: row.StatusID,
    status: row.Status,
    statusDescription: row.StatusDescription,
    staffName: row.StaffName,
    vehNo: row.VehNo,
    customerName: row.custname,
    closed: !!row.CLOSED,
    finished: !!row.FinishedStatusYN,
    remarks: row.Remarks
  };
}

const JOB_COLUMNS = `ID, Ordr, Date, StatusID, Status, StatusDescription, StaffName, VehNo, custname, CLOSED, FinishedStatusYN, Remarks`;

interface WipRow {
  ID: number;
  Ordr: string | null;
  EmpName: string | null;
  Date: string | null;
  ActivityCode: string | null;
  LoggedIN: string | null;
  LoggedOut: string | null;
  WorkDescription: string | null;
  completedYN: number | null;
  cancelledYN: number | null;
  Status: string | null;
  TotalTime: string | null;
}

function toWip(row: WipRow): WorkInProgressItem {
  return {
    id: row.ID,
    ordr: row.Ordr,
    empName: row.EmpName,
    date: row.Date,
    activityCode: row.ActivityCode,
    loggedIn: row.LoggedIN,
    loggedOut: row.LoggedOut,
    workDescription: row.WorkDescription,
    completed: !!row.completedYN,
    cancelled: !!row.cancelledYN,
    status: row.Status,
    totalTime: row.TotalTime
  };
}

const WIP_COLUMNS = `ID, Ordr, EmpName, Date, ActivityCode, LoggedIN, LoggedOut, WorkDescription, completedYN, cancelledYN, Status, TotalTime`;

interface AssignedRow {
  DtlId: number;
  ordr: string;
  EmpName: string | null;
  DateofAssign: string | null;
  CompletedYN: number | null;
  CancelledYN: number | null;
  Status: string | null;
}

function toAssigned(row: AssignedRow): AssignedJobItem {
  return {
    dtlId: row.DtlId,
    ordr: row.ordr,
    empName: row.EmpName,
    dateOfAssign: row.DateofAssign,
    completed: !!row.CompletedYN,
    cancelled: !!row.CancelledYN,
    status: row.Status
  };
}

const ASSIGNED_COLUMNS = `DtlId, ordr, EmpName, DateofAssign, CompletedYN, CancelledYN, Status`;

export class JobRepository {
  async list(filters: { status?: string; customerName?: string; page: number; limit: number }): Promise<{
    items: JobListItem[];
    total: number;
  }> {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};
    if (filters.status) {
      conditions.push('Status = @status');
      params.status = filters.status;
    }
    if (filters.customerName) {
      conditions.push('custname LIKE @customerName');
      params.customerName = `%${filters.customerName}%`;
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const totalRows = await queryView<{ cnt: number }>(`SELECT COUNT(*) AS cnt FROM JobInProgressSql ${where}`, params);
    const total = totalRows[0]?.cnt ?? 0;

    const rows = await queryViewPaginated<JobRow>(
      JOB_COLUMNS,
      'JobInProgressSql',
      where,
      'ID DESC',
      params,
      filters.page,
      filters.limit
    );
    return { items: rows.map(toJob), total };
  }

  async findById(id: number): Promise<JobListItem | null> {
    const rows = await queryView<JobRow>(`SELECT ${JOB_COLUMNS} FROM JobInProgressSql WHERE ID = @id`, { id });
    return rows.length ? toJob(rows[0]) : null;
  }

  // Placeholder procedure names - not confirmed against the real SP catalog.
  async updateStatus(id: number, statusId: number): Promise<void> {
    await callProcedure('sp_UpdateJobStatus', { ID: id, StatusID: statusId });
  }

  async listWorkInProgress(filters: { page: number; limit: number }): Promise<{
    items: WorkInProgressItem[];
    total: number;
  }> {
    const totalRows = await queryView<{ cnt: number }>('SELECT COUNT(*) AS cnt FROM WorkInProgressSql');
    const total = totalRows[0]?.cnt ?? 0;
    const rows = await queryViewPaginated<WipRow>(
      WIP_COLUMNS,
      'WorkInProgressSql',
      '',
      'ID DESC',
      {},
      filters.page,
      filters.limit
    );
    return { items: rows.map(toWip), total };
  }

  async listAssigned(filters: { ordr?: string; page: number; limit: number }): Promise<{
    items: AssignedJobItem[];
    total: number;
  }> {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};
    if (filters.ordr) {
      conditions.push('ordr = @ordr');
      params.ordr = filters.ordr;
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const totalRows = await queryView<{ cnt: number }>(`SELECT COUNT(*) AS cnt FROM AssignedJobsSql ${where}`, params);
    const total = totalRows[0]?.cnt ?? 0;
    const rows = await queryViewPaginated<AssignedRow>(
      ASSIGNED_COLUMNS,
      'AssignedJobsSql',
      where,
      'DtlId DESC',
      params,
      filters.page,
      filters.limit
    );
    return { items: rows.map(toAssigned), total };
  }

  // Placeholder procedure name - not confirmed against the real SP catalog.
  async assignStaff(ordr: string, empId: number): Promise<void> {
    await callProcedure('InsertAssignedJobs', { Ordr: ordr, EmpId: empId });
  }
}

export const jobRepository = new JobRepository();
