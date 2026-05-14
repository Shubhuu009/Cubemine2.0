'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, ThumbsUp, MessageSquare, CheckCircle, AlertCircle,
  Award, Sparkles, TrendingUp, User, Send,
} from 'lucide-react';

// Static reviews data (would be from DB in production)
const existingReviews = [
  {
    id: 1, name: 'Alex Chen', role: 'Speedcuber', rating: 5, date: '2026-05-10',
    text: 'CUBEMINE is hands-down the best cube solver I\'ve used. The 3D interface is stunning and the step-by-step explanations are crystal clear. Helped me drop my 3×3 PB by 8 seconds!',
    cube: '3×3', helpful: 24, verified: true,
  },
  {
    id: 2, name: 'Priya Mehta', role: 'Beginner', rating: 5, date: '2026-05-08',
    text: 'I never thought I could solve a Rubik\'s cube. The beginner guide on this site is so well structured — I solved my first 3×3 in one afternoon! The Learn page with video tutorials is perfect.',
    cube: '3×3', helpful: 18, verified: true,
  },
  {
    id: 3, name: 'Jordan Kim', role: 'College Student', rating: 5, date: '2026-05-05',
    text: 'The analytics are incredibly detailed. Ao5/Ao12 tracking, heatmap, time trends — it\'s like having a personal coach. The leaderboard feature keeps me motivated every day.',
    cube: 'All', helpful: 15, verified: true,
  },
  {
    id: 4, name: 'Sam Patel', role: '4×4 Enthusiast', rating: 4, date: '2026-05-03',
    text: 'Great platform! The 4×4 solver and learning guide are really solid. The 3D cube visualization makes it so easy to follow along. Would love a dark/light theme toggle.',
    cube: '4×4', helpful: 11, verified: false,
  },
  {
    id: 5, name: 'Maria Santos', role: 'Speed-Cubing Club', rating: 5, date: '2026-04-28',
    text: 'Recommended this to my entire cubing club. Everyone loves the clean interface and how fast the solver is. The timer with keyboard shortcuts is exactly what we needed for practice sessions.',
    cube: '2×2', helpful: 9, verified: true,
  },
  {
    id: 6, name: 'Liam O\'Brien', role: 'Dad & Hobbyist', rating: 4, date: '2026-04-22',
    text: 'Bought my kid a 5×5 cube and found this site while looking for solutions. The 5×5 guide is surprisingly clear even for non-cubers like me. My kid is now obsessed!',
    cube: '5×5', helpful: 7, verified: false,
  },
];

const cubeFilters = ['All', '2×2', '3×3', '4×4', '5×5'];

const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

