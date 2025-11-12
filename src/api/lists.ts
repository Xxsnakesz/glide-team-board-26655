import { apiClient } from './client';
import type { List } from '@/types';

export const listsApi = {
  getByBoardId: async (boardId: string): Promise<List[]> => {
    const response = await apiClient.get(`/lists/${boardId}`);
    return response.data;
  },

  create: async (data: { title: string; boardId: string; position: number }): Promise<List> => {
    const response = await apiClient.post('/lists', data);
    return response.data;
  },

  update: async (id: string, data: { title?: string; position?: number }): Promise<List> => {
    const response = await apiClient.put(`/lists/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/lists/${id}`);
  },
};
