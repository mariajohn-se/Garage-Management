import { queryView, queryViewPaginated, callProcedure } from '../db/callProcedure';
import { AdditionalRemark } from '../models/Document';

/**
 * VERIFIED against the live AdditionalRemarks table (110 real rows) and its resolved read
 * view AditionalRemarksSql (note the real view name is missing a "d" - "Aditional", not
 * "Additional" - a genuine legacy typo, not a mistake introduced here).
 */

interface RemarkRow {
  AdditionalRemarksId: number;
  Ordr: string;
  EntryDate: string | null;
  Remarks: string;
}

interface RemarkReportRow extends RemarkRow {
  CustName: string | null;
  Phone1: string | null;
  VehNo: string | null;
  EngineNo: string | null;
  StaffName: string | null;
}

function toRemark(row: RemarkRow): AdditionalRemark {
  return { id: row.AdditionalRemarksId, ordr: row.Ordr, entryDate: row.EntryDate, remarks: row.Remarks };
}

export class RemarksRepository {
  async listByOrder(ordr: string): Promise<AdditionalRemark[]> {
    const rows = await queryView<RemarkRow>(
      `SELECT AdditionalRemarksId, Ordr, EntryDate, Remarks FROM AdditionalRemarks WHERE Ordr = @ordr ORDER BY AdditionalRemarksId DESC`,
      { ordr }
    );
    return rows.map(toRemark);
  }

  async findById(id: number): Promise<AdditionalRemark | null> {
    const rows = await queryView<RemarkRow>(
      `SELECT AdditionalRemarksId, Ordr, EntryDate, Remarks FROM AdditionalRemarks WHERE AdditionalRemarksId = @id`,
      { id }
    );
    return rows.length ? toRemark(rows[0]) : null;
  }

  /** Report view - real, resolved customer/vehicle/staff context per remark. */
  async report(filters: {
    ordr?: string;
    search?: string;
    page: number;
    limit: number;
  }): Promise<{ items: AdditionalRemark[]; total: number }> {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};
    if (filters.ordr) {
      conditions.push('Ordr = @ordr');
      params.ordr = filters.ordr;
    }
    if (filters.search) {
      conditions.push('(Remarks LIKE @search OR CustName LIKE @search OR VehNo LIKE @search)');
      params.search = `%${filters.search}%`;
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const columns = `AdditionalRemarksId, Ordr, EntryDate, Remarks, CustName, Phone1, VehNo, EngineNo, StaffName`;

    const totalRows = await queryView<{ cnt: number }>(
      `SELECT COUNT(*) AS cnt FROM AditionalRemarksSql ${where}`,
      params
    );
    const total = totalRows[0]?.cnt ?? 0;

    const rows = await queryViewPaginated<RemarkReportRow>(
      columns,
      'AditionalRemarksSql',
      where,
      'AdditionalRemarksId DESC',
      params,
      filters.page,
      filters.limit
    );
    return {
      items: rows.map((r) => ({
        ...toRemark(r),
        customerName: r.CustName,
        phone1: r.Phone1,
        vehNo: r.VehNo,
        engineNo: r.EngineNo,
        staffName: r.StaffName
      })),
      total
    };
  }

  // Placeholder procedure names - not confirmed against the real SP catalog.
  async create(input: { ordr: string; remarks: string }): Promise<number> {
    const rows = await callProcedure<{ AdditionalRemarksId: number }>('sp_AddRemark', {
      Ordr: input.ordr,
      Remarks: input.remarks
    });
    return rows[0]?.AdditionalRemarksId;
  }

  async update(id: number, remarks: string): Promise<void> {
    await callProcedure('sp_EditRemark', { AdditionalRemarksId: id, Remarks: remarks });
  }

  async delete(id: number): Promise<void> {
    await callProcedure('sp_DeleteRemark', { AdditionalRemarksId: id });
  }
}

export const remarksRepository = new RemarksRepository();
