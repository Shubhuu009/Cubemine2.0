'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Box,
  Instagram,
  Github,
  Briefcase,
  Mail,
  Twitter,
  ExternalLink,
  Heart,
  GraduationCap,
  Code2,
  Sparkles,
} from 'lucide-react';

const socialLinks = [
  {
    label: 'Instagram',
    value: '@your_username',
    href: 'https://instagram.com/your_username',
    icon: <Instagram size={20} />,
    color: 'from-pink-500 to-rose-500',
  },
  {
    label: 'GitHub',
    value: 'github.com/your_username',
    href: 'https://github.com/your_username',
    icon: <Github size={20} />,
    color: 'from-slate-400 to-white',
  },
  {
    label: 'Portfolio',
    value: 'your-portfolio.com',
    href: 'https://your-portfolio.com',
    icon: <Briefcase size={20} />,
    color: 'from-cyan-500 to-blue-500',
  },
  {
    label: 'Gmail',
    value: 'your.email@gmail.com',
    href: 'mailto:your.email@gmail.com',
    icon: <Mail size={20} />,
    color: 'from-red-500 to-amber-500',
  },
  {
    label: 'X',
    value: 'x.com/your_username',
    href: 'https://x.com/your_username',
    icon: <Twitter size={20} />,
    color: 'from-zinc-300 to-zinc-500',
  },
];

const highlights = [
  { icon: <GraduationCap size={18} />, title: 'College Project', text: 'Built as a practical full-stack project with real authentication, solving tools, and dashboards.' },
  { icon: <Code2 size={18} />, title: 'Full Stack', text: 'Next.js powers the interface while Express handles APIs, security middleware, and app data.' },
  { icon: <Sparkles size={18} />, title: 'Cubing Focused', text: 'Designed for learning, solving, timing, reviewing progress, and making cube practice easier.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen px-4 py-12 sm:px-6">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-brand-600/6 blur-[140px]" />
        <div className="absolute bottom-1/4 left-1/6 h-[320px] w-[320px] rounded-full bg-cyan-500/5 blur-[110px]" />
      </div>

      <div className="mx-auto max-w-6xl">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]"
        >
          <div className="glass-premium overflow-hidden p-7 sm:p-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-1.5">
              <Heart size={14} className="text-brand-300" />
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-300">About Us</span>
            </div>

            <h1 className="mb-4 text-4xl font-black leading-tight text-white sm:text-5xl">
              Meet the maker behind <span className="gradient-text">CUBEMINE</span>
            </h1>
            <p className="mb-7 max-w-2xl text-base leading-relaxed text-white/45">
              CUBEMINE is a Rubik's Cube solving and learning platform made for a college project. It brings together a clean 3D-style experience, step-by-step cube tools, account features, progress tracking, and community pages in one place.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/solver" className="btn-primary inline-flex items-center justify-center gap-2 text-sm">
                <Box size={16} />
                <span>Try the Solver</span>
              </Link>
              <Link href="/contact" className="btn-secondary inline-flex items-center justify-center gap-2 text-sm">
                <Mail size={16} />
                <span>Contact Me</span>
              </Link>
            </div>
          </div>

          <div className="glass p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-lg font-black text-white shadow-lg shadow-brand-500/20">
                C
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Your Name</h2>
                <p className="text-sm text-white/35">Developer and student</p>
              </div>
            </div>
            <p className="mb-5 text-sm leading-relaxed text-white/40">
              Replace this text with your short intro, department, interests, or project credits. The social cards below are ready for your Instagram, GitHub, portfolio, Gmail, and X links.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {['Next.js', 'Express', 'MongoDB', 'Three.js'].map((tech) => (
                <span key={tech} className="rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-2 text-center text-xs font-semibold text-white/40">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.55 }}
          className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {highlights.map((item) => (
            <div key={item.title} className="card">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.05] text-brand-300">
                {item.icon}
              </div>
              <h3 className="mb-2 text-base font-semibold text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-white/35">{item.text}</p>
            </div>
          ))}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.55 }}
        >
          <div className="mb-6 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-400">Social Links</p>
            <h2 className="section-title">Connect with me</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                rel={link.href.startsWith('mailto:') ? undefined : 'noreferrer'}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.07]"
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${link.color} text-white shadow-lg shadow-black/20`}>
                  {link.icon}
                </div>
                <div className="mb-1 flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white">{link.label}</h3>
                  <ExternalLink size={12} className="text-white/20 transition-colors group-hover:text-white/50" />
                </div>
                <p className="break-words text-xs text-white/35">{link.value}</p>
              </a>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
