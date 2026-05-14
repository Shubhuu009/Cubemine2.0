'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';
import { ToastProvider } from '@/components/Toast';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <html lang="en" className="dark">
      <head>
        <title>CUBEMINE — Rubik&apos;s Cube Solver &amp; Learning Platform</title>
        <meta name="description" content="Master 2x2 and 3x3 Rubik's Cubes with CUBEMINE. Interactive 3D solver, step-by-step tutorials, detailed analytics, leaderboards, and progress tracking." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#020617" />
        <meta name="keywords" content="Rubik's Cube, cube solver, 3x3, 2x2, speedcubing, algorithms, learning platform" />
        <meta property="og:title" content="CUBEMINE — Rubik's Cube Solver & Learning Platform" />
        <meta property="og:description" content="Solve cubes step-by-step, track your progress, and compete on leaderboards." />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="flex flex-col min-h-screen overflow-x-hidden">
        <ToastProvider>
          <AnimatedBackground />
          <Navbar />
          <main className="flex-1 pt-16 relative z-10">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
