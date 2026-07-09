import { apiRequest } from './client';

export interface EstimationListItem {
  id: number;
  estimationNo: string | null;
  jobCardNo: string | null;
  customerId: string | null;
  customerName: string | null;
  vehicleId: number | null;
  vehNo: string | null;
  engineNo: string | null;
  make: string | null;
  colour: string | null;
  manYear: string | null;
  staffId: string | null;
  staffName: string | null;
  billDate: string | null;
  total: number | null;
  labourTotal: number | null;
  addition: number | null;
  less: number | null;
  net: number | null;
  approved: boolean;
  rejected: boolean;
  rejectionComment: string | null;
  remarks: string | null;
  partsEstRef: string | null;
}

export interface AdvisorOption {
  ocode: string;
  name: string;
}

export interface EstimationLine {
  description: string | null;
  qty: number | null;
  unitPrice: number | null;
  labourAmount: number | null;
  amount: number | null;
}

export interface JobListItem {
  id: number;
  ordr: string;
  date: string | null;
  statusId: number | null;
  status: string | null;
  statusDescription: string | null;
  staffName: string | null;
  vehNo: string | null;
  customerName: string | null;
  closed: boolean;
  finished: boolean;
  remarks: string | null;
}

export interface WorkInProgressItem {
  id: number;
  ordr: string | null;
  empName: string | null;
  date: string | null;
  activityCode: string | null;
  loggedIn: string | null;
  loggedOut: string | null;
  workDescription: string | null;
  completed: boolean;
  cancelled: boolean;
  status: string | null;
  totalTime: string | null;
}

export interface AssignedJobItem {
  dtlId: number;
  ordr: string;
  empName: string | null;
  dateOfAssign: string | null;
  completed: boolean;
  cancelled: boolean;
  status: string | null;
}

export interface JobStatus {
  statusId: number;
  description: string;
  finishedStatus: boolean;
  partsNotAvailable: boolean;
  inProgress: boolean;
  foreColour: string | null;
  backColour: string | null;
  assigned: boolean;
  approved: boolean;
  sortOrder: number | null;
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

export interface EstimationLineInput {
  description: string;
  qty: number;
  unitPrice: number;
  labourAmount: number;
}

export interface EstimationInput {
  customerId: string;
  vehicleId: number | null;
  staffId: string | null;
  billDate: string;
  jobCardNo: string | null;
  remarks: string | null;
  addition: number;
  less: number;
  lines: EstimationLineInput[];
}

export const estimationApi = {
  list: (filters: {
    customerName?: string;
    vehNo?: string;
    approved?: string;
    staffId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }) => apiRequest<Paged<EstimationListItem>>(`/estimations${qs(filters)}`),
  get: (id: number) => apiRequest<EstimationListItem & { lines: EstimationLine[] }>(`/estimations/${id}`),
  create: (input: EstimationInput) => apiRequest<{ id: number }>('/estimations', { method: 'POST', body: input }),
  update: (
    id: number,
    changes: Partial<Omit<EstimationInput, 'customerId' | 'billDate' | 'jobCardNo'>>
  ) => apiRequest<{ message: string }>(`/estimations/${id}`, { method: 'PUT', body: changes }),
  approve: (id: number, approved: boolean, remarks?: string) =>
    apiRequest<{ message: string }>(`/estimations/${id}/approve`, { method: 'PUT', body: { approved, remarks } }),
  staffHelp: (query: string) =>
    apiRequest<Array<{ ocode: string; name: string }>>(`/estimations/staff/help?q=${encodeURIComponent(query)}`),
  listAdvisors: () => apiRequest<AdvisorOption[]>('/estimations/advisors')
};

export const jobApi = {
  list: (filters: { status?: string; customerName?: string; page?: number; limit?: number }) =>
    apiRequest<Paged<JobListItem>>(`/jobs${qs(filters)}`),
  get: (id: number) => apiRequest<JobListItem>(`/jobs/${id}`),
  updateStatus: (id: number, statusId: number) =>
    apiRequest<{ message: string }>(`/jobs/${id}/status`, { method: 'PUT', body: { statusId } }),
  listWorkInProgress: (filters: { ordr?: string; empName?: string; page?: number; limit?: number }) =>
    apiRequest<Paged<WorkInProgressItem>>(`/jobs/work-in-progress${qs(filters)}`),
  listAssigned: (filters: { ordr?: string; page?: number; limit?: number }) =>
    apiRequest<Paged<AssignedJobItem>>(`/jobs/assigned${qs(filters)}`),
  assign: (ordr: string, empId: number) =>
    apiRequest<{ message: string }>('/jobs/assign', { method: 'POST', body: { ordr, empId } })
};

export const jobStatusMasterApi = {
  list: () => apiRequest<JobStatus[]>('/jobs/status-master'),
  create: (input: Omit<JobStatus, 'statusId'>) =>
    apiRequest<{ statusId: number }>('/jobs/status-master', { method: 'POST', body: input }),
  update: (statusId: number, changes: Partial<Omit<JobStatus, 'statusId'>>) =>
    apiRequest<{ message: string }>(`/jobs/status-master/${statusId}`, { method: 'PUT', body: changes }),
  remove: (statusId: number) => apiRequest<void>(`/jobs/status-master/${statusId}`, { method: 'DELETE' })
};
