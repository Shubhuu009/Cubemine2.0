import { create } from 'zustand';
import { User } from '@/types';
import { authAPI, userAPI } from '@/services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  signup: (username: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  hydrate: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  signup: async (username, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authAPI.signup({ username, email, password });
      localStorage.setItem('token', res.data.token);
      set({ user: res.data.user, token: res.data.token, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authAPI.login({ email, password });
      localStorage.setItem('token', res.data.token);
      set({ user: res.data.user, token: res.data.token, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  googleLogin: async (credential) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authAPI.googleLogin({ credential });
      localStorage.setItem('token', res.data.token);
      set({ user: res.data.user, token: res.data.token, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, error: null });
  },

  fetchProfile: async () => {
    try {
      const res = await userAPI.getProfile();
      set({ user: res.data });
    } catch {
      get().logout();
    }
  },

  hydrate: () => {
    const token = localStorage.getItem('token');
    if (token) {
      set({ token });
      get().fetchProfile();
    }
  },

  clearError: () => set({ error: null }),
}));
