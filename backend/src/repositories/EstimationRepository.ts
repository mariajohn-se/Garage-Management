import { queryView, queryViewPaginated, callProcedure } from '../db/callProcedure';
import { EstimationListItem, EstimationLine } from '../models/Job';

/**
 * VERIFIED against the live Estimation01Sql view (32 columns, 5940 real rows). `ID` is the
 * view's own row identifier; `JObCardNo` (unusual casing, preserved from the real column
 * name) is the human-facing job card reference used elsewhere in the app.
 */

interface EstimationRow {
  ID: number;
  EstimationNo: string | null;
  JObCardNo: string | null;
  custname: string | null;
  VehNo: string | null;
  StaffName: string | null;
  BillDt: string | null;
  Total: number | null;
  totlabour: number | null;
  nett: number | null;
  Approved: number | null;
  Remarks: string | null;
}

function toEstimation(row: EstimationRow): EstimationListItem {
  return {
    id: row.ID,
    estimationNo: row.EstimationNo,
    jobCardNo: row.JObCardNo,
    customerName: row.custname,
    vehNo: row.VehNo,
    staffName: row.StaffName,
    billDate: row.BillDt,
    total: row.Total,
    labourTotal: row.totlabour,
    net: row.nett,
    approved: !!row.Approved,
    remarks: row.Remarks
  };
}

const SELECT_COLUMNS = `ID, EstimationNo, JObCardNo, custname, VehNo, StaffName, BillDt, Total, totlabour, nett, Approved, Remarks`;

export class EstimationRepository {
  async list(filters: {
    customerName?: string;
    vehNo?: string;
    approved?: 'yes' | 'no';
    page: number;
    limit: number;
  }): Promise<{ items: EstimationListItem[]; total: number }> {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};
    if (filters.customerName) {
      conditions.push('custname LIKE @customerName');
      params.customerName = `%${filters.customerName}%`;
    }
    if (filters.vehNo) {
      conditions.push('VehNo LIKE @vehNo');
      params.vehNo = `%${filters.vehNo}%`;
    }
    if (filters.approved) {
      conditions.push(filters.approved === 'yes' ? 'Approved <> 0' : '(Approved = 0 OR Approved IS NULL)');
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const totalRows = await queryView<{ cnt: number }>(`SELECT COUNT(*) AS cnt FROM Estimation01Sql ${where}`, params);
    const total = totalRows[0]?.cnt ?? 0;

    const rows = await queryViewPaginated<EstimationRow>(
      SELECT_COLUMNS,
      'Estimation01Sql',
      where,
      'ID DESC',
      params,
      filters.page,
      filters.limit
    );
    return { items: rows.map(toEstimation), total };
  }

  async findById(id: number): Promise<EstimationListItem | null> {
    const rows = await queryView<EstimationRow>(`SELECT ${SELECT_COLUMNS} FROM Estimation01Sql WHERE ID = @id`, {
      id
    });
    return rows.length ? toEstimation(rows[0]) : null;
  }

  /** Real, documented SP (DB_CONNECTION_SPEC_v12.md) - line-item detail for a job card. */
  async getLines(jobCardNo: string): Promise<EstimationLine[]> {
    return callProcedure<EstimationLine>('spGetEstmationDetails', { JobCardNo: jobCardNo });
  }

  // Placeholder procedure name - not confirmed against the real SP catalog.
  async setApproval(id: number, approved: boolean, remarks?: string): Promise<void> {
    await callProcedure('sp_ApproveEstimation', { ID: id, Approved: approved ? 1 : 0, Remarks: remarks ?? null });
  }
}

export const estimationRepository = new EstimationRepository();
