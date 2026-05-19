'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, User, Palette, LogOut, Download, Trash2,
  Clock, Hash, AlertTriangle, Check, Keyboard, Bell, BellOff,
  Edit3, Save, X, Sun, Moon, Timer,
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { userAPI } from '@/services/api';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import { UserPreferences } from '@/types';

function SettingsContent() {
  const { user, logout, updateUser } = useAuthStore();
  const router = useRouter();
  const { showToast } = useToast();

  // Profile editing
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newAvatar, setNewAvatar] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Preferences (local state, synced to backend)
  const [prefs, setPrefs] = useState<UserPreferences>({
    theme: 'dark',
    showTimer: true,
    enableKeyboardShortcuts: true,
    enableNotifications: true,
  });
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Danger zone
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user?.preferences) setPrefs(user.preferences);
    if (user?.username) setNewUsername(user.username);
    if (user?.avatar) setNewAvatar(user.avatar || '');
  }, [user]);

  // ── Profile ──────────────────────────────────────────────

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const payload: any = {};
      if (newUsername !== user?.username) payload.username = newUsername;
      if (newAvatar !== (user?.avatar || '')) payload.avatar = newAvatar || null;
      if (Object.keys(payload).length === 0) { setEditingUsername(false); return; }

      const res = await userAPI.updateProfile(payload);
      updateUser(res.data);
      setEditingUsername(false);
      showToast('Profile updated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Preferences ───────────────────────────────────────────

  const handlePrefChange = async (key: keyof UserPreferences, value: any) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    setSavingPrefs(true);
    try {
      const res = await userAPI.updatePreferences({ [key]: value });
      updateUser({ preferences: res.data });
      // Apply theme immediately
      if (key === 'theme') {
        document.documentElement.setAttribute('data-theme', value);
        document.documentElement.className = value;
      }
    } catch {
      setPrefs(prefs); // rollback
      showToast('Failed to save preference', 'error');
    } finally {
      setSavingPrefs(false);
    }
  };

  // ── Delete account ────────────────────────────────────────

  const handleDeleteAccount = async () => {
    if (deleteInput !== user?.username) {
      showToast('Username does not match', 'error'); return;
    }
    setDeleting(true);
    try {
      await userAPI.deleteAccount();
      logout();
      showToast('Account deleted', 'info');
      router.push('/');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete account', 'error');
      setDeleting(false);
    }
  };

  const handleLogout = () => { logout(); showToast('Logged out', 'info'); router.push('/'); };

  const handleExportData = () => {
    const blob = new Blob([JSON.stringify({ username: user?.username, email: user?.email, totalSolves: user?.totalSolves, bestTime2x2: user?.bestTime2x2, bestTime3x3: user?.bestTime3x3, bestTime4x4: user?.bestTime4x4, bestTime5x5: user?.bestTime5x5, memberSince: user?.createdAt, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `cubemine-${user?.username}-export.json`; a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported', 'success');
  };

  const fmt = (ms: number | null | undefined) => ms ? `${(ms / 1000).toFixed(2)}s` : '–';

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

          {/* ── Account / Profile ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <User size={20} className="text-brand-400" />
                <h2 className="text-lg font-semibold text-white">Profile</h2>
              </div>
              {!editingUsername && (
                <button onClick={() => setEditingUsername(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-400 bg-brand-500/10 border border-brand-500/20 rounded-lg hover:bg-brand-500/20 transition">
                  <Edit3 size={12} /> Edit
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 mb-5">
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500/30" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-brand-500/20">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-lg font-bold text-white">{user?.username}</p>
                <p className="text-sm text-white/40">{user?.email}</p>
                <p className="text-xs text-white/20 mt-0.5">
                  Member since {user ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '...'}
                </p>
              </div>
            </div>

            <AnimatePresence>
              {editingUsername && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="space-y-3 pt-2 pb-4">
                    <div>
                      <label className="block text-xs text-white/40 font-semibold mb-1">Username</label>
                      <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="input-field" placeholder="New username" maxLength={30} />
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 font-semibold mb-1">Avatar URL <span className="text-white/20 font-normal">(optional)</span></label>
                      <input type="url" value={newAvatar} onChange={(e) => setNewAvatar(e.target.value)} className="input-field" placeholder="https://example.com/avatar.png" />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={handleSaveProfile} disabled={savingProfile} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition disabled:opacity-60">
                        {savingProfile ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
                        Save Changes
                      </button>
                      <button onClick={() => { setEditingUsername(false); setNewUsername(user?.username || ''); setNewAvatar(user?.avatar || ''); }} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-white/5 text-white/60 hover:bg-white/10 transition">
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                  <div className="separator mb-4" />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Total Solves', value: user?.totalSolves || 0, icon: <Hash size={12} className="text-brand-400" /> },
                { label: 'Best 2×2', value: fmt(user?.bestTime2x2), icon: <Clock size={12} className="text-emerald-400" /> },
                { label: 'Best 3×3', value: fmt(user?.bestTime3x3), icon: <Clock size={12} className="text-purple-400" /> },
                { label: 'Best 4×4', value: fmt(user?.bestTime4x4), icon: <Clock size={12} className="text-amber-400" /> },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-xl bg-white/[0.03] text-center">
                  <div className="flex justify-center mb-1">{s.icon}</div>
                  <p className="text-sm font-bold font-mono text-white">{s.value}</p>
                  <p className="text-[10px] text-white/30">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Appearance ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card">
            <div className="flex items-center gap-3 mb-5">
              <Palette size={20} className="text-purple-400" />
              <h2 className="text-lg font-semibold text-white">Appearance</h2>
            </div>
            <div className="flex gap-3">
              {(['dark', 'light'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => handlePrefChange('theme', t)}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${prefs.theme === t ? 'border-brand-500 bg-brand-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                >
                  <div className={`w-full h-8 rounded-lg border mb-2 ${t === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-gray-100 border-gray-300'}`} />
                  <span className="text-sm text-white/70 flex items-center gap-2 justify-center">
                    {t === 'dark' ? <Moon size={12} className="text-brand-400" /> : <Sun size={12} className="text-amber-400" />}
                    {prefs.theme === t && <Check size={12} className="text-brand-400" />}
                    {t === 'dark' ? 'Dark' : 'Light'}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── Preferences ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <Settings size={20} className="text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">Preferences</h2>
              </div>
              {savingPrefs && <span className="text-xs text-white/30 animate-pulse">Saving...</span>}
            </div>
            <div className="space-y-3">
              {[
                { key: 'enableNotifications' as const, label: 'Toast Notifications', desc: 'Show feedback popups for actions', icon: prefs.enableNotifications ? <Bell size={16} className="text-white/50" /> : <BellOff size={16} className="text-white/30" /> },
                { key: 'enableKeyboardShortcuts' as const, label: 'Keyboard Shortcuts', desc: 'Enable solver keyboard controls (1–6, arrows, space, Ctrl+Z)', icon: <Keyboard size={16} className="text-white/50" /> },
                { key: 'showTimer' as const, label: 'Show Solve Timer', desc: 'Display centisecond timer in the solver', icon: <Timer size={16} className="text-white/50" /> },
              ].map(({ key, label, desc, icon }) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    {icon}
                    <div>
                      <p className="text-sm font-medium text-white/70">{label}</p>
                      <p className="text-[10px] text-white/30">{desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePrefChange(key, !prefs[key])}
                    className={`w-12 h-7 rounded-full transition-all duration-300 flex items-center px-1 ${prefs[key] ? 'bg-brand-500' : 'bg-white/10'}`}
                  >
                    <motion.div
                      className="w-5 h-5 rounded-full bg-white shadow-sm"
                      animate={{ x: prefs[key] ? 20 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Data ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card">
            <div className="flex items-center gap-3 mb-5">
              <Download size={20} className="text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">Data</h2>
            </div>
            <button onClick={handleExportData} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-all text-left group">
              <Download size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-sm font-medium text-white/70">Export Data</p>
                <p className="text-[10px] text-white/30">Download your profile and stats as JSON</p>
              </div>
            </button>
          </motion.div>

          {/* ── Danger Zone ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="border border-red-500/20 rounded-2xl p-6 bg-red-500/[0.02]">
            <div className="flex items-center gap-3 mb-5">
              <AlertTriangle size={20} className="text-red-400" />
              <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
            </div>
            <div className="space-y-3">
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium hover:bg-red-500/20 transition-all">
                <LogOut size={18} /> Logout
              </button>

              <AnimatePresence>
                {showDeleteConfirm ? (
                  <motion.div key="confirm" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 space-y-3">
                    <p className="text-sm text-red-300 font-medium">This will permanently delete your account and all solve history. This cannot be undone.</p>
                    <p className="text-xs text-white/40">Type your username <span className="font-mono text-white/60">{user?.username}</span> to confirm:</p>
                    <input
                      type="text"
                      value={deleteInput}
                      onChange={(e) => setDeleteInput(e.target.value)}
                      placeholder={user?.username}
                      className="input-field text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleting || deleteInput !== user?.username}
                        className="flex-1 py-2 rounded-lg bg-red-500/25 text-red-400 text-sm font-semibold hover:bg-red-500/40 transition disabled:opacity-40 flex items-center justify-center gap-1.5"
                      >
                        {deleting ? <div className="w-4 h-4 border-2 border-red-400/40 border-t-red-400 rounded-full animate-spin" /> : <Trash2 size={14} />}
                        Delete My Account
                      </button>
                      <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }} className="flex-1 py-2 rounded-lg bg-white/[0.04] text-white/50 text-sm font-medium hover:bg-white/[0.08] transition">
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button key="btn" onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-transparent border border-red-500/15 text-red-400/60 font-medium hover:bg-red-500/10 hover:text-red-400 transition-all">
                    <Trash2 size={16} /> Delete Account
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return <ProtectedRoute><SettingsContent /></ProtectedRoute>;
}
