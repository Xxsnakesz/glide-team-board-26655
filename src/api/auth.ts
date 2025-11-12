import { apiClient } from './client';
import type { User } from '@/types';

export const authApi = {
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data.user;
    } catch (error) {
      return null;
    }
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};
