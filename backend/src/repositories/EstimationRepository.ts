import mssql from 'mssql';
import { queryView, queryViewPaginated, executeWrite, withNextNumericId } from '../db/callProcedure';
import { EstimationListItem, EstimationLine, AdvisorOption } from '../models/Job';

export interface EstimationLineInput {
  description: string;
  qty: number;
  unitPrice: number;
  labourAmount: number;
}

export interface EstimationInput {
  customerId: string;
  vehicleId: number | null;
  staffId: string | null;
  billDate: string;
  jobCardNo: string | null;
  remarks: string | null;
  addition: number;
  less: number;
  lines: EstimationLineInput[];
}

function computeTotals(lines: EstimationLineInput[], addition: number, less: number) {
  const total = lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
  const totLabour = lines.reduce((sum, l) => sum + l.labourAmount, 0);
  const nett = total + totLabour + addition - less;
  return { total, totLabour, nett };
}

/**
 * VERIFIED against the live Estimation01Sql view (32 columns, 5940 real rows). `ID` is the
 * view's own row identifier; `JObCardNo` (unusual casing, preserved from the real column
 * name) is the human-facing job card reference used elsewhere in the app.
 */

interface EstimationRow {
  ID: number;
  EstimationNo: string | null;
  JObCardNo: string | null;
  CustomerId: string | null;
  custname: string | null;
  VehicleId: number | null;
  VehNo: string | null;
  EngineNo: string | null;
  Make: string | null;
  Colour: string | null;
  ManYear: string | null;
  StaffId: string | null;
  StaffName: string | null;
  BillDt: string | null;
  Total: number | null;
  totlabour: number | null;
  Addition: number | null;
  Less: number | null;
  nett: number | null;
  Approved: number | null;
  Remarks: string | null;
  PartsEstRef: string | null;
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
    customerId: row.CustomerId,
    customerName: row.custname,
    vehicleId: row.VehicleId,
    vehNo: row.VehNo,
    engineNo: row.EngineNo,
    make: row.Make,
    colour: row.Colour,
    manYear: row.ManYear,
    staffId: row.StaffId,
    staffName: row.StaffName,
    billDate: row.BillDt,
    total: row.Total,
    labourTotal: row.totlabour,
    addition: row.Addition,
    less: row.Less,
    net: row.nett,
    approved: !!row.Approved,
    rejected: decided && !row.Approved,
    rejectionComment: decided && !row.Approved ? row.DecisionComment : null,
    remarks: row.Remarks,
    partsEstRef: row.PartsEstRef && row.PartsEstRef !== '0' ? row.PartsEstRef : null
  };
}

const SELECT_COLUMNS = `ID, EstimationNo, JObCardNo, CustomerId, custname, VehicleId, VehNo, EngineNo, Make, Colour, ManYear,
  StaffId, StaffName, BillDt, Total, totlabour, Addition, Less, nett, Approved, Remarks, PartsEstRef,
  (SELECT TOP 1 ApprovedDt FROM Partsavailable01 WHERE Ordr = JObCardNo ORDER BY ID DESC) AS DecisionDt,
  (SELECT TOP 1 ServiceComment FROM Partsavailable01 WHERE Ordr = JObCardNo ORDER BY ID DESC) AS DecisionComment`;

export class EstimationRepository {
  /** Backs the advisor picker on the Estimation create/edit form - StaffSql (Ocode/Description) is the real source of Estimation01.StaffId/StaffName, a separate ID space from EmployeeDet/AssignedJobs' empId. */
  async searchStaff(query: string): Promise<Array<{ ocode: string; name: string }>> {
    const rows = await queryView<{ Ocode: string; Description: string }>(
      `SELECT TOP 20 Ocode, Description FROM StaffSql WHERE Description LIKE @q ORDER BY Description`,
      { q: `%${query}%` }
    );
    return rows.map((r) => ({ ocode: r.Ocode, name: r.Description }));
  }

  /** Distinct advisors who actually have estimations - backs the Advisor filter dropdown (a
   *  full StaffSql list would include codes never used on any estimation). */
  async listAdvisors(): Promise<AdvisorOption[]> {
    const rows = await queryView<{ StaffId: string; StaffName: string | null }>(
      `SELECT DISTINCT StaffId, StaffName FROM Estimation01Sql WHERE StaffId IS NOT NULL ORDER BY StaffName`
    );
    return rows.map((r) => ({ ocode: r.StaffId, name: r.StaffName ?? r.StaffId }));
  }

