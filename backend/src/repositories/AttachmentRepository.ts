import { queryView, queryViewPaginated, executeWrite } from '../db/callProcedure';
import { Attachment } from '../models/Document';

/**
 * VERIFIED against the live AttachmentMaster table (5 columns: ID, Type, Codes, Remarks,
 * Path; 3 rows in production). There is no read view for it (STANDARDS.md's "use a view if
 * one exists" doesn't apply - none exists), so this reads the base table directly, which
 * STANDARDS.md explicitly allows when no SP/view exists.
 *
 * Every real Path value observed is an absolute Windows path from the original desktop app
 * circa 2006 (e.g. "C:\Documents and Settings\Administrator\..."), not a path this web
 * server can read - isLegacyPath flags these so the frontend can disable "download" rather
 * than attempt (and fail) to serve a file that isn't there. New uploads through this app are
 * saved under backend/uploads/ and get a real, servable relative path.
 */

interface AttachmentRow {
  ID: number;
  Type: string | null;
  Codes: string | null;
  Remarks: string | null;
  Path: string | null;
}

function isLegacyPath(path: string | null): boolean {
  return !!path && !path.startsWith('/uploads/');
}

function toAttachment(row: AttachmentRow): Attachment {
  return {
    id: row.ID,
    type: row.Type,
    codes: row.Codes,
    remarks: row.Remarks,
    path: row.Path,
    isLegacyPath: isLegacyPath(row.Path)
  };
}

const SELECT_COLUMNS = `ID, Type, Codes, Remarks, Path`;

export class AttachmentRepository {
  async list(filters: { type?: string; codes?: string; page: number; limit: number }): Promise<{
    items: Attachment[];
    total: number;
  }> {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};
    if (filters.type) {
      conditions.push('Type = @type');
      params.type = filters.type;
    }
    if (filters.codes) {
      conditions.push('Codes LIKE @codes');
      params.codes = `%${filters.codes}%`;
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const totalRows = await queryView<{ cnt: number }>(`SELECT COUNT(*) AS cnt FROM AttachmentMaster ${where}`, params);
    const total = totalRows[0]?.cnt ?? 0;

    const rows = await queryViewPaginated<AttachmentRow>(
      SELECT_COLUMNS,
      'AttachmentMaster',
      where,
      'ID DESC',
      params,
      filters.page,
      filters.limit
    );
    return { items: rows.map(toAttachment), total };
  }

  async findById(id: number): Promise<Attachment | null> {
    const rows = await queryView<AttachmentRow>(`SELECT ${SELECT_COLUMNS} FROM AttachmentMaster WHERE ID = @id`, {
      id
    });
    return rows.length ? toAttachment(rows[0]) : null;
  }

  /** AttachmentMaster.ID is a real identity column - safe to let SQL Server assign it. */
  async create(input: {
    type: string | null;
    codes: string | null;
    remarks: string | null;
    path: string;
  }): Promise<number> {
    const rows = await executeWrite<{ ID: number }>(
      `INSERT INTO AttachmentMaster (Type, Codes, Remarks, Path)
       OUTPUT INSERTED.ID
       VALUES (@type, @codes, @remarks, @path)`,
      { type: input.type, codes: input.codes, remarks: input.remarks, path: input.path }
    );
    return rows[0]?.ID;
  }

  async update(
    id: number,
    changes: { type?: string | null; codes?: string | null; remarks?: string | null }
  ): Promise<void> {
    const sets: string[] = [];
    const params: Record<string, unknown> = { id };
    if (changes.type !== undefined) { sets.push('Type = @type'); params.type = changes.type; }
    if (changes.codes !== undefined) { sets.push('Codes = @codes'); params.codes = changes.codes; }
    if (changes.remarks !== undefined) { sets.push('Remarks = @remarks'); params.remarks = changes.remarks; }
    if (!sets.length) return;
    await executeWrite(`UPDATE AttachmentMaster SET ${sets.join(', ')} WHERE ID = @id`, params);
  }

  async delete(id: number): Promise<void> {
    await executeWrite('DELETE FROM AttachmentMaster WHERE ID = @id', { id });
  }
}

export const attachmentRepository = new AttachmentRepository();
