import { apiClient } from './client';
import type { Card } from '@/types';

export const cardsApi = {
  getByListId: async (listId: string): Promise<Card[]> => {
    const response = await apiClient.get(`/cards/${listId}`);
    return response.data;
  },

  create: async (data: { title: string; listId: string; position: number; description?: string; color?: string }): Promise<Card> => {
    const response = await apiClient.post('/cards', data);
    return response.data;
  },

  update: async (id: string, data: { title?: string; description?: string; color?: string; position?: number }): Promise<Card> => {
    const response = await apiClient.put(`/cards/${id}`, data);
    return response.data;
  },

  move: async (id: string, data: { listId: string; position: number }): Promise<Card> => {
    const response = await apiClient.put(`/cards/${id}/move`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/cards/${id}`);
  },
};
