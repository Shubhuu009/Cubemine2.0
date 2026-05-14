'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, Sparkles } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

const iconMap = {
  success: <CheckCircle2 size={16} />,
  error: <AlertCircle size={16} />,
  info: <Info size={16} />,
};

const styleMap = {
  success: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    glow: '0 0 30px rgba(16,185,129,0.1)',
    bar: 'bg-emerald-500',
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-400',
    glow: '0 0 30px rgba(239,68,68,0.1)',
    bar: 'bg-red-500',
  },
  info: {
    bg: 'bg-brand-500/10',
    border: 'border-brand-500/20',
    text: 'text-brand-400',
    glow: '0 0 30px rgba(99,102,241,0.1)',
    bar: 'bg-brand-500',
  },
};

let toastId = 0;
const DURATION = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, DURATION);
  }, []);

  const dismiss = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2.5 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const style = styleMap[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.92, x: 20 }}
                animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                exit={{ opacity: 0, x: 80, scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`pointer-events-auto flex items-center gap-3 px-4 py-3.5 rounded-xl border backdrop-blur-2xl min-w-[300px] max-w-[400px] ${style.bg} ${style.border} ${style.text} relative overflow-hidden`}
                style={{ boxShadow: style.glow }}
              >
                <span className="shrink-0">{iconMap[toast.type]}</span>
                <span className="text-sm font-medium flex-1 leading-snug">{toast.message}</span>
                <button onClick={() => dismiss(toast.id)} className="opacity-40 hover:opacity-100 transition-opacity shrink-0">
                  <X size={14} />
                </button>
                <motion.div
                  className={`absolute bottom-0 left-0 h-0.5 ${style.bar} rounded-full`}
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: DURATION / 1000, ease: 'linear' }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