  async list(filters: {
    customerName?: string;
    vehNo?: string;
    approved?: 'yes' | 'no';
    staffId?: string;
    fromDate?: string;
    toDate?: string;
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
    if (filters.staffId) {
      conditions.push('StaffId = @staffId');
      params.staffId = filters.staffId;
    }
    if (filters.fromDate) {
      conditions.push('BillDt >= @fromDate');
      params.fromDate = filters.fromDate;
    }
    if (filters.toDate) {
      conditions.push('BillDt < DATEADD(day, 1, @toDate)');
      params.toDate = filters.toDate;
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

  /**
   * VERIFIED (2026-07-08): EstimationNo is a plain MAX+1 integer sequence stored as nvarchar
   * (same pattern as Ordr on SalesOrdr01), independent of ID. JObCardNo is NOT its own sequence -
   * spot-checking real rows shows non-'0' values match real SalesOrdr01.Ordr numbers, so it's an
   * optional reference to an existing sales order/job card, defaulted to '0' (unlinked) when the
   * estimation is prepared before a job card exists - never generated here.
   * VERIFIED FINDING: Estimation02.Sl looked like an app-generated MAX+1 counter from sample
   * data (large numbers shared across rows), but `sys.columns.is_identity` confirms it's a real
   * SQL Server IDENTITY column - inserting it explicitly throws "Cannot insert explicit value
   * for identity column ... IDENTITY_INSERT is set to OFF". Left off the INSERT; the DB assigns it.
   */
  async create(input: EstimationInput): Promise<number> {
    return withNextNumericId('Estimation01', 'ID', async (nextId, req, transaction) => {
      const maxEstNoResult = await req.query(
        `SELECT ISNULL(MAX(CASE WHEN EstimationNo NOT LIKE '%[^0-9]%' THEN CAST(EstimationNo AS INT) END), 0) AS maxEstNo
         FROM Estimation01 WITH (UPDLOCK, HOLDLOCK)`
      );
      const nextEstNo = String((maxEstNoResult.recordset[0]?.maxEstNo ?? 0) + 1);
      const { total, totLabour, nett } = computeTotals(input.lines, input.addition, input.less);

      await req
        .input('ID', nextId)
        .input('Yr', new Date(input.billDate).getFullYear().toString().slice(-2))
        .input('EstimationNo', nextEstNo)
        .input('BillDt', input.billDate)
        .input('CustomerId', input.customerId)
        .input('VehicleId', input.vehicleId)
        .input('StaffId', input.staffId)
        .input('Addition', input.addition)
        .input('Less', input.less)
        .input('Remarks', input.remarks)
        .input('Total', total)
        .input('TotLabour', totLabour)
        .input('Nett', nett)
        .input('JObCardNo', input.jobCardNo ?? '0').query(`
          INSERT INTO Estimation01 (ID, Yr, ccode, EstimationNo, BillDt, CustomerId, VehicleId, StaffId, Addition, Less, Remarks, Total, totlabour, nett, JObCardNo)
          VALUES (@ID, @Yr, '01', @EstimationNo, @BillDt, @CustomerId, @VehicleId, @StaffId, @Addition, @Less, @Remarks, @Total, @TotLabour, @Nett, @JObCardNo)
        `);

      for (const line of input.lines) {
        await new mssql.Request(transaction)
          .input('ID', nextId)
          .input('Description', line.description)
          .input('Qty', line.qty)
          .input('UnitPrice', line.unitPrice)
          .input('LabourAmt', line.labourAmount).query(`
            INSERT INTO Estimation02 (ID, Description, Qty, UnitPrice, labouramt, Sort)
            VALUES (@ID, @Description, @Qty, @UnitPrice, @LabourAmt, 0)
          `);
      }

      return nextId;
    });
  }

  /**
   * Line edits always replace the full set (delete+reinsert), same pattern as
   * OrderRepository.update() - Estimation02 has no natural per-line identity to diff against.
   * Addition/Less must be supplied whenever lines are, since Total/totlabour/nett are recomputed
   * together; the frontend edit form always submits all of them as one unit, never partially.
   */
  async update(
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
    const sets: string[] = [];
    const params: Record<string, unknown> = { id };
    if (changes.vehicleId !== undefined) {
      sets.push('VehicleId = @vehicleId');
      params.vehicleId = changes.vehicleId;
    }
    if (changes.staffId !== undefined) {
      sets.push('StaffId = @staffId');
      params.staffId = changes.staffId;
    }
    if (changes.remarks !== undefined) {
      sets.push('Remarks = @remarks');
      params.remarks = changes.remarks;
    }
    if (changes.lines) {
      const addition = changes.addition ?? 0;
      const less = changes.less ?? 0;
      const { total, totLabour, nett } = computeTotals(changes.lines, addition, less);
      sets.push('Addition = @addition', 'Less = @less', 'Total = @total', 'totlabour = @totLabour', 'nett = @nett');
      params.addition = addition;
      params.less = less;
      params.total = total;
      params.totLabour = totLabour;
      params.nett = nett;
    }

    if (sets.length) {
      await executeWrite(`UPDATE Estimation01 SET ${sets.join(', ')} WHERE ID = @id`, params);
    }

    if (changes.lines) {
      await executeWrite('DELETE FROM Estimation02 WHERE ID = @id', { id });
      for (const line of changes.lines) {
        await executeWrite(
          `INSERT INTO Estimation02 (ID, Description, Qty, UnitPrice, labouramt, Sort)
           VALUES (@id, @description, @qty, @unitPrice, @labourAmount, 0)`,
          { id, description: line.description, qty: line.qty, unitPrice: line.unitPrice, labourAmount: line.labourAmount }
        );
      }
    }
  }
}

export const estimationRepository = new EstimationRepository();
