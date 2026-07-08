import { apiRequest, apiRequestText } from './client';
import { Role } from './authApi';

export interface UserListItem {
  id: number;
  username: string;
  roles: Role[];
  isActive: boolean;
  isLocked: boolean;
  staffId: string | null;
  createdBy: string | null;
}

export interface MenuPermission {
  menuId: string;
  menuName: string;
  granted: boolean;
}

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

export interface LegacyUserRecord {
  uid: string;
  pcName: string | null;
}

export const userApi = {
  list: (filters: { name?: string; role?: string; status?: string }) => {
    const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => Boolean(v)) as [string, string][]);
    return apiRequest<UserListItem[]>(`/users${qs.toString() ? `?${qs}` : ''}`);
  },

  create: (input: { username: string; password: string; roles: Role[] }) =>
    apiRequest<{ id: number }>('/users', { method: 'POST', body: input }),

  update: (id: number, changes: { status?: string; roles?: Role[] }) =>
    apiRequest<{ message: string }>(`/users/${id}`, { method: 'PUT', body: changes }),

  remove: (id: number) => apiRequest<void>(`/users/${id}`, { method: 'DELETE' }),

  setStatus: (id: number, status: 'active' | 'inactive') =>
    apiRequest<{ message: string }>(`/users/${id}/activate`, { method: 'PUT', body: { status } }),

  bulkSetStatus: (userIds: number[], status: 'active' | 'inactive') =>
    apiRequest<{ message: string }>('/users/bulk-activate', { method: 'PUT', body: { userIds, status } }),

  setRoles: (id: number, roles: Role[]) =>
    apiRequest<{ message: string }>(`/users/${id}/roles`, { method: 'PUT', body: { roles } }),

  adminResetPassword: (id: number, newPassword: string) =>
    apiRequest<{ message: string }>(`/users/${id}/reset-password`, { method: 'PUT', body: { newPassword } }),

  getPermissions: (id: number) => apiRequest<MenuPermission[]>(`/users/${id}/permissions`),

  setPermission: (id: number, menuId: string, granted: boolean) =>
    apiRequest<{ message: string }>(`/users/${id}/permissions`, { method: 'PUT', body: { menuId, granted } }),

  importCsv: (csv: string) =>
    apiRequest<{ created: number; skipped: Array<{ username: string; reason: string }> }>('/users/import', {
      method: 'POST',
      body: { csv }
    }),

  // GET with Bearer auth can't be a plain <a href> download - fetch as text and save as a blob.
  exportCsv: (filters: { name?: string; role?: string; status?: string }) => {
    const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => Boolean(v)) as [string, string][]);
    return apiRequestText(`/users/export${qs.toString() ? `?${qs}` : ''}`);
  },

  employees: (filters: { name?: string; department?: string; section?: string }) => {
    const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => Boolean(v)) as [string, string][]);
    return apiRequest<Employee[]>(`/employees${qs.toString() ? `?${qs}` : ''}`);
  },

  employeeHelp: (query: string) =>
    apiRequest<Array<{ empId: number; name: string }>>(`/employees/help?q=${encodeURIComponent(query)}`),

  legacyUsers: () => apiRequest<LegacyUserRecord[]>('/legacy-users'),

  actionLog: (filters: { userId?: string; dateFrom?: string; dateTo?: string; eventType?: string }) => {
    const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => Boolean(v)) as [string, string][]);
    return apiRequest<
      Array<{
        slNo: number;
        userId: number | null;
        userName: string | null;
        actionName: string | null;
        actionDate: string | null;
        remarks: string | null;
      }>
    >(`/action-logs${qs.toString() ? `?${qs}` : ''}`);
  }
};
