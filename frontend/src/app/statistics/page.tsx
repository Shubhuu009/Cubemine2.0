'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Clock, Hash, TrendingUp, Flame, Target, Zap,
  Award, Activity, PieChart, ArrowDown, ArrowUp, Minus,
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loader from '@/components/Loader';
import { userAPI } from '@/services/api';
import { StatisticsResponse } from '@/types';

function formatTime(ms: number | null | undefined) {
  if (!ms) return '—';
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  const min = Math.floor(ms / 60000);
  const sec = ((ms % 60000) / 1000).toFixed(1);
  return `${min}m ${sec}s`;
}


function SparklineChart({ data, width = 400, height = 120, color = '#818cf8' }: {
  data: number[]; width?: number; height?: number; color?: string;
}) {
  if (data.length < 2) return <div className="h-[120px] flex items-center justify-center text-white/20 text-sm">Not enough data</div>;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const padding = 10;
  const w = width - padding * 2;
  const h = height - padding * 2;

  const points = data.map((v, i) => ({
    x: padding + (i / (data.length - 1)) * w,
    y: padding + h - ((v - min) / range) * h,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaD = `${pathD} L${points[points.length - 1].x},${height - padding} L${padding},${height - padding} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#grad-${color.replace('#', '')})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} opacity={i === points.length - 1 ? 1 : 0}>
          <animate attributeName="opacity" from="0" to="1" dur="1s" begin={`${i * 0.05}s`} fill="freeze" />
        </circle>
      ))}
    </svg>
  );
}


function BarChart({ data, labels, width = 400, height = 160, color = '#818cf8' }: {
  data: number[]; labels: string[]; width?: number; height?: number; color?: string;
}) {
  const max = Math.max(...data) || 1;
  const barWidth = Math.min(40, (width - 40) / data.length - 8);
  const chartH = height - 40;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      {data.map((v, i) => {
        const barH = (v / max) * chartH;
        const x = 20 + i * ((width - 40) / data.length) + ((width - 40) / data.length - barWidth) / 2;
        const y = chartH - barH + 10;
        return (
          <g key={i}>
            <motion.rect
              x={x} y={chartH + 10} width={barWidth} height={0}
              rx={4} fill={color}
              animate={{ y, height: barH }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
              opacity={0.8}
            />
            <text x={x + barWidth / 2} y={height - 4} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontWeight="600">
              {labels[i]}
            </text>
            {v > 0 && (
              <motion.text
                x={x + barWidth / 2} y={y - 6} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10" fontWeight="700"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 + 0.3 }}
              >
                {v}
              </motion.text>
            )}
          </g>
        );
      })}
    </svg>
  );
}


function DonutChart({ values, labels, colors: chartColors }: {
  values: number[]; labels: string[]; colors: string[];
}) {
  const total = values.reduce((a, b) => a + b, 0) || 1;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="w-28 h-28 shrink-0">
        {values.map((v, i) => {
          const pct = v / total;
          const dashArray = `${pct * circumference} ${circumference}`;
          const dashOffset = -offset * circumference;
          offset += pct;
          return (
            <circle
              key={i}
              cx="50" cy="50" r={radius}
              fill="none" stroke={chartColors[i]} strokeWidth="12"
              strokeDasharray={dashArray} strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              opacity={0.85}
            />
          );
        })}
        <text x="50" y="48" textAnchor="middle" fill="white" fontSize="16" fontWeight="800">{total}</text>
        <text x="50" y="60" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8" fontWeight="600">TOTAL</text>
      </svg>
      <div className="space-y-2">
        {labels.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColors[i] }} />
            <span className="text-sm text-white/60">{label}</span>
            <span className="text-sm font-bold text-white/80 ml-auto">{values[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


function ActivityHeatmap({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count)) || 1;
  return (
    <div className="flex gap-1 flex-wrap">
      {data.map((d) => {
        const intensity = d.count / max;
        const opacity = d.count === 0 ? 0.06 : 0.15 + intensity * 0.7;
        return (
          <div
            key={d.date}
            className="w-5 h-5 rounded-[4px] transition-all hover:scale-125"
            style={{ backgroundColor: `rgba(99, 102, 241, ${opacity})` }}
            title={`${d.date}: ${d.count} solves`}
          />
        );
      })}
    </div>
  );
}


function MiniStat({ icon, label, value, subtext, color, delay }: {
  icon: React.ReactNode; label: string; value: string | number; subtext?: string; color: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="card group"
    >
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
        {icon}
      </div>
      <p className="text-2xl font-black text-white mb-0.5 font-mono">{value}</p>
      <p className="text-xs text-white/35 font-medium">{label}</p>
      {subtext && <p className="text-[10px] text-white/20 mt-1">{subtext}</p>}
    </motion.div>
  );
}

function StatisticsContent() {
  const [stats, setStats] = useState<StatisticsResponse['data'] | null>(null);
  const [cubeFilter, setCubeFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await userAPI.getStatistics(cubeFilter || undefined);
        setStats(res.data);
      } catch {
        
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [cubeFilter]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Crunching your numbers..." />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/40">Unable to load statistics</p>
      </div>
    );
  }

  const { overview, averages, distribution, dailyActivity, timeTrend, cubeBreakdown } = stats;
  const trendData = timeTrend.map(t => t.time);
  let trendDir: 'up' | 'down' | 'flat' = 'flat';
  if (trendData.length >= 4) {
    const firstHalf = trendData.slice(0, Math.floor(trendData.length / 2));
    const secondHalf = trendData.slice(Math.floor(trendData.length / 2));
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    if (avgSecond < avgFirst * 0.95) trendDir = 'down'; // improving
    else if (avgSecond > avgFirst * 1.05) trendDir = 'up'; // getting slower
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-400">Analytics</p>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            Your <span className="gradient-text">Statistics</span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/40">
            Deep insights into your cubing performance and progress.
          </p>
        </motion.header>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mb-6 flex justify-center"
        >
          <div className="flex rounded-xl bg-white/[0.04] p-1">
            {[
              { key: '', label: 'All Cubes' },
              { key: '2x2', label: '2×2' },
              { key: '3x3', label: '3×3' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setCubeFilter(f.key)}
                className={`rounded-lg px-5 py-2 text-sm font-bold transition ${
                  cubeFilter === f.key
                    ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/20'
                    : 'text-white/45 hover:bg-white/[0.05] hover:text-white/80'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </motion.div>

        {overview.totalSolves === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-16 text-center"
          >
            <BarChart3 size={48} className="mx-auto mb-4 text-white/10" />
            <p className="text-white/40 font-medium text-lg mb-2">No data yet</p>
            <p className="text-white/25 text-sm">Start solving cubes to see your statistics here!</p>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
              <MiniStat icon={<Hash size={18} className="text-brand-400" />} label="Total Solves" value={overview.totalSolves} color="bg-brand-500/15" delay={0.1} />
              <MiniStat icon={<Target size={18} className="text-emerald-400" />} label="Success Rate" value={`${overview.successRate}%`} color="bg-emerald-500/15" delay={0.13} />
              <MiniStat icon={<Clock size={18} className="text-purple-400" />} label="Avg Time" value={formatTime(overview.avgTime)} color="bg-purple-500/15" delay={0.16} />
              <MiniStat icon={<Zap size={18} className="text-amber-400" />} label="Best Time" value={formatTime(overview.bestTime)} color="bg-amber-500/15" delay={0.19} />
              <MiniStat icon={<Flame size={18} className="text-rose-400" />} label="Current Streak" value={`${overview.currentStreak}d`} subtext={`Best: ${overview.longestStreak}d`} color="bg-rose-500/15" delay={0.22} />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass p-5 mb-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-brand-400" />
                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Rolling Averages</h3>
                {trendDir !== 'flat' && (
                  <span className={`ml-2 flex items-center gap-1 text-xs font-bold ${trendDir === 'down' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {trendDir === 'down' ? <ArrowDown size={12} /> : <ArrowUp size={12} />}
                    {trendDir === 'down' ? 'Improving' : 'Slower'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Ao5', value: averages.ao5 },
                  { label: 'Ao12', value: averages.ao12 },
                  { label: 'Ao50', value: averages.ao50 },
                  { label: 'Ao100', value: averages.ao100 },
                ].map((avg) => (
                  <div key={avg.label} className="text-center p-3 rounded-xl bg-white/[0.03]">
                    <p className="text-xs text-white/30 font-bold uppercase mb-1">{avg.label}</p>
                    <p className="text-lg font-black font-mono text-white">{formatTime(avg.value)}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={16} className="text-purple-400" />
                  <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Time Trend</h3>
                  <span className="text-[10px] text-white/25 ml-auto">Last {trendData.length} solves</span>
                </div>
                <SparklineChart data={trendData} color="#a78bfa" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.33 }}
                className="glass p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 size={16} className="text-cyan-400" />
                  <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Time Distribution</h3>
                </div>
                <BarChart
                  data={Object.values(distribution)}
                  labels={Object.keys(distribution)}
                  color="#22d3ee"
                />
              </motion.div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.36 }}
                className="glass p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Flame size={16} className="text-amber-400" />
                  <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">30-Day Activity</h3>
                </div>
                <ActivityHeatmap data={dailyActivity} />
                <div className="flex items-center gap-2 mt-3 justify-end">
                  <span className="text-[10px] text-white/25">Less</span>
                  {[0.06, 0.2, 0.45, 0.7, 0.85].map((op, i) => (
                    <div key={i} className="w-3 h-3 rounded-[3px]" style={{ backgroundColor: `rgba(99, 102, 241, ${op})` }} />
                  ))}
                  <span className="text-[10px] text-white/25">More</span>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.39 }}
                className="glass p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <PieChart size={16} className="text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Cube Breakdown</h3>
                </div>
                <DonutChart
                  values={[cubeBreakdown['2x2'] || 0, cubeBreakdown['3x3'] || 0]}
                  labels={['2×2 Solves', '3×3 Solves']}
                  colors={['#22c55e', '#a78bfa']}
                />
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 }}
              className="glass p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <Award size={16} className="text-brand-400" />
                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Additional Stats</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 rounded-xl bg-white/[0.03] text-center">
                  <p className="text-xs text-white/30 mb-1">Median Time</p>
                  <p className="text-lg font-bold font-mono text-white">{formatTime(overview.medianTime)}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] text-center">
                  <p className="text-xs text-white/30 mb-1">Worst Time</p>
                  <p className="text-lg font-bold font-mono text-white">{formatTime(overview.worstTime)}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] text-center">
                  <p className="text-xs text-white/30 mb-1">Avg Moves</p>
                  <p className="text-lg font-bold font-mono text-white">{overview.avgMoves}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] text-center">
                  <p className="text-xs text-white/30 mb-1">Longest Streak</p>
                  <p className="text-lg font-bold font-mono text-white">{overview.longestStreak}d</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

export default function StatisticsPage() {
  return (
    <ProtectedRoute>
      <StatisticsContent />
    </ProtectedRoute>
  );
}
