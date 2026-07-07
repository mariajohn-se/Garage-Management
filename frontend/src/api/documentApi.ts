import { apiRequest } from './client';

export interface Attachment {
  id: number;
  type: string | null;
  codes: string | null;
  remarks: string | null;
  path: string | null;
  isLegacyPath: boolean;
}

export interface AdditionalRemark {
  id: number;
  ordr: string;
  entryDate: string | null;
  remarks: string;
  customerName?: string | null;
  phone1?: string | null;
  vehNo?: string | null;
  engineNo?: string | null;
  staffName?: string | null;
}

function qs(params: Record<string, unknown>) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  const s = new URLSearchParams(entries as [string, string][]).toString();
  return s ? `?${s}` : '';
}

function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

export const attachmentApi = {
  list: (filters: { type?: string; codes?: string; page?: number; limit?: number }) =>
    apiRequest<{ items: Attachment[]; total: number }>(`/attachments${qs(filters)}`),

  remove: (id: number) => apiRequest<void>(`/attachments/${id}`, { method: 'DELETE' }),

  update: (id: number, changes: { type?: string; codes?: string; remarks?: string }) =>
    apiRequest<{ message: string }>(`/attachments/${id}`, { method: 'PUT', body: changes }),

  async upload(file: File, meta: { type?: string; codes?: string; remarks?: string }) {
    const form = new FormData();
    form.append('file', file);
    if (meta.type) form.append('type', meta.type);
    if (meta.codes) form.append('codes', meta.codes);
    if (meta.remarks) form.append('remarks', meta.remarks);

    const token = getAccessToken();
    const response = await fetch('/api/v1/attachments', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.error?.message ?? 'Upload failed.');
    }
    return data as { id: number; path: string };
  }
};

export const remarksApi = {
  report: (filters: { ordr?: string; search?: string; page?: number; limit?: number }) =>
    apiRequest<{ items: AdditionalRemark[]; total: number }>(`/remarks/report${qs(filters)}`),

  listByOrder: (ordr: string) => apiRequest<AdditionalRemark[]>(`/remarks${qs({ ordr })}`),

  create: (input: { ordr: string; remarks: string }) =>
    apiRequest<{ id: number }>('/remarks', { method: 'POST', body: input }),

  update: (id: number, remarks: string) =>
    apiRequest<{ message: string }>(`/remarks/${id}`, { method: 'PUT', body: { remarks } }),

  remove: (id: number) => apiRequest<void>(`/remarks/${id}`, { method: 'DELETE' })
};
