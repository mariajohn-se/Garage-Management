import { queryView, callProcedure } from '../db/callProcedure';
import { User, Role, UserLogEntry, UserListItem, MenuPermission } from '../models/User';

/**
 * VERIFIED against the live DB (scripts/inspect-schema.js, run 2026-07-03) - not a guess.
 *
 * USERS columns that exist: Sl, User, Pw, Option, New, Delete, Edit, View, Acct, AcctNew,
 * AcctEdit, AcctDelete, AcctPrint, Createdby, ModuleId, UserVerification, UserCanChange,
 * DocuView, AttachmentView, Attendance, DoEdit, Disable, FaxAdmin, NewFax, StaffID,
 * updateWorkDetails, ShowAllTCrads, DiscountRestricted, ShowOthersWork, CanCreateInvoice.
 *
 * IMPORTANT GAPS vs. the generated spec (PROJECT_OVERVIEW/API_SPEC assumed a richer model):
 * - No Email or FullName column anywhere on USERS, and EmployeeDet (linked loosely via
 *   StaffID) has phone/address fields but no email either. Password-reset-by-email and
 *   "notify user on password change" (BR-09) cannot actually deliver anything for real
 *   accounts under the current schema - requestPasswordReset() below still implements the
 *   correct "never reveal existence" contract, but will silently no-op for every real user
 *   until an email source is identified or added by the business.
 * - There is no named-role column. UserRights(User, mnuId) is a per-menu ACL (one row per
 *   accessible menu item, e.g. mnuId='mnuMaster'), not a role assignment table. USERS.Option
 *   only takes values 0/1 in production data, with no legend documented anywhere in the spec
 *   files. The Standard/Supervisor/Administrator roles this app's RBAC is designed around are
 *   therefore APPROXIMATED as Option=1 -> Administrator, Option=0 -> Standard. This is a
 *   provisional heuristic, not a confirmed business rule - Phase 2 (User & Role Management)
 *   should replace it once someone who knows the legacy app confirms what Option actually
 *   means and how mnuId-based menu access should map to feature-level RBAC.
 * - UserLog's IP column is spelled `IpAdresses` (not IPAddress) in the real schema.
 *
 * Writes (password/lock/log) still go through callProcedure() per STANDARDS.md, but the
 * exact stored procedure names are placeholders (see note above each call) since
 * DB_CONNECTION_SPEC_v12.md says additional undocumented procedures exist for this ("e.g.
 * for user logins, admin") without naming them.
 */

interface UserRow {
  Sl: number;
  User: string;
  Pw: string;
  Option: number | null;
  Disable: number | null;
  StaffID: string | null;
  View: number | null;
  New: number | null;
  Edit: number | null;
  Delete: number | null;
  Acct: number | null;
}

function deriveRoles(option: number | null): Role[] {
  return option === 1 ? ['Administrator'] : ['Standard'];
}

export class UserRepository {
  async findByUsername(identifier: string): Promise<User | null> {
    const rows = await queryView<UserRow>(
      `SELECT Sl, [User], Pw, [Option], Disable, StaffID, [View], [New], [Edit], [Delete], Acct
       FROM USERS
       WHERE [User] = @identifier`,
      { identifier }
    );
    if (!rows.length) return null;
    return this.toUser(rows[0]);
  }

  async findById(id: number): Promise<User | null> {
    const rows = await queryView<UserRow>(
      `SELECT Sl, [User], Pw, [Option], Disable, StaffID, [View], [New], [Edit], [Delete], Acct
       FROM USERS WHERE Sl = @id`,
      { id }
    );
    if (!rows.length) return null;
    return this.toUser(rows[0]);
  }

  private toUser(row: UserRow): User {
    return {
      id: row.Sl,
      username: row.User,
      passwordHash: row.Pw,
      isActive: (row.Disable ?? 0) === 0,
      staffId: row.StaffID,
      roles: deriveRoles(row.Option),
      permissions: {
        view: !!row.View,
        create: !!row.New,
        edit: !!row.Edit,
        delete: !!row.Delete,
        acct: !!row.Acct
      }
    };
  }

  /**
   * FRONTEND_SPEC_v12.md's User List wants "Date Created" and "Last Login" columns that don't
   * exist on USERS - they come back null rather than fabricated. Role/status filters are
   * applied in JS after the DB round-trip since Option/Disable are the only DB-side fields
   * that back them (no separate name/role view exists to filter on server-side beyond this).
   */
  async listUsers(filters: { name?: string; role?: Role; status?: 'active' | 'inactive' }): Promise<UserListItem[]> {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};
    if (filters.name) {
      conditions.push('[User] LIKE @name');
      params.name = `%${filters.name}%`;
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await queryView<UserRow>(
      `SELECT Sl, [User], Pw, [Option], Disable, StaffID, [View], [New], [Edit], [Delete], Acct, Createdby
       FROM USERS ${where}
       ORDER BY Sl`,
      params
    );
    return rows
      .map((row) => {
        const user = this.toUser(row);
        return {
          id: user.id,
          username: user.username,
          roles: user.roles,
          isActive: user.isActive,
          isLocked: false, // enriched by UserService from the in-memory lockout store
          staffId: user.staffId,
          createdBy: (row as any).Createdby ?? null
        } satisfies UserListItem;
      })
      .filter((u) => !filters.role || u.roles.includes(filters.role))
      .filter((u) => !filters.status || (filters.status === 'active') === u.isActive);
  }

