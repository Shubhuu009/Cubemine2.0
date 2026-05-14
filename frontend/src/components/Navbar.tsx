'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Box, LogOut, Settings, ChevronRight, Trophy, BarChart3, LayoutDashboard, BookOpen, Cpu } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/solver', label: 'Solver' },
  { href: '/learn', label: 'Learn' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/about', label: 'About' },
  { href: '/support', label: 'Support' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setIsOpen(false), [pathname]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-surface-950/75 backdrop-blur-2xl border-b border-white/[0.05] shadow-lg shadow-black/15'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <motion.div
              whileHover={{ rotate: 20, scale: 1.12 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              className="w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/25"
            >
              <Box size={18} className="text-white" />
            </motion.div>
            <span className="text-lg font-bold gradient-text tracking-tight">CUBEMINE</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg"
              >
                <span className={`transition-colors ${
                  pathname === link.href
                    ? 'text-white'
                    : 'text-white/45 hover:text-white/80'
                }`}>
                  {link.label}
                </span>
                {pathname === link.href && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-brand-400 to-brand-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop user controls */}
          <div className="hidden md:flex items-center gap-1.5">
            {user ? (
              <>
                <Link
                  href="/statistics"
                  className={`p-2 rounded-xl transition-all ${
                    pathname === '/statistics'
                      ? 'text-brand-400 bg-brand-500/10'
                      : 'text-white/30 hover:text-white/70 hover:bg-white/[0.05]'
                  }`}
                  title="Statistics"
                >
                  <BarChart3 size={16} />
                </Link>
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    pathname === '/dashboard'
                      ? 'text-brand-400 bg-brand-500/10'
                      : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.username}</span>
                </Link>
                <Link
                  href="/settings"
                  className={`p-2 rounded-xl transition-all ${
                    pathname === '/settings'
                      ? 'text-brand-400 bg-brand-500/10'
                      : 'text-white/30 hover:text-white/70 hover:bg-white/[0.05]'
                  }`}
                  title="Settings"
                >
                  <Settings size={16} />
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn-ghost text-sm">Login</Link>
                <Link href="/signup" className="btn-primary !py-2 !px-5 text-sm flex items-center gap-1">
                  <span>Sign Up</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.05] transition-all"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isOpen ? 'x' : 'menu'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="md:hidden bg-surface-900/96 backdrop-blur-2xl border-b border-white/[0.05] overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link, i) => (
                <motion.div key={link.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link
                    href={link.href}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      pathname === link.href
                        ? 'text-brand-400 bg-brand-500/10 border border-brand-500/15'
                        : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <div className="separator my-3" />

              {user ? (
                <>
                  <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/[0.05]">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-xs font-bold text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    Dashboard
                  </Link>
                  <Link href="/statistics" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/[0.05]">
                    <BarChart3 size={16} /> Statistics
                  </Link>
                  <Link href="/leaderboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/[0.05]">
                    <Trophy size={16} /> Leaderboard
                  </Link>
                  <Link href="/learn" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/[0.05]">
                    <BookOpen size={16} /> Learn
                  </Link>
                  <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/[0.05]">
                    <Settings size={16} /> Settings
                  </Link>
                  <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all">
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-1">
                  <Link href="/login" className="btn-secondary !py-2.5 text-sm flex-1 text-center">Login</Link>
                  <Link href="/signup" className="btn-primary !py-2.5 text-sm flex-1 text-center">Sign Up</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
