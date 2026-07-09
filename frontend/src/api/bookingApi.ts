import { apiRequest } from './client';

export interface BookingListItem {
  id: number;
  bookDt: string | null;
  appDate: string | null;
  custId: string | null;
  custName: string | null;
  vehNo: string | null;
  make: string | null;
  staffId: string | null;
  staffName: string | null;
  remarks: string | null;
  status: number;
  ordr: string | null;
}

export interface BookingInput {
  appDate: string;
  customerId: string;
  customerName: string;
  address: string | null;
  mobile: string | null;
  vehicleId: number;
  vehNo: string | null;
  engineNo: string | null;
  regType: string | null;
  make: string | null;
  colour: string | null;
  manYear: string | null;
  staffId: string;
  remarks: string | null;
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

export const bookingApi = {
  list: (filters: { page?: number; limit?: number }) => apiRequest<Paged<BookingListItem>>(`/bookings${qs(filters)}`),
  create: (input: BookingInput) => apiRequest<{ id: number }>('/bookings', { method: 'POST', body: input })
};