function StarRating({ rating, interactive = false, onRate }: {
  rating: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(s)}
          onMouseEnter={() => interactive && setHovered(s)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`transition-transform ${interactive ? 'hover:scale-125 cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            size={interactive ? 24 : 14}
            className={`transition-colors ${
              s <= (hovered || rating)
                ? 'text-amber-400 fill-amber-400'
                : 'text-white/20'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review, i }: { review: typeof existingReviews[0]; i: number }) {
  const [liked, setLiked] = useState(false);
  const [helpCount, setHelpCount] = useState(review.helpful);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.07 }}
      className="card group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
            {review.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-white">{review.name}</p>
              {review.verified && (
                <CheckCircle size={12} className="text-emerald-400" />
              )}
            </div>
            <p className="text-xs text-white/30">{review.role}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <StarRating rating={review.rating} />
          <p className="text-[10px] text-white/20 mt-1">{review.date}</p>
        </div>
      </div>

      {/* Badge */}
      <div className="mb-3">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-bold uppercase tracking-wider">
          {review.cube} Cube
        </span>
      </div>

      {/* Text */}
      <p className="text-sm text-white/50 leading-relaxed mb-4">&ldquo;{review.text}&rdquo;</p>

      {/* Helpful */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { if (!liked) { setLiked(true); setHelpCount((n) => n + 1); } }}
          className={`flex items-center gap-1.5 text-xs transition-all ${
            liked ? 'text-brand-400' : 'text-white/25 hover:text-white/50'
          }`}
        >
          <ThumbsUp size={12} className={liked ? 'fill-brand-400' : ''} />
          Helpful ({helpCount})
        </button>
        {review.verified && (
          <span className="text-[10px] text-emerald-400/60 flex items-center gap-1">
            <CheckCircle size={10} /> Verified User
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function ReviewsPage() {
  const [filter, setFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', rating: 0, cube: '', text: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const filtered = existingReviews.filter((r) => filter === 'All' || r.cube === filter || r.cube === 'All');
  const avgRating = (existingReviews.reduce((s, r) => s + r.rating, 0) / existingReviews.length).toFixed(1);
  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    r, count: existingReviews.filter((e) => e.rating === r).length,
  }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())    e.name = 'Name required';
    if (form.rating === 0)    e.rating = 'Please select a rating';
    if (!form.cube)           e.cube = 'Select a cube type';
    if (form.text.trim().length < 20) e.text = 'Review must be at least 20 characters';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setSending(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSending(false);
    setSubmitted(true);
  };

  const update = (k: string, v: string | number) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((er) => { const n = { ...er }; delete n[k]; return n; });
  };

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-amber-600/4 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/4 right-1/6 w-[300px] h-[300px] bg-brand-600/4 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Star size={28} className="text-amber-400 fill-amber-400/30" />
            </div>
          </div>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-400 mb-2">Community</p>
          <h1 className="text-4xl font-black text-white mb-3">Reviews</h1>
          <p className="text-white/40 max-w-lg mx-auto">
            See what the CUBEMINE community is saying. Share your own experience!
          </p>
        </motion.div>

        {/* Rating overview */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {/* Big rating */}
          <div className="text-center sm:border-r border-white/[0.06]">
            <p className="text-7xl font-black text-white mb-2">{avgRating}</p>
            <StarRating rating={Math.round(parseFloat(avgRating))} />
            <p className="text-xs text-white/30 mt-2">{existingReviews.length} reviews</p>
          </div>

          {/* Rating breakdown */}
          <div className="space-y-2">
            {ratingCounts.map(({ r, count }) => (
              <div key={r} className="flex items-center gap-3">
                <span className="text-xs text-white/40 w-3 font-mono">{r}</span>
                <Star size={11} className="text-amber-400 fill-amber-400 shrink-0" />
                <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / existingReviews.length) * 100}%` }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                  />
                </div>
                <span className="text-xs text-white/25 w-4 font-mono">{count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between gap-4 flex-wrap mb-6"
        >
          {/* Filter */}
          <div className="flex gap-1.5 flex-wrap">
            {cubeFilters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === f
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                    : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/60'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary !py-2 !px-5 text-sm flex items-center gap-2"
          >
            <MessageSquare size={14} />
            {showForm ? 'Hide Form' : 'Write a Review'}
          </button>
        </motion.div>

        {/* Review form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              {submitted ? (
                <div className="glass p-8 text-center">
                  <CheckCircle size={36} className="mx-auto mb-3 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white mb-1">Thanks for your review!</h3>
                  <p className="text-white/40 text-sm">It will be visible after moderation (usually within 24h).</p>
                  <button onClick={() => { setSubmitted(false); setForm({ name: '', role: '', rating: 0, cube: '', text: '' }); }} className="mt-4 btn-secondary !py-2 !px-5 text-sm">
                    Write Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="glass p-6 space-y-5">
                  <p className="text-sm font-semibold text-white/60 uppercase tracking-wider">Write a Review</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-white/40 mb-1.5">Your Name *</label>
                      <div className="input-group">
                        <User size={15} className="input-icon" />
                        <input
                          type="text" placeholder="Alex Chen"
                          value={form.name} onChange={(e) => update('name', e.target.value)}
                          className={`input-field pl-10 ${errors.name ? 'border-red-500/50' : ''}`}
                        />
                      </div>
                      {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 mb-1.5">Your Role</label>
                      <input
                        type="text" placeholder="Speedcuber, Beginner..."
                        value={form.role} onChange={(e) => update('role', e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-white/40 mb-1.5">Your Rating *</label>
                      <div className="flex items-center gap-3">
                        <StarRating
                          rating={form.rating}
                          interactive
                          onRate={(r) => update('rating', r)}
                        />
                        {form.rating > 0 && (
                          <span className="text-xs text-amber-400 font-semibold">{ratingLabels[form.rating]}</span>
                        )}
                      </div>
                      {errors.rating && <p className="text-xs text-red-400 mt-1">{errors.rating}</p>}
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 mb-1.5">Cube Type *</label>
                      <select
                        value={form.cube} onChange={(e) => update('cube', e.target.value)}
                        className={`input-field ${errors.cube ? 'border-red-500/50' : ''}`}
                        style={{ WebkitAppearance: 'none' }}
                      >
                        <option value="">Select cube type...</option>
                        {['2×2', '3×3', '4×4', '5×5', 'All / General'].map((c) => <option key={c}>{c}</option>)}
                      </select>
                      {errors.cube && <p className="text-xs text-red-400 mt-1">{errors.cube}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">
                      Your Review * <span className="text-white/20">{form.text.length} chars</span>
                    </label>
                    <textarea
                      rows={4} placeholder="Share your experience with CUBEMINE..."
                      value={form.text} onChange={(e) => update('text', e.target.value)}
                      className={`input-field resize-none ${errors.text ? 'border-red-500/50' : ''}`}
                    />
                    {errors.text && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.text}</p>}
                  </div>

                  <button type="submit" disabled={sending} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                    {sending ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Submitting...</> : <><Send size={15} />Submit Review</>}
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((review, i) => (
            <ReviewCard key={review.id} review={review} i={i} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 glass py-16 text-center">
              <Sparkles size={28} className="mx-auto mb-3 text-white/15" />
              <p className="text-white/40">No reviews for this cube type yet. Be the first!</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-center"
        >
          <p className="text-xs text-white/20">
            All reviews are moderated. Spam and inappropriate content will be removed.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
