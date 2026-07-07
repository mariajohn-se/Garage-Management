import { apiRequest } from './client';

export type Role = 'Standard' | 'Supervisor' | 'Administrator';

export interface SessionUser {
  id: number;
  username: string;
  roles: Role[];
  status: 'active' | 'inactive';
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: SessionUser;
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

export const authApi = {
  login: (username: string, password: string) =>
    apiRequest<LoginResponse>('/auth/login', { method: 'POST', body: { username, password }, auth: false }),

  logout: (refreshToken: string) => apiRequest<void>('/auth/logout', { method: 'POST', body: { refreshToken } }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest<{ message: string }>('/auth/change-password', {
      method: 'PUT',
      body: { currentPassword, newPassword }
    }),

  passwordResetRequest: (email: string) =>
    apiRequest<{ message: string }>('/auth/password-reset-request', {
      method: 'POST',
      body: { email },
      auth: false
    }),

  session: () => apiRequest<SessionUser>('/auth/session'),

  unlockAccount: (userId: number) =>
    apiRequest<{ message: string }>('/auth/unlock-account', { method: 'POST', body: { userId } }),

  userLog: (params: { userId?: string; dateFrom?: string; dateTo?: string; eventType?: string }) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => Boolean(v)) as [string, string][]
    ).toString();
    return apiRequest<UserLogEntry[]>(`/auth/user-log${qs ? `?${qs}` : ''}`);
  },

  health: () => apiRequest<{ status: string; db: string; time: string }>('/health', { auth: false }),

  odbcTestConnection: (connectionString: string) =>
    apiRequest<{ success: boolean; message: string }>('/auth/odbc-test-connection', {
      method: 'POST',
      body: { connectionString },
      auth: false
    }),

  odbcLogin: (username: string, password: string) =>
    apiRequest<LoginResponse>('/auth/odbc-login', {
      method: 'POST',
      body: { username, password },
      auth: false
    })
};
