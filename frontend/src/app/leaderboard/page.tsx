'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Medal, Crown, Clock, Hash, ChevronDown,
  Flame, Star, Zap, Award, Box, Layers,
} from 'lucide-react';
import { userAPI } from '@/services/api';
import { LeaderboardEntry } from '@/types';
import Loader from '@/components/Loader';

const sortOptions = [
  { key: 'totalSolves', label: 'Most Solves',  icon: <Hash size={14} />,   col: 'totalSolves' },
  { key: 'bestTime2x2', label: 'Best 2×2',     icon: <Clock size={14} />,  col: 'bestTime2x2' },
  { key: 'bestTime3x3', label: 'Best 3×3',     icon: <Clock size={14} />,  col: 'bestTime3x3' },
  { key: 'bestTime4x4', label: 'Best 4×4',     icon: <Clock size={14} />,  col: 'bestTime4x4' },
  { key: 'bestTime5x5', label: 'Best 5×5',     icon: <Clock size={14} />,  col: 'bestTime5x5' },
] as const;

type SortKey = typeof sortOptions[number]['key'];

const rankGradients = [
  'from-amber-400 to-yellow-500',
  'from-slate-300 to-slate-400',
  'from-orange-400 to-amber-600',
];

const rankIcons = [
  <Crown key="c" size={20} className="text-amber-400" />,
  <Medal key="m" size={20} className="text-slate-300" />,
  <Award key="a" size={20} className="text-orange-400" />,
];

function formatTime(ms: number | null) {
  if (!ms) return '—';
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  const min = Math.floor(ms / 60000);
  const sec = ((ms % 60000) / 1000).toFixed(1);
  return `${min}m ${sec}s`;
}

