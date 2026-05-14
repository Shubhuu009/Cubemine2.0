'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Box, Zap, Trophy, BookOpen, ArrowRight, Shield, Clock, Sparkles,
  ChevronDown, Users, Target, BarChart3, Award, Flame, Star, Check,
  Layers, Timer, Activity, TrendingUp,
} from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import HeroCube from '@/components/HeroCube';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] },
  }),
};

const features = [
  { icon: <Box size={22} />, title: '2×2 to 5×5 Solver', desc: 'Step-by-step interactive solving for pocket, standard, master, and professor cubes with a live 3D canvas.', gradient: 'from-blue-500 to-cyan-500' },
  { icon: <BookOpen size={22} />, title: 'Learn Any Method', desc: 'Guided tutorials with algorithm steppers, notation reference, and ad-free YouTube video walkthroughs.', gradient: 'from-emerald-500 to-teal-500' },
  { icon: <Trophy size={22} />, title: 'Global Leaderboard', desc: 'Compete with solvers worldwide. Climb the rankings across all 4 cube types with real-time stats.', gradient: 'from-amber-500 to-orange-500' },
  { icon: <BarChart3 size={22} />, title: 'Deep Analytics', desc: 'Track Ao5, Ao12, Ao50, time trends, session streaks, and distribution charts.', gradient: 'from-violet-500 to-purple-500' },
  { icon: <Shield size={22} />, title: 'Secure & Private', desc: 'JWT auth, bcrypt password hashing, rate limiting, Redis caching, and encrypted transport.', gradient: 'from-rose-500 to-pink-500' },
  { icon: <Timer size={22} />, title: 'Precision Timer', desc: 'Centisecond solve timer with spacebar controls, keyboard shortcuts, and session history.', gradient: 'from-indigo-500 to-blue-500' },
];

const stats = [
  { value: '4', label: 'Cube Types', icon: <Box size={16} />, color: 'text-blue-400' },
  { value: '7', label: 'Solving Steps', icon: <Target size={16} />, color: 'text-emerald-400' },
  { value: '∞', label: 'Solves Possible', icon: <Sparkles size={16} />, color: 'text-brand-400' },
  { value: '24/7', label: 'Available', icon: <Activity size={16} />, color: 'text-amber-400' },
];

const howItWorks = [
  { step: '01', title: 'Paint Your Cube', desc: 'Use the interactive 3D canvas or flat face map to paint each sticker color.', icon: <Box size={20} />, color: 'from-blue-500/20 to-cyan-500/20', iconColor: 'text-cyan-400' },
  { step: '02', title: 'Hit Solve', desc: 'Our engine analyzes your cube state and returns step-by-step move instructions.', icon: <Zap size={20} />, color: 'from-brand-500/20 to-purple-500/20', iconColor: 'text-brand-400' },
  { step: '03', title: 'Follow the Steps', desc: 'Apply each move on your physical cube — algorithms explained in plain English.', icon: <Check size={20} />, color: 'from-emerald-500/20 to-teal-500/20', iconColor: 'text-emerald-400' },
  { step: '04', title: 'Track Progress', desc: 'Log every solve, compare personal bests, and watch your times drop.', icon: <TrendingUp size={20} />, color: 'from-amber-500/20 to-orange-500/20', iconColor: 'text-amber-400' },
];

const testimonials = [
  { name: 'Alex C.', role: 'Speedcuber', text: 'CUBEMINE helped me understand layer-by-layer and drop my 3×3 time by 15 seconds!', avatar: 'A', rating: 5 },
  { name: 'Priya M.', role: 'Beginner', text: 'I never thought I could solve a Rubik\'s cube. The step-by-step guide made it possible in one afternoon.', avatar: 'P', rating: 5 },
  { name: 'Jordan K.', role: 'College Student', text: 'The analytics dashboard is incredible. Watching my Ao12 drop week over week is so motivating.', avatar: 'J', rating: 5 },
];

