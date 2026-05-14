import {
  AuthResponse,
  SignupPayload,
  LoginPayload,
  GoogleLoginPayload,
  SolvePayload,
  SolveResponse,
  HistoryResponse,
  LeaderboardResponse,
  StatisticsResponse,
  User,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';


async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data as T;
}
export const authAPI = {
  signup: (payload: SignupPayload) =>
    apiFetch<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: LoginPayload) =>
    apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  googleLogin: (payload: GoogleLoginPayload) =>
    apiFetch<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
export const userAPI = {
  getProfile: () =>
    apiFetch<{ success: boolean; data: User }>('/user/profile'),

  getHistory: (page = 1, limit = 20, cubeType?: string) => {
    let url = `/user/history?page=${page}&limit=${limit}`;
    if (cubeType) url += `&cubeType=${cubeType}`;
    return apiFetch<HistoryResponse>(url);
  },

  getLeaderboard: (sortBy = 'totalSolves', limit = 25) =>
    apiFetch<LeaderboardResponse>(`/user/leaderboard?sortBy=${sortBy}&limit=${limit}`),

  getStatistics: (cubeType?: string) => {
    let url = '/user/statistics';
    if (cubeType) url += `?cubeType=${cubeType}`;
    return apiFetch<StatisticsResponse>(url);
  },
};
export const solverAPI = {
  solve: (payload: SolvePayload) =>
    apiFetch<SolveResponse>('/solver/solve', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
