'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Box, Sparkles, Shield, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/Toast';
import GoogleAuthButton from '@/components/GoogleAuthButton';

const cubeColors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-white', 'bg-yellow-400', 'bg-orange-500', 'bg-blue-500', 'bg-red-500', 'bg-white'];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();
  const { showToast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      showToast('Welcome back! 🎉', 'success');
      router.push('/dashboard');
    } catch {
      showToast('Login failed. Check your credentials.', 'error');
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="hidden lg:flex flex-col items-center justify-center relative"
        >
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-500/8 rounded-full blur-[120px]" />
          </div>
          <motion.div
            animate={{ y: [0, -12, 0], rotateZ: [0, 2, -2, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-8"
          >
            <div className="grid grid-cols-3 gap-2 p-6 glass-gradient rounded-2xl">
              {cubeColors.map((color, i) => (
                <motion.div
                  key={i}
                  className={`w-14 h-14 rounded-xl ${color}`}
                  initial={{ opacity: 0, scale: 0, rotate: -180 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3 + i * 0.06, type: 'spring', stiffness: 300 }}
                  style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.15)' }}
                />
              ))}
            </div>
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-3 text-center">Welcome to <span className="gradient-text">CUBEMINE</span></h2>
          <p className="text-white/35 text-sm text-center max-w-xs mb-8">Solve cubes, track progress, and compete on the leaderboard.</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { icon: <Zap size={12} />, label: '3D Solver' },
              { icon: <Shield size={12} />, label: 'Secure' },
              { icon: <Sparkles size={12} />, label: 'Analytics' },
            ].map((f) => (
              <span key={f.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11px] text-white/40 font-medium">
                {f.icon} {f.label}
              </span>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="w-14 h-14 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/20"
            >
              <Box size={24} className="text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-1">Welcome Back</h1>
            <p className="text-white/35 text-sm">Log in to continue your cubing journey</p>
          </div>

          <form onSubmit={handleSubmit} className="glass-gradient p-7 space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/15 text-red-400 text-sm"
              >
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
                <button type="button" onClick={clearError} className="ml-auto opacity-50 hover:opacity-100">✕</button>
              </motion.div>
            )}

            <div className="input-group">
              <label className="block text-xs text-white/40 font-medium mb-1.5 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail size={16} className="input-icon" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required className="input-field pl-10" />
              </div>
            </div>

            <div className="input-group">
              <label className="block text-xs text-white/40 font-medium mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={16} className="input-icon" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required className="input-field pl-10 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 !py-3.5">
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Logging in...</span></>
              ) : (
                <><span>Login</span><ArrowRight size={16} /></>
              )}
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/[0.08]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">or</span>
              <div className="h-px flex-1 bg-white/[0.08]" />
            </div>

            <GoogleAuthButton mode="login" />

            <div className="separator" />

            <p className="text-center text-sm text-white/30">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
