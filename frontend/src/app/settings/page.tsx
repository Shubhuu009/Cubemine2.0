'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, User, Palette, LogOut, Download, Trash2, Shield,
  Clock, Hash, AlertTriangle, Check, Keyboard, Bell, BellOff,
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

function SettingsContent() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { showToast } = useToast();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [keyboardShortcuts, setKeyboardShortcuts] = useState(true);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
    router.push('/');
  };

  const handleExportData = () => {
    const exportData = {
      username: user?.username,
      email: user?.email,
      totalSolves: user?.totalSolves,
      bestTime2x2: user?.bestTime2x2,
      bestTime3x3: user?.bestTime3x3,
      memberSince: user?.createdAt,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cubemine-${user?.username}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully', 'success');
  };

  const formatTime = (ms: number | null | undefined) => {
    if (!ms) return 'No record';
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Settings size={28} className="text-brand-400" />
            Settings
          </h1>
          <p className="text-sm text-white/30 mt-1">Manage your account, preferences, and data.</p>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-5">
              <User size={20} className="text-brand-400" />
              <h2 className="text-lg font-semibold text-white">Account</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-brand-500/20">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{user?.username}</p>
                  <p className="text-sm text-white/40">{user?.email}</p>
                  <p className="text-xs text-white/20 mt-1">
                    Member since {user ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '...'}
                  </p>
                </div>
              </div>

              <div className="separator" />
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.03] text-center">
                  <Hash size={14} className="text-brand-400 mx-auto mb-1" />
                  <p className="text-lg font-bold font-mono text-white">{user?.totalSolves || 0}</p>
                  <p className="text-[10px] text-white/30">Total Solves</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] text-center">
                  <Clock size={14} className="text-emerald-400 mx-auto mb-1" />
                  <p className="text-lg font-bold font-mono text-white">{formatTime(user?.bestTime2x2)}</p>
                  <p className="text-[10px] text-white/30">Best 2×2</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] text-center">
                  <Clock size={14} className="text-purple-400 mx-auto mb-1" />
                  <p className="text-lg font-bold font-mono text-white">{formatTime(user?.bestTime3x3)}</p>
                  <p className="text-[10px] text-white/30">Best 3×3</p>
                </div>
              </div>

              <p className="text-xs text-white/30">Profile editing will be available in a future update.</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-5">
              <Palette size={20} className="text-purple-400" />
              <h2 className="text-lg font-semibold text-white">Appearance</h2>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  theme === 'dark'
                    ? 'border-brand-500 bg-brand-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="w-full h-8 rounded-lg bg-surface-900 border border-white/10 mb-2" />
                <span className="text-sm text-white/70 flex items-center gap-2 justify-center">
                  {theme === 'dark' && <Check size={12} className="text-brand-400" />}
                  Dark
                </span>
              </button>
              <button
                onClick={() => { setTheme('light'); showToast('Light theme coming soon!', 'info'); }}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  theme === 'light'
                    ? 'border-brand-500 bg-brand-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="w-full h-8 rounded-lg bg-gray-200 border border-gray-300 mb-2" />
                <span className="text-sm text-white/70">Light</span>
              </button>
            </div>
            <p className="text-xs text-white/30 mt-3">Light theme coming soon. Currently dark mode only.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-5">
              <Shield size={20} className="text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">Preferences</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  {notifications ? <Bell size={16} className="text-white/50" /> : <BellOff size={16} className="text-white/30" />}
                  <div>
                    <p className="text-sm font-medium text-white/70">Toast Notifications</p>
                    <p className="text-[10px] text-white/30">Show feedback popups for actions</p>
                  </div>
                </div>
                <button
                  onClick={() => { setNotifications(!notifications); showToast(notifications ? 'Notifications muted' : 'Notifications enabled', 'info'); }}
                  className={`w-12 h-7 rounded-full transition-all duration-300 flex items-center px-1 ${
                    notifications ? 'bg-brand-500' : 'bg-white/10'
                  }`}
                >
                  <motion.div
                    className="w-5 h-5 rounded-full bg-white shadow-sm"
                    animate={{ x: notifications ? 20 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <Keyboard size={16} className="text-white/50" />
                  <div>
                    <p className="text-sm font-medium text-white/70">Keyboard Shortcuts</p>
                    <p className="text-[10px] text-white/30">Enable solver keyboard shortcuts</p>
                  </div>
                </div>
                <button
                  onClick={() => { setKeyboardShortcuts(!keyboardShortcuts); showToast(keyboardShortcuts ? 'Shortcuts disabled' : 'Shortcuts enabled', 'info'); }}
                  className={`w-12 h-7 rounded-full transition-all duration-300 flex items-center px-1 ${
                    keyboardShortcuts ? 'bg-brand-500' : 'bg-white/10'
                  }`}
                >
                  <motion.div
                    className="w-5 h-5 rounded-full bg-white shadow-sm"
                    animate={{ x: keyboardShortcuts ? 20 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-5">
              <Download size={20} className="text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">Data</h2>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleExportData}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-all text-left group"
              >
                <Download size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-sm font-medium text-white/70">Export Data</p>
                  <p className="text-[10px] text-white/30">Download your profile and stats as JSON</p>
                </div>
              </button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="border border-red-500/20 rounded-2xl p-6 bg-red-500/[0.02]"
          >
            <div className="flex items-center gap-3 mb-5">
              <AlertTriangle size={20} className="text-red-400" />
              <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium hover:bg-red-500/20 transition-all"
              >
                <LogOut size={18} />
                Logout
              </button>
              {showDeleteConfirm ? (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-300 mb-3">Are you sure? This action cannot be undone.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setShowDeleteConfirm(false); showToast('Account deletion not available yet', 'info'); }}
                      className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition"
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-2 rounded-lg bg-white/[0.04] text-white/50 text-sm font-medium hover:bg-white/[0.08] transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-transparent border border-red-500/15 text-red-400/60 font-medium hover:bg-red-500/10 hover:text-red-400 transition-all"
                >
                  <Trash2 size={16} />
                  Delete Account
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}
