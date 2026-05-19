export interface UserPreferences {
  theme: 'dark' | 'light';
  showTimer: boolean;
  enableKeyboardShortcuts: boolean;
  enableNotifications: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  totalSolves: number;
  bestTime2x2: number | null;
  bestTime3x3: number | null;
  bestTime4x4: number | null;
  bestTime5x5: number | null;
  authProvider?: 'local' | 'google';
  avatar?: string | null;
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: { user: User; token: string };
}

export interface SignupPayload { username: string; email: string; password: string; }
export interface LoginPayload { email: string; password: string; }
export interface GoogleLoginPayload { credential: string; }

export type CubeColor = 'W' | 'Y' | 'R' | 'O' | 'B' | 'G';
export type CubeType = '2x2' | '3x3' | '4x4' | '5x5';

export interface SolvePayload { cubeType: CubeType; state: CubeColor[]; solveTime?: number; }
export interface SolveResponse {
  success: boolean; message: string;
  data: { cubeType: CubeType; moves: string[]; moveCount: number; explanation: string[]; solved: boolean; };
}

export interface SolveRecord {
  _id: string; userId: string; cubeType: CubeType;
  initialState: string[]; solveMoves: string[]; moveCount: number;
  solveTime: number | null; solved: boolean; createdAt: string;
}

export interface HistoryResponse {
  success: boolean;
  data: { history: SolveRecord[]; pagination: { currentPage: number; totalPages: number; totalRecords: number; hasMore: boolean; }; };
}

export interface LeaderboardEntry {
  rank: number; username: string; totalSolves: number;
  bestTime2x2: number | null; bestTime3x3: number | null;
  bestTime4x4: number | null; bestTime5x5: number | null;
  memberSince: string;
}
export interface LeaderboardResponse {
  success: boolean;
  data: { leaderboard: LeaderboardEntry[]; sortBy: string; total: number; };
}

export interface StatisticsOverview {
  totalSolves: number; solvedCount: number; successRate: number;
  avgTime: number; bestTime: number | null; worstTime: number | null;
  medianTime: number | null; avgMoves: number; currentStreak: number; longestStreak: number;
}
export interface StatisticsAverages { ao5: number | null; ao12: number | null; ao50: number | null; ao100: number | null; }
export interface DailyActivity { date: string; count: number; }
export interface TimeTrendPoint { time: number; date: string; cubeType: CubeType; }
export interface StatisticsResponse {
  success: boolean;
  data: { overview: StatisticsOverview; averages: StatisticsAverages; distribution: Record<string, number>; dailyActivity: DailyActivity[]; timeTrend: TimeTrendPoint[]; cubeBreakdown: Record<string, number>; };
}

export interface Review {
  _id: string; userId: string; username: string; rating: number;
  cubeType: string; title?: string; body: string;
  helpfulVotes: number; verified: boolean; createdAt: string;
}
export interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    pagination: { currentPage: number; totalPages: number; totalRecords: number; hasMore: boolean; };
    aggregate: { avgRating: number; total: number; breakdown: Record<string, number>; };
  };
}

export interface ApiError { success: false; message: string; errors?: { field: string; message: string }[]; }
