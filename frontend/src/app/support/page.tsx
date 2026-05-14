'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, ChevronDown, BookOpen, Zap, Trophy, Settings,
  Box, Clock, Shield, Mail, MessageSquare, CheckCircle,
  AlertCircle, Wifi, Lock, RotateCcw, BarChart3,
} from 'lucide-react';
import Link from 'next/link';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }),
};

const categories = [
  { id: 'getting-started', label: 'Getting Started', icon: <Zap size={18} />, color: 'text-brand-400', bg: 'bg-brand-500/10' },
  { id: 'solver',          label: 'Cube Solver',     icon: <Box size={18} />, color: 'text-cyan-400',  bg: 'bg-cyan-500/10'  },
  { id: 'account',         label: 'Account',         icon: <Shield size={18} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'performance',     label: 'Performance',     icon: <BarChart3 size={18} />, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 'technical',       label: 'Technical',       icon: <Settings size={18} />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
];

const faqs: { id: string; category: string; question: string; answer: string }[] = [
  {
    id: 'what-is-cubemine',
    category: 'getting-started',
    question: 'What is CUBEMINE?',
    answer: 'CUBEMINE is a modern Rubik\'s Cube solving and learning platform. You can solve 2×2, 3×3, 4×4, and 5×5 cubes interactively using our 3D solver, learn algorithms step-by-step with video tutorials, track your progress with deep analytics, and compete on global leaderboards.'
  },
  {
    id: 'account-required',
    category: 'getting-started',
    question: 'Do I need an account to use the solver?',
    answer: 'No! The cube solver works without an account. However, creating a free account lets you save your solve history, track personal bests, view statistics, and compete on the leaderboard.'
  },
  {
    id: 'how-to-paint',
    category: 'solver',
    question: 'How do I paint my cube state?',
    answer: 'Select a color (or press keys 1-6 as shortcuts), then click stickers on the 3D cube or the flat face map panels. Each color button shows a count badge — make sure all 6 colors are balanced before solving. Use Ctrl+Z to undo, and R to reset.'
  },
  {
    id: 'cube-types',
    category: 'solver',
    question: 'Which cube types are supported?',
    answer: 'CUBEMINE supports 2×2 (24 facelets), 3×3 (54 facelets), 4×4 (96 facelets), and 5×5 (150 facelets). Select your cube type using the tab switcher at the top of the Solver page. Each type uses an appropriate solving method.'
  },
  {
    id: 'solution-accuracy',
    category: 'solver',
    question: 'Is the solution always correct?',
    answer: 'The solver uses standard beginner-method algorithms (layer-by-layer for 3×3, reduction method for 4×4 and 5×5). It assumes you\'ve correctly painted your cube state. Note: the engine uses static algorithm sequences — it does not analyze your exact scramble to produce optimal moves.'
  },
  {
    id: 'forgot-password',
    category: 'account',
    question: 'I forgot my password. What do I do?',
    answer: 'Password reset via email is on our roadmap but not yet implemented. For now, please contact us via the Contact page and we\'ll help you manually reset your account.'
  },
  {
    id: 'delete-account',
    category: 'account',
    question: 'Can I delete my account?',
    answer: 'Account deletion is available in Settings → Danger Zone. The backend endpoint is currently being finalized. If you need your data removed urgently, please reach out via the Contact page.'
  },
  {
    id: 'ao5-ao12',
    category: 'performance',
    question: 'What are Ao5, Ao12, Ao50, and Ao100?',
    answer: 'These are "Average of N" calculations used in competitive speedcubing. Ao5 drops the best and worst time from your last 5 solves and averages the remaining 3. Similarly for Ao12, Ao50, and Ao100. They give a smoothed measure of your current performance.'
  },
  {
    id: 'streak',
    category: 'performance',
    question: 'How is my solve streak calculated?',
    answer: 'Your streak counts consecutive days on which you completed at least one solve. If you skip a day, your current streak resets to 0 (but your longest streak is preserved). You can view streak data on the Statistics page.'
  },
  {
    id: 'browser-support',
    category: 'technical',
    question: 'Which browsers are supported?',
    answer: 'CUBEMINE works best on Chrome, Firefox, Safari (16+), and Edge. The 3D cube uses WebGL (Three.js), so a modern browser with hardware acceleration enabled is recommended. Mobile browsers are supported but touch controls are optimized for desktop.'
  },
  {
    id: 'redis-cache',
    category: 'technical',
    question: 'How does caching work?',
    answer: 'The backend uses a dual-layer caching system: Upstash Redis (via REST API or ioredis) as the primary cache, with node-cache as an in-memory fallback. Leaderboard and statistics responses are cached for performance. The X-Cache header in API responses shows HIT or MISS.'
  },
];

function FAQItem({ faq, isOpen, onToggle }: {
  faq: typeof faqs[0];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div layout className="border border-white/[0.07] rounded-xl overflow-hidden bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold text-white/80">{faq.question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-white/30"
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 text-sm text-white/50 leading-relaxed border-t border-white/[0.05] pt-4">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SupportPage() {
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = faqs.filter((f) => {
    const matchesCategory = activeCategory === 'all' || f.category === activeCategory;
    const matchesSearch = search.trim() === '' ||
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand-600/5 rounded-full blur-[130px]" />
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
              <HelpCircle size={28} className="text-brand-400" />
            </div>
          </div>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-400 mb-2">Help Center</p>
          <h1 className="text-4xl font-black text-white mb-3">Support</h1>
          <p className="text-white/40 max-w-lg mx-auto">
            Find answers to common questions, or reach out to our team for help.
          </p>
        </motion.div>

        {/* Quick cards */}
        <motion.div
          initial="hidden" animate="visible"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
        >
          {[
            { icon: <BookOpen size={20} className="text-emerald-400" />, title: 'Documentation', desc: 'Browse guides and tutorials', href: '/learn', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
            { icon: <MessageSquare size={20} className="text-brand-400" />, title: 'Contact Us', desc: 'Send us a message directly', href: '/contact', bg: 'bg-brand-500/10', border: 'border-brand-500/20' },
            { icon: <Trophy size={20} className="text-amber-400" />, title: 'Leaderboard', desc: 'Check your ranking', href: '/leaderboard', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
          ].map((card, i) => (
            <motion.div key={card.title} variants={fadeUp} custom={i}>
              <Link href={card.href} className={`block p-5 rounded-2xl border ${card.border} ${card.bg} hover:bg-white/[0.06] transition-all group`}>
                <div className="mb-3">{card.icon}</div>
                <p className="font-semibold text-white text-sm mb-0.5 group-hover:text-brand-300 transition-colors">{card.title}</p>
                <p className="text-xs text-white/40">{card.desc}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
          <div className="input-group">
            <HelpCircle size={16} className="input-icon" />
            <input
              type="text"
              placeholder="Search frequently asked questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </motion.div>

        {/* Category tabs */}
        {search === '' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="flex gap-2 flex-wrap mb-6">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeCategory === cat.id
                    ? `${cat.bg} ${cat.color} border border-current/20`
                    : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/60'
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </motion.div>
        )}

        {/* FAQ list */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-3 mb-12">
          {filtered.length === 0 ? (
            <div className="text-center py-12 glass">
              <AlertCircle size={28} className="mx-auto mb-3 text-white/20" />
              <p className="text-white/40">No results found for &ldquo;{search}&rdquo;</p>
              <button onClick={() => setSearch('')} className="mt-3 text-xs text-brand-400 hover:underline">Clear search</button>
            </div>
          ) : (
            filtered.map((faq) => (
              <FAQItem
                key={faq.id}
                faq={faq}
                isOpen={openFaq === faq.id}
                onToggle={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
              />
            ))
          )}
        </motion.div>

        {/* Still need help banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-gradient p-8 text-center rounded-2xl"
        >
          <Mail size={28} className="mx-auto mb-3 text-brand-400" />
          <h2 className="text-xl font-bold text-white mb-2">Still Need Help?</h2>
          <p className="text-white/40 text-sm mb-5 max-w-md mx-auto">
            Can&apos;t find what you&apos;re looking for? Reach out to us and we&apos;ll get back to you as soon as possible.
          </p>
          <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
            <MessageSquare size={16} /> Contact Us
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
