'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, MessageSquare, User, AtSign, Send, CheckCircle,
  AlertCircle, Github, Clock, Zap, HelpCircle,
} from 'lucide-react';
import Link from 'next/link';

const topics = [
  'Bug Report',
  'Feature Request',
  'Account Issue',
  'Solver Problem',
  'General Question',
  'Feedback / Review',
  'Other',
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())    e.name    = 'Name is required';
    if (!form.email.trim())   e.email   = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.topic)          e.topic   = 'Please select a topic';
    if (!form.message.trim()) e.message = 'Message is required';
    else if (form.message.trim().length < 20) e.message = 'Message must be at least 20 characters';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setErrors({});
    setStatus('sending');
    // Simulate submission (replace with real API call)
    await new Promise((r) => setTimeout(r, 1800));
    setStatus('success');
  };

  const update = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand-600/5 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/4 right-1/6 w-[300px] h-[300px] bg-purple-600/4 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
              <MessageSquare size={28} className="text-brand-400" />
            </div>
          </div>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-400 mb-2">Get in Touch</p>
          <h1 className="text-4xl font-black text-white mb-3">Contact Us</h1>
          <p className="text-white/40 max-w-lg mx-auto">
            Have a question, bug report, or feature idea? We&apos;d love to hear from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {[
              {
                icon: <Clock size={18} className="text-brand-400" />,
                title: 'Response Time',
                desc: 'We typically respond within 24–48 hours on weekdays.',
                bg: 'bg-brand-500/10', border: 'border-brand-500/15',
              },
              {
                icon: <Zap size={18} className="text-amber-400" />,
                title: 'Quick Fixes',
                desc: 'For common issues, check our Support & FAQ page first.',
                bg: 'bg-amber-500/10', border: 'border-amber-500/15',
                link: { href: '/support', label: 'Visit Support' },
              },
              {
                icon: <Github size={18} className="text-white/60" />,
                title: 'Open Source',
                desc: 'Found a bug in the code? Contributions are welcome!',
                bg: 'bg-white/[0.04]', border: 'border-white/[0.08]',
              },
            ].map((item) => (
              <div key={item.title} className={`p-4 rounded-2xl border ${item.bg} ${item.border}`}>
                <div className="flex items-center gap-2.5 mb-2">
                  {item.icon}
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                </div>
                <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                {item.link && (
                  <Link href={item.link.href} className="mt-2 inline-flex items-center gap-1 text-xs text-brand-400 hover:underline">
                    {item.link.label} →
                  </Link>
                )}
              </div>
            ))}

            {/* Alt contact */}
            <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <p className="text-xs font-bold text-white/30 uppercase tracking-wider mb-3">Other Ways</p>
              <div className="space-y-2.5">
                <a href="mailto:support@cubemine.app" className="flex items-center gap-2 text-sm text-white/50 hover:text-brand-400 transition-colors">
                  <Mail size={14} /> support@cubemine.app
                </a>
                <a href="https://github.com" className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors">
                  <Github size={14} /> GitHub Repository
                </a>
                <Link href="/support" className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors">
                  <HelpCircle size={14} /> FAQ & Support
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-2"
          >
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass h-full flex flex-col items-center justify-center text-center p-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-6"
                  >
                    <CheckCircle size={36} className="text-emerald-400" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white mb-3">Message Sent!</h2>
                  <p className="text-white/40 mb-6 max-w-sm">
                    Thanks for reaching out. We&apos;ll review your message and get back to you within 24–48 hours.
                  </p>
                  <button
                    onClick={() => { setForm({ name: '', email: '', topic: '', message: '' }); setStatus('idle'); }}
                    className="btn-secondary !py-2 !px-6 text-sm"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="glass p-6 sm:p-8 space-y-5"
                >
                  <div>
                    <p className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-5">Send a Message</p>
                  </div>

                  {/* Name + Email row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-white/40 font-semibold mb-1.5">Your Name</label>
                      <div className="input-group">
                        <User size={15} className="input-icon" />
                        <input
                          type="text"
                          placeholder="Alex Chen"
                          value={form.name}
                          onChange={(e) => update('name', e.target.value)}
                          className={`input-field pl-10 ${errors.name ? 'border-red-500/50 focus:border-red-500/70' : ''}`}
                        />
                      </div>
                      {errors.name && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-xs text-white/40 font-semibold mb-1.5">Email Address</label>
                      <div className="input-group">
                        <AtSign size={15} className="input-icon" />
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={(e) => update('email', e.target.value)}
                          className={`input-field pl-10 ${errors.email ? 'border-red-500/50' : ''}`}
                        />
                      </div>
                      {errors.email && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.email}</p>}
                    </div>
                  </div>

                  {/* Topic */}
                  <div>
                    <label className="block text-xs text-white/40 font-semibold mb-1.5">Topic</label>
                    <select
                      value={form.topic}
                      onChange={(e) => update('topic', e.target.value)}
                      className={`input-field ${errors.topic ? 'border-red-500/50' : ''}`}
                      style={{ WebkitAppearance: 'none' }}
                    >
                      <option value="" disabled>Select a topic...</option>
                      {topics.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {errors.topic && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.topic}</p>}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs text-white/40 font-semibold mb-1.5">
                      Message
                      <span className="ml-2 text-white/20 font-normal">{form.message.length} chars</span>
                    </label>
                    <textarea
                      rows={6}
                      placeholder="Describe your issue or question in detail..."
                      value={form.message}
                      onChange={(e) => update('message', e.target.value)}
                      className={`input-field resize-none ${errors.message ? 'border-red-500/50' : ''}`}
                    />
                    {errors.message && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {status === 'sending' ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} /> Send Message
                      </>
                    )}
                  </button>

                  <p className="text-xs text-white/20 text-center">
                    Your information is kept private and used only to respond to your inquiry.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
