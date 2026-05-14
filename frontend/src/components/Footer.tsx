import Link from 'next/link';
import { Box, Github, Mail, Trophy, BarChart3, BookOpen, Zap, Settings, LayoutDashboard, Layers, Instagram, Twitter, Briefcase, ExternalLink } from 'lucide-react';

const footerLinks = {
  'Cube Solver': [
    { href: '/solver', label: '2×2 Solver', icon: <Box size={12} /> },
    { href: '/solver', label: '3×3 Solver', icon: <Layers size={12} /> },
    { href: '/solver', label: '4×4 Solver', icon: <Layers size={12} /> },
    { href: '/solver', label: '5×5 Solver', icon: <Layers size={12} /> },
  ],
  'Learn & Community': [
    { href: '/learn',    label: 'Beginner Guide',  icon: <BookOpen size={12} /> },
    { href: '/learn',    label: 'Video Tutorials', icon: <Zap size={12} />      },
    { href: '/reviews',  label: 'Reviews',         icon: <Zap size={12} />      },
    { href: '/about',    label: 'About Us',        icon: <ExternalLink size={12} /> },
    { href: '/contact',  label: 'Contact Us',      icon: <Zap size={12} />      },
    { href: '/support',  label: 'Support & FAQ',   icon: <Zap size={12} />      },
  ],
  'Platform': [
    { href: '/leaderboard', label: 'Leaderboard',  icon: <Trophy size={12} />          },
    { href: '/dashboard',   label: 'Dashboard',    icon: <LayoutDashboard size={12} /> },
    { href: '/statistics',  label: 'Statistics',   icon: <BarChart3 size={12} />       },
    { href: '/settings',    label: 'Settings',     icon: <Settings size={12} />        },
  ],
};

const techStack = ['Next.js 14', 'Express.js', 'MongoDB', 'Three.js', 'Redis', 'Framer Motion'];

const socialLinks = [
  { href: 'https://instagram.com/your_username', label: 'Instagram', icon: <Instagram size={15} /> },
  { href: 'https://github.com/your_username', label: 'GitHub', icon: <Github size={15} /> },
  { href: 'https://your-portfolio.com', label: 'Portfolio', icon: <Briefcase size={15} /> },
  { href: 'mailto:your.email@gmail.com', label: 'Gmail', icon: <Mail size={15} /> },
  { href: 'https://x.com/your_username', label: 'X', icon: <Twitter size={15} /> },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.04] bg-surface-950 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-brand-600/4 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Box size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold gradient-text tracking-tight">CUBEMINE</span>
            </div>
            <p className="text-white/35 text-sm leading-relaxed max-w-sm mb-5">
              A modern Rubik&apos;s Cube solving and learning platform. Master 2×2 through 5×5 cubes with step-by-step solutions, deep analytics, and competitive leaderboards.
            </p>

            {/* Feature tags */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {['3D Solver', '5 Cube Types', 'Analytics', 'Leaderboard', 'Redis Cache', 'JWT Auth'].map((f) => (
                <span key={f} className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                  {f}
                </span>
              ))}
            </div>

            {/* Social */}
            <div className="flex gap-2">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={link.href.startsWith('mailto:') ? undefined : 'noreferrer'}
                  className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/35 hover:text-white hover:bg-white/[0.08] hover:border-white/10 transition-all"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-bold text-white/60 mb-4 uppercase tracking-widest">{section}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/35 hover:text-brand-400 transition-colors flex items-center gap-2 group"
                    >
                      <span className="text-white/20 group-hover:text-brand-400 transition-colors">{link.icon}</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Tech stack */}
        <div className="py-5 border-y border-white/[0.04] mb-5 flex items-center gap-3 flex-wrap">
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Built with</span>
          {techStack.map((tech) => (
            <span key={tech} className="text-[10px] text-white/25 font-mono px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.05]">
              {tech}
            </span>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} CUBEMINE. Built as a college project.
          </p>
          <div className="flex items-center gap-5">
              {['Learn', 'Leaderboard', 'Reviews', 'About', 'Contact', 'Support', 'Settings'].map((label) => (
                <Link key={label} href={`/${label.toLowerCase()}`} className="text-xs text-white/20 hover:text-white/40 transition-colors">
                  {label}
                </Link>
              ))}
            </div>
        </div>
      </div>
    </footer>
  );
}
