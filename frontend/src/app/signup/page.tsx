'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, ArrowRight, Box, Check, X, Trophy, BarChart3, BookOpen } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/Toast';
import GoogleAuthButton from '@/components/GoogleAuthButton';

const passwordRules = [
  { test: (p: string) => p.length >= 6, label: 'At least 6 characters' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p: string) => /[a-z]/.test(p), label: 'One lowercase letter' },
  { test: (p: string) => /[0-9]/.test(p), label: 'One number' },
];

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const { signup, isLoading, error, clearError } = useAuthStore();
  const { showToast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    const failedRule = passwordRules.find((r) => !r.test(password));
    if (failedRule) {
      setLocalError(`Password: ${failedRule.label}`);
      return;
    }

    try {
      await signup(username, email, password);
      showToast('Account created! Welcome to CUBEMINE 🚀', 'success');
      router.push('/dashboard');
    } catch {
      showToast('Signup failed. Please try again.', 'error');
    }
  };

  const displayError = localError || error;
  const allRulesPass = passwordRules.every((r) => r.test(password));
  const passedCount = passwordRules.filter((r) => r.test(password)).length;
  const strengthPercent = password.length > 0 ? (passedCount / passwordRules.length) * 100 : 0;
  const strengthColor = strengthPercent <= 25 ? 'bg-red-500' : strengthPercent <= 50 ? 'bg-orange-500' : strengthPercent <= 75 ? 'bg-amber-500' : 'bg-emerald-500';

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
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/6 rounded-full blur-[120px]" />
          </div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-8"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-brand-400 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-brand-500/25 glow-ring">
              <Box size={44} className="text-white" />
            </div>
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-3 text-center">Join <span className="gradient-text">CUBEMINE</span></h2>
          <p className="text-white/35 text-sm text-center max-w-xs mb-10">Create your account and unlock all features.</p>
          <div className="space-y-3 w-full max-w-xs">
            {[
              { icon: <Trophy size={14} className="text-amber-400" />, text: 'Compete on global leaderboards' },
              { icon: <BarChart3 size={14} className="text-cyan-400" />, text: 'Track detailed solve statistics' },
              { icon: <BookOpen size={14} className="text-emerald-400" />, text: 'Access interactive tutorials' },
            ].map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]"
              >
                {b.icon}
                <span className="text-sm text-white/50">{b.text}</span>
              </motion.div>
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
              className="w-14 h-14 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/20 lg:hidden"
            >
              <Box size={24} className="text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-1">Create Account</h1>
            <p className="text-white/35 text-sm">Join CUBEMINE and start solving cubes</p>
          </div>

          <form onSubmit={handleSubmit} className="glass-gradient p-7 space-y-4">
            {displayError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/15 text-red-400 text-sm"
              >
                <AlertCircle size={16} className="shrink-0" />
                <span>{displayError}</span>
                <button type="button" onClick={() => { setLocalError(''); clearError(); }} className="ml-auto opacity-50 hover:opacity-100">✕</button>
              </motion.div>
            )}

            <div className="input-group">
              <label className="block text-xs text-white/40 font-medium mb-1.5 uppercase tracking-wider">Username</label>
              <div className="relative">
                <User size={16} className="input-icon" />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                  placeholder="cubeMaster" required minLength={3} maxLength={30} className="input-field pl-10" />
              </div>
            </div>

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
                  placeholder="Create a strong password" required className="input-field pl-10 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${strengthColor}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${strengthPercent}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span className={`text-[10px] font-bold ${
                      strengthPercent <= 25 ? 'text-red-400' :
                      strengthPercent <= 50 ? 'text-orange-400' :
                      strengthPercent <= 75 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {strengthPercent <= 25 ? 'Weak' : strengthPercent <= 50 ? 'Fair' : strengthPercent <= 75 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {passwordRules.map((rule, i) => {
                      const pass = rule.test(password);
                      return (
                        <div key={i} className={`flex items-center gap-1.5 text-[11px] transition-colors ${pass ? 'text-emerald-400' : 'text-white/25'}`}>
                          {pass ? <Check size={10} /> : <X size={10} />}
                          <span>{rule.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>

            <div className="input-group">
              <label className="block text-xs text-white/40 font-medium mb-1.5 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="input-icon" />
                <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password" required className="input-field pl-10 pr-10" />
                {confirmPassword && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    {password === confirmPassword ?
                      <Check size={16} className="text-emerald-400" /> :
                      <X size={16} className="text-red-400" />
                    }
                  </div>
                )}
              </div>
            </div>

            <button type="submit" disabled={isLoading || !allRulesPass} className="btn-primary w-full flex items-center justify-center gap-2 !py-3.5 !mt-6">
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Creating account...</span></>
              ) : (
                <><span>Create Account</span><ArrowRight size={16} /></>
              )}
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/[0.08]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">or</span>
              <div className="h-px flex-1 bg-white/[0.08]" />
            </div>

            <GoogleAuthButton mode="signup" />

            <div className="separator" />

            <p className="text-center text-sm text-white/30">
              Already have an account?{' '}
              <Link href="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                Login
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
