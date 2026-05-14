'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Box, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-[200px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <motion.div
          animate={{
            rotateY: [0, 360],
            rotateZ: [0, 10, -10, 0],
          }}
          transition={{
            rotateY: { duration: 8, repeat: Infinity, ease: 'linear' },
            rotateZ: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="mx-auto mb-8 w-24 h-24 glass rounded-2xl flex items-center justify-center"
          style={{ perspective: '600px' }}
        >
          <Box size={48} className="text-brand-400" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-7xl font-black text-white mb-3"
        >
          4<span className="gradient-text">0</span>4
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl font-bold text-white/60 mb-2"
        >
          Page Not Found
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-white/30 mb-8 max-w-xs mx-auto"
        >
          This page got scrambled beyond recognition. Even our solver couldn&apos;t fix it.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-2 mb-10"
        >
          {['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-400', 'bg-orange-500', 'bg-white'].map((color, i) => (
            <motion.div
              key={i}
              className={`w-6 h-6 rounded-md ${color}`}
              initial={{ opacity: 0, rotate: -180, scale: 0 }}
              animate={{
                opacity: 1,
                rotate: 0,
                scale: 1,
                y: [0, -5, 0],
              }}
              transition={{
                delay: 0.6 + i * 0.08,
                y: { delay: 1 + i * 0.1, duration: 2, repeat: Infinity, ease: 'easeInOut' },
              }}
              style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' }}
            />
          ))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link href="/" className="btn-primary flex items-center gap-2 !px-6">
            <Home size={16} />
            Go Home
          </Link>
          <button onClick={() => window.history.back()} className="btn-secondary flex items-center gap-2 !px-6">
            <ArrowLeft size={16} />
            Go Back
          </button>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-[11px] text-white/15 flex items-center gap-1.5 justify-center"
        >
          <Sparkles size={10} />
          Fun fact: A 3×3 cube has 43,252,003,274,489,856,000 possible states.
        </motion.p>
      </motion.div>
    </div>
  );
}
