import { apiRequest } from './client';

export interface CompanyHeader {
  ccode: string;
  companyName: string | null;
  address1: string | null;
  address2: string | null;
  address3: string | null;
  phone1: string | null;
  phone2: string | null;
  fax: string | null;
  email: string | null;
}

export interface MenuItem {
  mnuId: string;
  mnuName: string | null;
  level: number | null;
  subLevel: number | null;
  display: boolean;
}

export const reportingApi = {
  getCompanyHeader: () => apiRequest<CompanyHeader>('/admin/company-header'),
  updateCompanyHeader: (changes: { companyName?: string; address1?: string }) =>
    apiRequest<{ message: string }>('/admin/company-header', { method: 'PUT', body: changes }),
  listMenu: () => apiRequest<MenuItem[]>('/schema/menu')
};
