'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Clock, Hash, Box, Calendar, ChevronLeft, ChevronRight,
  TrendingUp, Flame, Target, BarChart3, Zap, ArrowRight, Activity,
  Award, Layers, Star, CheckCircle2,
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loader from '@/components/Loader';
import { useAuthStore } from '@/store/authStore';
import { userAPI } from '@/services/api';
import { SolveRecord, StatisticsResponse } from '@/types';

function useAnimatedCounter(end: number, duration: number = 1500) {
  const [count, setCount] = useState(0);
  const prevEnd = useRef(0);
  useEffect(() => {
    if (end === prevEnd.current) return;
    prevEnd.current = end;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration]);
  return count;
}

function MiniSparkline({ data, color = '#818cf8' }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120; const h = 36;
  const points = data.map((v, i) => ({ x: (i / (data.length - 1)) * w, y: h - ((v - min) / range) * (h - 4) - 2 }));
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaD = `${d} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-9">
      <defs>
        <linearGradient id={`sparkGrad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#sparkGrad-${color.replace('#','')})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function StatCard({ icon, label, value, subtext, color, delay, sparkData, sparkColor, badge }: {
  icon: React.ReactNode; label: string; value: string | number; subtext?: string;
  color: string; delay: number; sparkData?: number[]; sparkColor?: string; badge?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="card group relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 80% 20%, rgba(99,102,241,0.06) 0%, transparent 70%)' }} />
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
          {icon}
        </div>
        {sparkData && sparkData.length > 1 && (
          <div className="w-20 opacity-50 group-hover:opacity-100 transition-opacity">
            <MiniSparkline data={sparkData} color={sparkColor} />
          </div>
        )}
      </div>
      <p className="text-3xl font-black text-white mb-0.5 font-mono">{value}</p>
      <p className="text-sm text-white/35 font-medium">{label}</p>
      {subtext && <p className="text-xs text-white/20 mt-1">{subtext}</p>}
      {badge && (
        <span className="absolute top-3 right-3 text-[9px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-bold uppercase tracking-wider">
          {badge}
        </span>
      )}
    </motion.div>
  );
}

const CUBE_TYPE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  '2x2': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  '3x3': { bg: 'bg-purple-500/10',  text: 'text-purple-400',  border: 'border-purple-500/20'  },
  '4x4': { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/20'   },
  '5x5': { bg: 'bg-rose-500/10',    text: 'text-rose-400',    border: 'border-rose-500/20'    },
};

