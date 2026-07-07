import { queryView, callProcedure } from '../db/callProcedure';
import { CompanyHeader, MenuItem } from '../models/Reporting';

/**
 * VERIFIED against the live database: Company (a real, 1-row base table with the company's
 * name/address/contact fields - the genuine backing for "Company Report Header"), and menulist
 * (a real, 131-row base table with MnuID/MnuName/Levl/Slevl/Display columns - the legacy
 * desktop app's own real main-menu structure, already used for per-user menu permissions in
 * Phase 2, and the genuine backing for "Menu"/"Main Menu" here). ReportList, DuplicateRemoval
 * Audit, ChangeLog/EditChangeLog, and Form1/z/xxx/Sandbox/Declare have no real backing table,
 * view, or stored procedure anywhere under any name tried.
 */

interface CompanyRow {
  CCode: string;
  CompanyName: string | null;
  Address1: string | null;
  Address2: string | null;
  Address3: string | null;
  Phone1: string | null;
  Phone2: string | null;
  Fax: string | null;
  email: string | null;
}

function toCompanyHeader(row: CompanyRow): CompanyHeader {
  return {
    ccode: row.CCode,
    companyName: row.CompanyName,
    address1: row.Address1,
    address2: row.Address2,
    address3: row.Address3,
    phone1: row.Phone1,
    phone2: row.Phone2,
    fax: row.Fax,
    email: row.email
  };
}

export class ReportingRepository {
  async getCompanyHeader(): Promise<CompanyHeader | null> {
    const rows = await queryView<CompanyRow>('SELECT TOP 1 * FROM Company');
    return rows.length ? toCompanyHeader(rows[0]) : null;
  }

  // Placeholder procedure name - no confirmed update SP for the Company table in the real catalog.
  async updateCompanyHeader(changes: Partial<Omit<CompanyHeader, 'ccode'>>): Promise<void> {
    await callProcedure('spUpdateCompanyHeader', changes);
  }

  async listMenu(): Promise<MenuItem[]> {
    const rows = await queryView<{
      MnuID: string;
      MnuName: string | null;
      Levl: number | null;
      Slevl: number | null;
      Display: boolean | null;
    }>('SELECT MnuID, MnuName, Levl, Slevl, Display FROM menulist ORDER BY Levl, Slevl');
    return rows.map((r) => ({
      mnuId: r.MnuID,
      mnuName: r.MnuName,
      level: r.Levl,
      subLevel: r.Slevl,
      display: !!r.Display
    }));
  }
}

export const reportingRepository = new ReportingRepository();