  // Placeholder procedure name - see PHASE2 doc's own suggested name; not confirmed against
  // the real SP catalog.
  async createUser(input: { username: string; passwordHash: string; isAdministrator: boolean }): Promise<number> {
    const rows = await callProcedure<{ Sl: number }>('spCreateUser', {
      UserName: input.username,
      Pw: input.passwordHash,
      Option: input.isAdministrator ? 1 : 0
    });
    return rows[0]?.Sl;
  }

  // Placeholder procedure name - see file header note.
  async updateUser(userId: number, changes: { isAdministrator?: boolean; isActive?: boolean }): Promise<void> {
    if (changes.isAdministrator !== undefined) {
      await callProcedure('spUpdateUserRole', { UserId: userId, Option: changes.isAdministrator ? 1 : 0 });
    }
    if (changes.isActive !== undefined) {
      await callProcedure('spUserSetDisableState', { UserId: userId, Disable: changes.isActive ? 0 : 1 });
    }
  }

  // Placeholder procedure name - see file header note. Deletes a real USERS row - destructive.
  async deleteUser(userId: number): Promise<void> {
    await callProcedure('spDeleteUser', { UserId: userId });
  }

  /** Joins UserRights against menulist for human-readable feature names (never raw IDs). */
  async getMenuPermissionsForUser(username: string): Promise<MenuPermission[]> {
    const rows = await queryView<{ MnuID: string; MnuName: string; Granted: number }>(
      `SELECT m.MnuID, m.MnuName, CASE WHEN r.mnuId IS NULL THEN 0 ELSE 1 END AS Granted
       FROM menulist m
       LEFT JOIN UserRights r ON r.mnuId = m.MnuID AND r.[User] = @username
       WHERE m.Display = 1
       ORDER BY m.Levl, m.Slevl`,
      { username }
    );
    return rows.map((r) => ({ menuId: r.MnuID, menuName: r.MnuName, granted: !!r.Granted }));
  }

  // Placeholder procedure names - no SP for UserRights writes is documented anywhere.
  async grantMenuPermission(username: string, menuId: string): Promise<void> {
    await callProcedure('spCreateUserRole', { UserName: username, MnuId: menuId });
  }

  async revokeMenuPermission(username: string, menuId: string): Promise<void> {
    await callProcedure('spDeleteUserRole', { UserName: username, MnuId: menuId });
  }

  // Placeholder procedure name - see file header note.
  async updatePassword(userId: number, passwordHash: string): Promise<void> {
    await callProcedure('spUserSetPassword', { UserId: userId, NewPassword: passwordHash });
  }

  // Placeholder procedure name - see file header note.
  async writeUserLog(entry: {
    userId: number;
    userName: string;
    actionName: string;
    remarks?: string;
    ipAddress?: string;
    machineName?: string;
  }): Promise<void> {
    await callProcedure('spUserLogInsert', {
      UserId: entry.userId,
      UserName: entry.userName,
      ActionName: entry.actionName,
      Remarks: entry.remarks ?? null,
      IpAdresses: entry.ipAddress ?? null,
      MachineName: entry.machineName ?? null
    });
  }

  async getUserLog(filters: {
    userId?: number;
    dateFrom?: string;
    dateTo?: string;
    eventType?: string;
  }): Promise<UserLogEntry[]> {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};
    if (filters.userId) {
      conditions.push('UserId = @userId');
      params.userId = filters.userId;
    }
    if (filters.dateFrom) {
      conditions.push('ActionDate >= @dateFrom');
      params.dateFrom = filters.dateFrom;
    }
    if (filters.dateTo) {
      conditions.push('ActionDate <= @dateTo');
      params.dateTo = filters.dateTo;
    }
    if (filters.eventType) {
      conditions.push('ActionName = @eventType');
      params.eventType = filters.eventType;
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await queryView<any>(
      `SELECT TOP 500 SLNo, UserId, UserName, ActionName, ActionDate, Remarks, IpAdresses, MachineName
       FROM UserLog ${where}
       ORDER BY ActionDate DESC`,
      params
    );
    return rows.map((r) => ({
      slNo: r.SLNo,
      userId: r.UserId,
      userName: r.UserName,
      actionName: r.ActionName,
      actionDate: r.ActionDate,
      remarks: r.Remarks,
      ipAddress: r.IpAdresses,
      machineName: r.MachineName
    }));
  }
}

export const userRepository = new UserRepository();
