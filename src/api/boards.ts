import { apiClient } from './client';
import type { Board } from '@/types';

export const boardsApi = {
  getAll: async (): Promise<Board[]> => {
    const response = await apiClient.get('/boards');
    return response.data;
  },

  getById: async (id: string): Promise<Board> => {
    const response = await apiClient.get(`/boards/${id}`);
    return response.data;
  },

  create: async (data: { title: string; color?: string }): Promise<Board> => {
    const response = await apiClient.post('/boards', data);
    return response.data;
  },

  update: async (id: string, data: { title?: string; color?: string }): Promise<Board> => {
    const response = await apiClient.put(`/boards/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/boards/${id}`);
  },
};
