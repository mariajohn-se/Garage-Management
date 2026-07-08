import { apiRequest, apiRequestText } from './client';

export interface Customer {
  custId: string;
  name: string;
  address: string;
  emirate: string | null;
  contactPerson: string | null;
  phone1: string | null;
  phone2: string | null;
  email: string | null;
  area: string | null;
  isActive: boolean;
  remarks: string | null;
}

export interface Supplier {
  suppId: string;
  name: string;
  address: string;
  emirate: string | null;
  contactPerson: string | null;
  phone1: string | null;
  phone2: string | null;
  email: string | null;
  area: string | null;
  activeFlag: number | null;
  remarks: string | null;
}

export interface Vehicle {
  vehId: number;
  vehNo: string | null;
  make: string | null;
  colour: string | null;
  manYear: string | null;
  engineNo: string | null;
  regType: string | null;
  remarks: string | null;
}

export interface Paged<T> {
  items: T[];
  total: number;
}

function qs(params: Record<string, unknown>) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  const s = new URLSearchParams(entries as [string, string][]).toString();
  return s ? `?${s}` : '';
}

export const customerApi = {
  list: (filters: { name?: string; phone?: string; status?: string; page?: number; limit?: number }) =>
    apiRequest<Paged<Customer>>(`/customers${qs(filters)}`),
  get: (custId: string) => apiRequest<Customer>(`/customers/${custId}`),
  create: (input: Omit<Customer, 'custId' | 'isActive'>) =>
    apiRequest<{ custId: string }>('/customers', { method: 'POST', body: input }),
  update: (custId: string, changes: Partial<Omit<Customer, 'custId'>>) =>
    apiRequest<{ message: string }>(`/customers/${custId}`, { method: 'PUT', body: changes }),
  remove: (custId: string) => apiRequest<void>(`/customers/${custId}`, { method: 'DELETE' }),
  help: (q: string) => apiRequest<Customer[]>(`/customers/help${qs({ q })}`),
  exportCsv: (filters: { name?: string; phone?: string; status?: string }) =>
    apiRequestText(`/customers/export${qs(filters)}`),
  importCsv: (csv: string) =>
    apiRequest<{ created: number; skipped: Array<{ name: string; reason: string }> }>('/customers/import', {
      method: 'POST',
      body: { csv }
    }),
  agewise: (asOfDate: string) =>
    apiRequest<Array<{ bucket: string; amount: number }>>(`/customers/agewise${qs({ asOfDate })}`)
};

export const supplierApi = {
  list: (filters: { name?: string; phone?: string; page?: number; limit?: number }) =>
    apiRequest<Paged<Supplier>>(`/suppliers${qs(filters)}`),
  get: (suppId: string) => apiRequest<Supplier>(`/suppliers/${suppId}`),
  create: (input: Omit<Supplier, 'suppId' | 'activeFlag'>) =>
    apiRequest<{ suppId: string }>('/suppliers', { method: 'POST', body: input }),
  update: (suppId: string, changes: Partial<Omit<Supplier, 'suppId'>>) =>
    apiRequest<{ message: string }>(`/suppliers/${suppId}`, { method: 'PUT', body: changes }),
  remove: (suppId: string) => apiRequest<void>(`/suppliers/${suppId}`, { method: 'DELETE' }),
  help: (q: string) => apiRequest<Supplier[]>(`/suppliers/help${qs({ q })}`),
  exportCsv: (filters: { name?: string; phone?: string }) => apiRequestText(`/suppliers/export${qs(filters)}`),
  importCsv: (csv: string) =>
    apiRequest<{ created: number; skipped: Array<{ name: string; reason: string }> }>('/suppliers/import', {
      method: 'POST',
      body: { csv }
    })
};

export const vehicleApi = {
  list: (filters: { search?: string; page?: number; limit?: number }) =>
    apiRequest<Paged<Vehicle>>(`/vehicles${qs(filters)}`),
  get: (id: number) => apiRequest<Vehicle>(`/vehicles/${id}`),
  create: (input: Omit<Vehicle, 'vehId'>) =>
    apiRequest<{ vehId: number }>('/vehicles', { method: 'POST', body: input }),
  update: (id: number, changes: Partial<Omit<Vehicle, 'vehId'>>) =>
    apiRequest<{ message: string }>(`/vehicles/${id}`, { method: 'PUT', body: changes }),
  remove: (id: number) => apiRequest<void>(`/vehicles/${id}`, { method: 'DELETE' })
};
