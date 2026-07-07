import { apiRequest } from './client';

export interface ItemLookup {
  itemCode: string;
  description: string | null;
  salesRate: number | null;
  stock: number | null;
}

export const itemApi = {
  help: (q: string) => apiRequest<ItemLookup[]>(`/items/help?q=${encodeURIComponent(q)}`)
};