function DashboardContent() {
  const { user } = useAuthStore();
  const [history, setHistory] = useState<SolveRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [stats, setStats] = useState<StatisticsResponse['data'] | null>(null);

  const animatedSolves = useAnimatedCounter(user?.totalSolves || 0);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await userAPI.getHistory(page, 10, filter || undefined);
        setHistory(res.data.history);
        setTotalPages(res.data.pagination.totalPages);
        setTotalRecords(res.data.pagination.totalRecords);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetchHistory();
  }, [page, filter]);

  useEffect(() => {
    userAPI.getStatistics().then((res) => setStats(res.data)).catch(() => {});
  }, []);

  const formatTime = (ms: number | null) => {
    if (!ms) return '—';
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    const m = Math.floor(ms / 60000);
    const s = ((ms % 60000) / 1000).toFixed(2);
    return `${m}:${s.padStart(5, '0')}`;
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const dailyData = stats?.dailyActivity?.map((d) => d.count) || [];
  const trendData = stats?.timeTrend?.map((t) => t.time) || [];

  const cubeStats = [
    { type: '2x2', best: user?.bestTime2x2 ?? null, icon: <Box size={18} className="text-emerald-400" />, color: 'bg-emerald-500/15', label: 'Best 2×2' },
    { type: '3x3', best: user?.bestTime3x3 ?? null, icon: <Layers size={18} className="text-purple-400" />, color: 'bg-purple-500/15', label: 'Best 3×3' },
    { type: '4x4', best: user?.bestTime4x4 ?? null, icon: <Award size={18} className="text-amber-400" />, color: 'bg-amber-500/15', label: 'Best 4×4' },
    { type: '5x5', best: user?.bestTime5x5 ?? null, icon: <Star size={18} className="text-rose-400" />, color: 'bg-rose-500/15', label: 'Best 5×5' },
  ];

  const filterOptions = [
    { key: '', label: 'All' },
    { key: '2x2', label: '2×2' },
    { key: '3x3', label: '3×3' },
    { key: '4x4', label: '4×4' },
    { key: '5x5', label: '5×5' },
  ];

  return (
    <div className="min-h-screen px-4 py-10">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-brand-600/6 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/6 w-[300px] h-[300px] bg-purple-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-brand-500/25 ring-2 ring-white/10">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-0.5">Dashboard</p>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Welcome back, <span className="gradient-text">{user?.username}</span>
              </h1>
              <p className="text-white/30 text-sm">{user?.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Main stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatCard
            icon={<Hash size={20} className="text-brand-400" />}
            label="Total Solves"
            value={animatedSolves}
            color="bg-brand-500/15"
            delay={0.05}
            sparkData={dailyData}
            sparkColor="#818cf8"
            badge="All time"
          />
          <StatCard
            icon={<Flame size={20} className="text-amber-400" />}
            label="Current Streak"
            value={`${stats?.overview?.currentStreak || 0}d`}
            subtext={stats?.overview?.longestStreak ? `Best: ${stats.overview.longestStreak}d` : 'No streak yet'}
            color="bg-amber-500/15"
            delay={0.1}
          />
          <StatCard
            icon={<TrendingUp size={20} className="text-cyan-400" />}
            label="Success Rate"
            value={stats?.overview?.successRate ? `${stats.overview.successRate.toFixed(0)}%` : '—'}
            subtext="Solved / Attempted"
            color="bg-cyan-500/15"
            delay={0.15}
            sparkData={trendData}
            sparkColor="#22d3ee"
          />
          <StatCard
            icon={<Clock size={20} className="text-emerald-400" />}
            label="Avg. Time"
            value={formatTime(stats?.overview?.avgTime ?? null)}
            subtext="All cube types"
            color="bg-emerald-500/15"
            delay={0.2}
          />
        </div>

        {/* Cube best times */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {cubeStats.map((cs, i) => (
            <motion.div
              key={cs.type}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.05 }}
              className="glass p-4 group hover:bg-white/[0.07] transition-all duration-300"
            >
              <div className={`w-9 h-9 rounded-xl ${cs.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                {cs.icon}
              </div>
              <p className="text-xl font-black text-white font-mono">{formatTime(cs.best)}</p>
              <p className="text-xs text-white/35 mt-0.5">{cs.label} PB</p>
            </motion.div>
          ))}
        </div>

        {/* Rolling averages */}
        <AnimatePresence>
          {stats?.averages && (stats.averages.ao5 || stats.averages.ao12) && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass p-5 mb-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Activity size={15} className="text-brand-400" />
                <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Rolling Averages</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {([
                  { label: 'Ao5', value: stats.averages.ao5 },
                  { label: 'Ao12', value: stats.averages.ao12 },
                  { label: 'Ao50', value: stats.averages.ao50 },
                  { label: 'Ao100', value: stats.averages.ao100 },
                ] as const).map((avg) => (
                  <div key={avg.label} className="text-center py-3 px-2 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-1">{avg.label}</p>
                    <p className="text-base font-bold font-mono text-white">{avg.value ? formatTime(avg.value) : '—'}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass p-4 mb-6"
        >
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Quick Actions</p>
          <div className="flex flex-wrap gap-2.5">
            <Link href="/solver" className="btn-primary !py-2 !px-5 text-sm flex items-center gap-2">
              <Target size={14} /> New Solve
            </Link>
            <Link href="/statistics" className="btn-secondary !py-2 !px-5 text-sm flex items-center gap-2">
              <BarChart3 size={14} /> Full Analytics
            </Link>
            <Link href="/leaderboard" className="btn-secondary !py-2 !px-5 text-sm flex items-center gap-2">
              <Trophy size={14} /> Leaderboard
            </Link>
            <Link href="/learn" className="btn-secondary !py-2 !px-5 text-sm flex items-center gap-2">
              <TrendingUp size={14} /> Learn Methods
            </Link>
          </div>
        </motion.div>

        {/* Solve History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass overflow-hidden"
        >
          <div className="px-6 py-4 flex items-center justify-between border-b border-white/[0.04] flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Trophy size={18} className="text-brand-400" />
              <h2 className="text-lg font-bold text-white">Solve History</h2>
              {totalRecords > 0 && <span className="stat-badge">{totalRecords} total</span>}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {filterOptions.map((f) => (
                <button
                  key={f.key}
                  onClick={() => { setFilter(f.key); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                    filter === f.key
                      ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25'
                      : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/60'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-6 py-4">
            {loading ? (
              <div className="py-16"><Loader text="Loading history..." /></div>
            ) : history.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.04] flex items-center justify-center">
                  <Box size={28} className="text-white/15" />
                </div>
                <p className="text-white/35 font-medium mb-1">No solves yet</p>
                <p className="text-white/20 text-sm mb-4">Head to the solver to start your journey!</p>
                <Link href="/solver" className="btn-primary !py-2 !px-5 text-sm inline-flex items-center gap-2">
                  <Zap size={14} /> Start Solving <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.04]">
                        {['Type', 'Moves', 'Time', 'Status', 'Date'].map((h, i) => (
                          <th key={h} className={`py-3 px-3 text-xs text-white/30 font-semibold uppercase tracking-wider ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((record, i) => {
                        const style = CUBE_TYPE_STYLES[record.cubeType] || CUBE_TYPE_STYLES['3x3'];
                        return (
                          <motion.tr
                            key={record._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.025 }}
                            className="border-b border-white/[0.03] hover:bg-white/[0.025] transition-colors"
                          >
                            <td className="py-3.5 px-3">
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${style.bg} ${style.text} ${style.border}`}>
                                {record.cubeType}
                              </span>
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="text-white/60 font-mono text-sm font-medium">{record.moveCount}</span>
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="text-white/60 font-mono text-sm">{formatTime(record.solveTime)}</span>
                            </td>
                            <td className="py-3.5 px-3">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${record.solved ? 'text-emerald-400' : 'text-amber-400'}`}>
                                <CheckCircle2 size={12} className={record.solved ? 'text-emerald-400' : 'text-amber-400'} />
                                {record.solved ? 'Solved' : 'Partial'}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              <span className="text-white/30 text-xs">{formatDate(record.createdAt)}</span>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.04]">
                    <span className="text-xs text-white/25">Page {page} of {totalPages}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-lg bg-white/[0.04] text-white/40 hover:bg-white/[0.08] disabled:opacity-20 transition-all"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="p-2 rounded-lg bg-white/[0.04] text-white/40 hover:bg-white/[0.08] disabled:opacity-20 transition-all"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>

        {/* Footer note */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }} className="mt-6 text-center">
          <p className="text-xs text-white/15 flex items-center justify-center gap-2">
            <Calendar size={12} />
            Member since {user ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '...'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
