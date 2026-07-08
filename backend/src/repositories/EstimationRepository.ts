import { queryView, queryViewPaginated, executeWrite, withNextNumericId } from '../db/callProcedure';
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
  DecisionDt: string | null;
  DecisionComment: string | null;
}

/**
 * Approved=0 means "not approved", which covers both "never decided" and "explicitly
 * rejected" - Estimation01Sql's collapsed Approved column can't tell them apart. DecisionDt
 * (Partsavailable01.ApprovedDt) is only ever set by setApproval() below, for either outcome,
 * so its presence is what actually distinguishes "rejected" from "still pending".
 */
function toEstimation(row: EstimationRow): EstimationListItem {
  const decided = row.DecisionDt != null;
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
    rejected: decided && !row.Approved,
    rejectionComment: decided && !row.Approved ? row.DecisionComment : null,
    remarks: row.Remarks
  };
}

const SELECT_COLUMNS = `ID, EstimationNo, JObCardNo, custname, VehNo, StaffName, BillDt, Total, totlabour, nett, Approved, Remarks,
  (SELECT TOP 1 ApprovedDt FROM Partsavailable01 WHERE Ordr = JObCardNo ORDER BY ID DESC) AS DecisionDt,
  (SELECT TOP 1 ServiceComment FROM Partsavailable01 WHERE Ordr = JObCardNo ORDER BY ID DESC) AS DecisionComment`;

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

  /**
   * VERIFIED FINDING (2026-07-08): spGetEstmationDetails (the previously-used "real, documented"
   * SP) does not actually return line items - it re-returns the Estimation01 header row joined
   * with customer/vehicle/staff, the same data findById() already provides. The real line-item
   * table is Estimation02 (49829 real rows), joined to the header by ID (not JobCardNo) per
   * Estimation02Sql's own view definition.
   */
  async getLines(id: number): Promise<EstimationLine[]> {
    const rows = await queryView<{
      Description: string | null;
      Qty: number | null;
      UnitPrice: number | null;
      labouramt: number | null;
    }>('SELECT Description, Qty, UnitPrice, labouramt FROM Estimation02 WHERE ID = @id ORDER BY Sort, Sl', { id });
    return rows.map((r) => ({
      description: r.Description,
      qty: r.Qty,
      unitPrice: r.UnitPrice,
      labourAmount: r.labouramt,
      amount: (r.Qty ?? 0) * (r.UnitPrice ?? 0)
    }));
  }

  /**
   * VERIFIED FINDING (2026-07-08): Estimation01Sql's `Approved` is NOT on Estimation01 itself -
   * its view definition resolves it as `ISNULL((SELECT Approved FROM Partsavailable01Sql WHERE
   * Ordr = JobCardNo), 0)`, and spGetEstmationDetails confirms the same join. Partsavailable01
   * is a real, writable base table (Approved/ApprovedDt/ApprovedAmt/ApprovedUser/ServiceComment
   * columns - a genuine parts-approval audit trail), just sparsely populated (7 rows live) -
   * most job cards have no row yet, which is why Estimation01Sql's ISNULL(...,0) shows them as
   * not approved. ID has no identity backing (same MAX+1 pattern as other legacy tables here).
   */
  async setApproval(id: number, approved: boolean, remarks: string | undefined, approvedUser: string): Promise<void> {
    const rows = await queryView<{ JobCardNo: string | null; CustomerId: string | null }>(
      'SELECT JObCardNo AS JobCardNo, CustomerId FROM Estimation01 WHERE ID = @id',
      { id }
    );
    const jobCardNo = rows[0]?.JobCardNo;
    if (!jobCardNo) return;

    const existing = await queryView<{ ID: number }>('SELECT ID FROM Partsavailable01 WHERE Ordr = @ordr', {
      ordr: jobCardNo
    });

    if (existing.length) {
      await executeWrite(
        `UPDATE Partsavailable01
         SET Approved = @approved, ApprovedDt = GETDATE(), ApprovedUser = @approvedUser, ServiceComment = @remarks
         WHERE Ordr = @ordr`,
        { ordr: jobCardNo, approved: approved ? 1 : 0, approvedUser, remarks: remarks ?? null }
      );
      return;
    }

    await withNextNumericId('Partsavailable01', 'ID', async (nextId, req) => {
      await req
        .input('ID', nextId)
        .input('Ordr', jobCardNo)
        .input('CustId', rows[0]?.CustomerId ?? null)
        .input('Approved', approved ? 1 : 0)
        .input('ApprovedUser', approvedUser)
        .input('ServiceComment', remarks ?? null).query(`
          INSERT INTO Partsavailable01 (ID, Ccode, RefDt, CustId, Ordr, Approved, ApprovedDt, ApprovedUser, ServiceComment)
          VALUES (@ID, '01', GETDATE(), @CustId, @Ordr, @Approved, GETDATE(), @ApprovedUser, @ServiceComment)
        `);
    });
  }
}

export const estimationRepository = new EstimationRepository();
