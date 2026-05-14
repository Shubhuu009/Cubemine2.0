'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TimerProps {
  onTimeUpdate?: (ms: number) => void;
  isRunning?: boolean;
}

export default function Timer({ onTimeUpdate }: TimerProps) {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);

  const start = useCallback(() => {
    if (running) return;
    setRunning(true);
    startTimeRef.current = Date.now() - time;
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setTime(elapsed);
      onTimeUpdate?.(elapsed);
    }, 10);
  }, [running, time, onTimeUpdate]);

  const pause = useCallback(() => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const reset = useCallback(() => {
    pause();
    setTime(0);
    onTimeUpdate?.(0);
  }, [pause, onTimeUpdate]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass p-5 text-center">
      <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Solve Timer</p>
      <div className={`font-mono text-4xl font-bold mb-4 transition-colors ${running ? 'text-emerald-400' : 'text-white'}`}>
        {formatTime(time)}
      </div>
      <div className="flex justify-center gap-2">
        {running ? (
          <button onClick={pause} className="btn-secondary !py-2 !px-4 flex items-center gap-1.5 text-sm">
            <Pause size={14} />
            Pause
          </button>
        ) : (
          <button onClick={start} className="btn-primary !py-2 !px-4 flex items-center gap-1.5 text-sm">
            <Play size={14} />
            {time > 0 ? 'Resume' : 'Start'}
          </button>
        )}
        <button onClick={reset} className="btn-secondary !py-2 !px-4 flex items-center gap-1.5 text-sm">
          <RotateCcw size={14} />
          Reset
        </button>
      </div>
    </div>
  );
}
