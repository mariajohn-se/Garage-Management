export type Role = 'Standard' | 'Supervisor' | 'Administrator';

/**
 * Reflects the VERIFIED live USERS table schema (confirmed via
 * scripts/inspect-schema.js against the real DB in DB_CONNECTION_SPEC_v12.md).
 * There is no Email or FullName column, and no named-role column - see
 * UserRepository.ts for how `roles` is derived and why it is provisional.
 */
export interface User {
  id: number; // USERS.Sl
  username: string; // USERS.User
  passwordHash: string; // USERS.Pw
  isActive: boolean; // USERS.Disable === 0
  staffId: string | null;
  roles: Role[];
  permissions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    acct: boolean;
  };
}

export interface SessionUser {
  id: number;
  username: string;
  roles: Role[];
  status: 'active' | 'inactive';
}

export interface UserLogEntry {
  slNo: number;
  userId: number | null;
  userName: string | null;
  actionName: string | null;
  actionDate: string | null;
  remarks: string | null;
  ipAddress: string | null;
  machineName: string | null;
}

/**
 * There is no CreatedDate or LastLogin column on USERS - FRONTEND_SPEC_v12.md's User List
 * "Date Created"/"Last Login" columns cannot be populated from real data and are surfaced as
 * null here rather than fabricated.
 */
export interface UserListItem {
  id: number;
  username: string;
  roles: Role[];
  isActive: boolean;
  isLocked: boolean;
  staffId: string | null;
  createdBy: string | null;
}

export interface CreateUserInput {
  username: string;
  password: string;
  isAdministrator: boolean;
}

export interface UpdateUserInput {
  isAdministrator?: boolean;
  isActive?: boolean;
}

/** menulist.MnuID -> human-readable name, joined against UserRights for a given user. */
export interface MenuPermission {
  menuId: string;
  menuName: string;
  granted: boolean;
}

/** Reflects the VERIFIED live EmployeeSql view (see UserRepository.ts header for caveats). */
export interface Employee {
  empId: number;
  name: string;
  nickName: string | null;
  designation: string | null;
  department: string | null;
  section: string | null;
  tel1: string | null;
  telMob: string | null;
  isActive: boolean;
  dateOfJoining: string | null;
}

/**
 * Reflects the VERIFIED live UserTable schema: (UID, pcName) only, 0 rows in production.
 * This is NOT the "legacy user account pending migration" entity FRONTEND_SPEC_v12.md
 * assumes (email/status/date/migrated-to) - see UserRepository.ts header for detail.
 */
export interface LegacyUserRecord {
  uid: string;
  pcName: string | null;
}