function getPodiumValue(entry: LeaderboardEntry, sortBy: SortKey): string {
  if (sortBy === 'totalSolves') return `${entry.totalSolves} solves`;
  const map: Record<string, number | null> = {
    bestTime2x2: entry.bestTime2x2,
    bestTime3x3: entry.bestTime3x3,
    bestTime4x4: entry.bestTime4x4,
    bestTime5x5: entry.bestTime5x5,
  };
  return formatTime(map[sortBy] ?? null);
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>('totalSolves');
  const [loading, setLoading] = useState(true);
  const [showSort, setShowSort] = useState(false);

  useEffect(() => {
    setLoading(true);
    userAPI.getLeaderboard(sortBy, 25)
      .then((res) => setEntries(res.data.leaderboard))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sortBy]);

  const currentSort = sortOptions.find((s) => s.key === sortBy) || sortOptions[0];

  return (
    <div className="relative min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      {/* Ambient bg */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-amber-500/5 blur-[160px]" />
        <div className="absolute bottom-32 right-12 h-72 w-72 rounded-full bg-brand-500/5 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mb-4 flex items-center justify-center">
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center"
            >
              <Trophy size={32} className="text-amber-400" />
            </motion.div>
          </div>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-400 mb-2">Rankings</p>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            Leader<span className="gradient-text-warm">board</span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/40 sm:text-base">
            Compete with solvers worldwide across all 4 cube types. Updated in real-time.
          </p>
        </motion.header>

        {/* Sort bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex items-center justify-between gap-4 flex-wrap"
        >
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-amber-400" />
            <span className="text-sm font-semibold text-white/50">
              {entries.length} players ranked
            </span>
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-2 rounded-xl bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white/70 border border-white/[0.08] transition hover:bg-white/[0.09] hover:text-white"
            >
              {currentSort.icon}
              <span>{currentSort.label}</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${showSort ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showSort && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-white/[0.08] bg-surface-900/96 p-1.5 shadow-2xl backdrop-blur-2xl"
                >
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => { setSortBy(opt.key); setShowSort(false); }}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition ${
                        sortBy === opt.key
                          ? 'bg-brand-500/15 text-brand-400 font-semibold'
                          : 'text-white/50 hover:bg-white/[0.06] hover:text-white/80'
                      }`}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Leaderboard card */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass overflow-hidden"
        >
          {loading ? (
            <div className="py-24"><Loader text="Loading leaderboard..." /></div>
          ) : entries.length === 0 ? (
            <div className="py-24 text-center">
              <Star size={36} className="mx-auto mb-3 text-white/10" />
              <p className="text-white/35 font-medium">No entries yet</p>
              <p className="text-white/20 text-sm mt-1">Be the first to solve a cube!</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {/* Podium */}
              {entries.length >= 3 && (
                <div className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-b from-white/[0.025] to-transparent">
                  {[1, 0, 2].map((podiumIdx) => {
                    const entry = entries[podiumIdx];
                    if (!entry) return null;
                    const isFirst = podiumIdx === 0;
                    return (
                      <motion.div
                        key={entry.rank}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + podiumIdx * 0.1 }}
                        className={`flex flex-col items-center text-center p-4 rounded-2xl hover:bg-white/[0.04] transition-all ${
                          isFirst ? 'order-2 -mt-4' : podiumIdx === 1 ? 'order-1 mt-4' : 'order-3 mt-4'
                        }`}
                      >
                        <div className={`rounded-2xl bg-gradient-to-br ${rankGradients[entry.rank - 1]} flex items-center justify-center mb-3 text-white font-black ${
                          isFirst ? 'w-16 h-16 text-xl shadow-xl shadow-amber-500/25' : 'w-12 h-12 text-base'
                        }`}>
                          {entry.rank}
                        </div>
                        {rankIcons[entry.rank - 1]}
                        <p className={`font-bold text-white mt-2 ${isFirst ? 'text-base' : 'text-sm'}`}>
                          {entry.username}
                        </p>
                        <p className="text-xs text-white/30 mt-1 font-mono">
                          {getPodiumValue(entry, sortBy)}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.04]">
                      <th className="py-3 px-4 text-left text-xs text-white/30 font-semibold uppercase tracking-wider w-14">#</th>
                      <th className="py-3 px-4 text-left text-xs text-white/30 font-semibold uppercase tracking-wider">Player</th>
                      <th className="py-3 px-4 text-right text-xs text-white/30 font-semibold uppercase tracking-wider">Solves</th>
                      <th className="py-3 px-4 text-right text-xs text-white/30 font-semibold uppercase tracking-wider hidden md:table-cell">2×2</th>
                      <th className="py-3 px-4 text-right text-xs text-white/30 font-semibold uppercase tracking-wider hidden md:table-cell">3×3</th>
                      <th className="py-3 px-4 text-right text-xs text-white/30 font-semibold uppercase tracking-wider hidden lg:table-cell">4×4</th>
                      <th className="py-3 px-4 text-right text-xs text-white/30 font-semibold uppercase tracking-wider hidden lg:table-cell">5×5</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.slice(entries.length >= 3 ? 3 : 0).map((entry, i) => (
                      <motion.tr
                        key={entry.rank}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.025 }}
                        className="border-b border-white/[0.03] hover:bg-white/[0.025] transition-colors group"
                      >
                        <td className="py-3.5 px-4">
                          <span className="text-white/30 font-mono text-sm font-bold">{entry.rank}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500/20 to-purple-500/20 flex items-center justify-center text-xs font-bold text-brand-400 border border-brand-500/10 shrink-0">
                              {entry.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                              {entry.username}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="text-white/60 font-mono text-sm">{entry.totalSolves}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right hidden md:table-cell">
                          <span className="text-emerald-400/70 font-mono text-sm">{formatTime(entry.bestTime2x2)}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right hidden md:table-cell">
                          <span className="text-purple-400/70 font-mono text-sm">{formatTime(entry.bestTime3x3)}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right hidden lg:table-cell">
                          <span className="text-amber-400/70 font-mono text-sm">{formatTime(entry.bestTime4x4)}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right hidden lg:table-cell">
                          <span className="text-rose-400/70 font-mono text-sm">{formatTime(entry.bestTime5x5)}</span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-xs text-white/15"
        >
          <Zap size={10} className="inline mr-1" />
          Rankings update in real-time as solves are completed
        </motion.p>
      </div>
    </div>
  );
}
