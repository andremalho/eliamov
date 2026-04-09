import api from './api';

export type MarketCategory =
  | 'clothing'
  | 'supplements'
  | 'equipment'
  | 'professional_service';

export const CATEGORY_LABELS = [
  { value: 'clothing', label: 'Vestuário' },
  { value: 'supplements', label: 'Suplementos' },
  { value: 'equipment', label: 'Equipamento' },
  { value: 'professional_service', label: 'Serviço profissional' },
];

export interface MarketplaceItem {
  id: string;
  sellerId: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: MarketCategory;
  isActive: boolean;
}

export const marketplaceApi = {
  list: () => api.get<MarketplaceItem[]>('/marketplace').then((r) => r.data),
  findOne: (id: string) =>
    api.get<MarketplaceItem>(`/marketplace/${id}`).then((r) => r.data),
};
