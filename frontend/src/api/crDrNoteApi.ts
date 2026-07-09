import { apiRequest } from './client';

export interface CrDrNoteListItem {
  id: number;
  refNo: string | null;
  refDt: string | null;
  type: string | null;
  vsrl: string | null;
  narration: string | null;
  ac: string | null;
  acName: string | null;
  vac: string | null;
  vacName: string | null;
  amount: number | null;
}

export interface CrDrNoteInput {
  refDt: string;
  type: 'Credit' | 'Debit';
  ac: string;
  vac: string;
  amount: number;
  narration: string | null;
}

interface Paged<T> {
  items: T[];
  total: number;
}

function qs(params: Record<string, unknown>) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  const s = new URLSearchParams(entries as [string, string][]).toString();
  return s ? `?${s}` : '';
}

export const crDrNoteApi = {
  list: (filters: { page?: number; limit?: number }) => apiRequest<Paged<CrDrNoteListItem>>(`/cr-dr-notes${qs(filters)}`),
  get: (id: number) => apiRequest<CrDrNoteListItem>(`/cr-dr-notes/${id}`),
  create: (input: CrDrNoteInput) =>
    apiRequest<{ id: number; refNo: string }>('/cr-dr-notes', { method: 'POST', body: input })
};