const cubeTypes = [
  { type: '2×2', label: 'Pocket', facelets: 24, moves: 9, color: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/20' },
  { type: '3×3', label: 'Standard', facelets: 54, moves: 20, color: 'from-brand-500 to-purple-500', glow: 'shadow-brand-500/20' },
  { type: '4×4', label: 'Master', facelets: 96, moves: 40, color: 'from-amber-500 to-orange-500', glow: 'shadow-amber-500/20' },
  { type: '5×5', label: 'Professor', facelets: 150, moves: 60, color: 'from-rose-500 to-pink-500', glow: 'shadow-rose-500/20' },
];

function AnimatedNumber({ target, suffix = '' }: { target: number | string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const isNumeric = typeof target === 'number';
  useEffect(() => {
    if (!isNumeric) return;
    let start = 0;
    const step = () => {
      start += Math.ceil((target as number) / 30);
      if (start >= (target as number)) { setDisplay(target as number); return; }
      setDisplay(start);
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, isNumeric]);
  return <>{isNumeric ? display : target}{suffix}</>;
}

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale  = useTransform(scrollYProgress, [0, 0.8], [1, 0.94]);
  const heroY      = useTransform(scrollYProgress, [0, 0.8], [0, 40]);
  const [activeCube, setActiveCube] = useState(0);

  return (
    <div className="relative">
      {/* Fixed ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-brand-600/7 rounded-full blur-[160px]" />
        <div className="absolute bottom-1/4 left-1/6 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[130px]" />
        <div className="absolute top-1/3 right-1/8 w-[350px] h-[350px] bg-cyan-500/4 rounded-full blur-[110px]" />
      </div>

      {/* ── Hero ──────────────────────────────────────────── */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass border-brand-500/25 glow-ring">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles size={14} className="text-brand-400" />
            </motion.div>
            <span className="text-sm font-semibold text-brand-300 tracking-wide">Rubik's Cube Solver & Learning Platform</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="text-center text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.04] mb-6 tracking-tight"
        >
          <span className="text-white">Master the</span>
          <br />
          <span className="gradient-text text-glow">Cube.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="text-center text-lg md:text-xl text-white/40 max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Solve 2×2 through 5×5 cubes step by step. Learn algorithms, track your progress, and become a speedcuber.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 mb-16"
        >
          <Link href="/solver" className="btn-primary text-base flex items-center justify-center gap-2 group !px-8">
            <span>Start Solving</span>
            <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link href="/learn" className="btn-secondary text-base text-center !px-8">
            Learn Methods
          </Link>
        </motion.div>

        {/* Hero 3D Cube */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="w-full max-w-sm sm:max-w-md"
        >
          <HeroCube />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="absolute bottom-8"
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ChevronDown size={20} className="text-white/20" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ── Stats Bar ──────────────────────────────────── */}
      <section className="relative z-10 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass p-6 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className={stat.color}>{stat.icon}</span>
                  <span className="text-2xl md:text-3xl font-black text-white">{stat.value}</span>
                </div>
                <span className="text-xs text-white/35 font-medium uppercase tracking-wider">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Cube Types Showcase ────────────────────────── */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-12"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm text-brand-400 font-semibold uppercase tracking-widest mb-3">
              Supported Cubes
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="section-title mb-4">
              Every Size. Every Level.
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-white/35 max-w-lg mx-auto">
              From beginner pocket cubes to the legendary professor — CUBEMINE handles them all.
            </motion.p>
          </motion.div>

          {/* Cube type cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {cubeTypes.map((ct, i) => (
              <motion.button
                key={ct.type}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setActiveCube(i)}
                className={`relative p-5 rounded-2xl border transition-all duration-400 text-left group ${
                  activeCube === i
                    ? `bg-white/[0.08] border-white/20 shadow-xl ${ct.glow}`
                    : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ct.color} flex items-center justify-center text-white text-sm font-black mb-3 shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                  {ct.type}
                </div>
                <p className="text-white font-bold text-sm mb-0.5">{ct.label} Cube</p>
                <p className="text-white/30 text-xs">{ct.facelets} facelets</p>
                {activeCube === i && (
                  <motion.div
                    layoutId="cube-indicator"
                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${ct.color} rounded-full`}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Active cube detail */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCube}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="glass p-6 flex flex-col sm:flex-row items-center gap-6"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cubeTypes[activeCube].color} flex items-center justify-center text-white text-2xl font-black shadow-xl shrink-0`}>
                {cubeTypes[activeCube].type}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-bold text-white mb-1">{cubeTypes[activeCube].type} {cubeTypes[activeCube].label} Cube</h3>
                <p className="text-white/40 text-sm mb-3">
                  {cubeTypes[activeCube].facelets} stickers · {cubeTypes[activeCube].moves} scramble moves · Full solver + learn guide
                </p>
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/[0.06] text-white/60 border border-white/[0.08]">
                    {cubeTypes[activeCube].facelets} facelets
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/[0.06] text-white/60 border border-white/[0.08]">
                    Supported ✓
                  </span>
                </div>
              </div>
              <Link href="/solver" className="btn-primary !py-2 !px-6 text-sm flex items-center gap-2 shrink-0">
                Solve Now <ArrowRight size={14} />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────── */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="text-center mb-16">
            <motion.p variants={fadeUp} custom={0} className="text-sm text-brand-400 font-semibold uppercase tracking-widest mb-3">How It Works</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="section-title mb-4">Solve in 4 Simple Steps</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-white/35 max-w-lg mx-auto">From scrambled to solved in minutes.</motion.p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {howItWorks.map((item, i) => (
              <motion.div key={i} variants={fadeUp} custom={i + 3} className="relative card group cursor-default text-center">
                <div className="text-5xl font-black text-white/[0.03] absolute top-3 right-4 select-none">{item.step}</div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center ${item.iconColor} mx-auto mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                  {item.icon}
                </div>
                <h3 className="text-base font-semibold text-white mb-1.5">{item.title}</h3>
                <p className="text-sm text-white/35 leading-relaxed">{item.desc}</p>
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-px bg-gradient-to-r from-white/10 to-transparent" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────── */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="text-center mb-16">
            <motion.p variants={fadeUp} custom={0} className="text-sm text-brand-400 font-semibold uppercase tracking-widest mb-3">Features</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="section-title mb-4">Everything You Need to Solve</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-white/35 max-w-lg mx-auto">From solving to learning to tracking — all in one beautiful platform.</motion.p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {features.map((feature, i) => (
              <motion.div key={i} variants={fadeUp} custom={i + 3} className="card-premium group cursor-default">
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-white mb-1.5">{feature.title}</h3>
                <p className="text-sm text-white/35 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────── */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="text-center mb-16">
            <motion.p variants={fadeUp} custom={0} className="text-sm text-amber-400 font-semibold uppercase tracking-widest mb-3">Testimonials</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="section-title mb-4">Loved by Cubers</motion.h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp} custom={i + 2} className="card cursor-default">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-white/30">{t.role}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, s) => (
                      <Star key={s} size={12} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-white/50 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-3xl border-gradient-animated"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-600/15 via-purple-600/12 to-pink-600/8" />
            <div className="absolute inset-0 glass opacity-80" />

            {/* Floating cube icon */}
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="absolute top-6 right-8 text-brand-500/10"
            >
              <Box size={90} />
            </motion.div>
            <motion.div
              animate={{ rotate: [360, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute bottom-6 left-8 text-purple-500/8"
            >
              <Layers size={60} />
            </motion.div>

            <div className="relative p-10 md:p-16 text-center z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 mb-6">
                <Flame size={14} className="text-brand-400" />
                <span className="text-xs font-semibold text-brand-300">Free Forever</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to <span className="gradient-text">Solve?</span>
              </h2>
              <p className="text-white/40 mb-8 max-w-md mx-auto">
                Create a free account and start your cubing journey today. No credit card needed.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/signup" className="btn-primary text-base inline-flex items-center justify-center gap-2 group !px-8">
                  <span>Get Started Free</span>
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link href="/solver" className="btn-secondary text-base text-center !px-8">
                  Try Without Account
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-8 flex items-center justify-center gap-6 flex-wrap">
                {['No Credit Card', 'Free Forever', 'Open Source'].map((badge) => (
                  <div key={badge} className="flex items-center gap-1.5 text-xs text-white/25">
                    <Check size={12} className="text-emerald-400" />
                    {badge}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
