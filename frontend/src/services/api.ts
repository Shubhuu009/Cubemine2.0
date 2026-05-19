import {
  AuthResponse, SignupPayload, LoginPayload, GoogleLoginPayload,
  SolvePayload, SolveResponse, HistoryResponse, LeaderboardResponse,
  StatisticsResponse, ReviewsResponse, User, UserPreferences,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data as T;
}

export const authAPI = {
  signup: (payload: SignupPayload) => apiFetch<AuthResponse>('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: LoginPayload) => apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  googleLogin: (payload: GoogleLoginPayload) => apiFetch<AuthResponse>('/auth/google', { method: 'POST', body: JSON.stringify(payload) }),
};

export const userAPI = {
  getProfile: () => apiFetch<{ success: boolean; data: User }>('/user/profile'),

  updateProfile: (payload: { username?: string; avatar?: string | null }) =>
    apiFetch<{ success: boolean; message: string; data: User }>('/user/profile', { method: 'PUT', body: JSON.stringify(payload) }),

  getPreferences: () => apiFetch<{ success: boolean; data: UserPreferences }>('/user/preferences'),

  updatePreferences: (payload: Partial<UserPreferences>) =>
    apiFetch<{ success: boolean; message: string; data: UserPreferences }>('/user/preferences', { method: 'PUT', body: JSON.stringify(payload) }),

  deleteAccount: () => apiFetch<{ success: boolean; message: string }>('/user/me', { method: 'DELETE' }),

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
  solve: (payload: SolvePayload) => apiFetch<SolveResponse>('/solver/solve', { method: 'POST', body: JSON.stringify(payload) }),
};

export const reviewAPI = {
  getReviews: (params?: { cubeType?: string; sort?: string; page?: number }) => {
    const q = new URLSearchParams();
    if (params?.cubeType) q.set('cubeType', params.cubeType);
    if (params?.sort) q.set('sort', params.sort);
    if (params?.page) q.set('page', String(params.page));
    return apiFetch<ReviewsResponse>(`/reviews?${q.toString()}`);
  },
  submitReview: (payload: { rating: number; cubeType?: string; title?: string; body: string }) =>
    apiFetch<{ success: boolean; message: string; data: any }>('/reviews', { method: 'POST', body: JSON.stringify(payload) }),
  voteHelpful: (id: string) =>
    apiFetch<{ success: boolean; data: { helpfulVotes: number; voted: boolean } }>(`/reviews/${id}/helpful`, { method: 'PUT' }),
};

export const contactAPI = {
  submit: (payload: { name: string; email: string; topic: string; message: string }) =>
    apiFetch<{ success: boolean; message: string }>('/contact', { method: 'POST', body: JSON.stringify(payload) }),
};
