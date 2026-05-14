'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Chrome, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/Toast';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential?: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

interface GoogleAuthButtonProps {
  mode: 'login' | 'signup';
}

const GOOGLE_SCRIPT_ID = 'google-identity-services';
const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function GoogleAuthButton({ mode }: GoogleAuthButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const { googleLogin, isLoading } = useAuthStore();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!clientId) return;

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      if (window.google) setReady(true);
      else existingScript.addEventListener('load', () => setReady(true), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setReady(true);
    script.onerror = () => setScriptError(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!ready || !clientId || !containerRef.current || !window.google) return;

    containerRef.current.innerHTML = '';
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        if (!response.credential) {
          showToast('Google did not return a sign-in token.', 'error');
          return;
        }

        try {
          await googleLogin(response.credential);
          showToast(mode === 'signup' ? 'Account created with Google' : 'Logged in with Google', 'success');
          router.push('/dashboard');
        } catch {
          showToast('Google sign-in failed. Check your configuration.', 'error');
        }
      },
    });

    window.google.accounts.id.renderButton(containerRef.current, {
      theme: 'outline',
      size: 'large',
      width: 336,
      text: mode === 'signup' ? 'signup_with' : 'signin_with',
      shape: 'rectangular',
    });
  }, [googleLogin, mode, ready, router, showToast]);

  if (!clientId) {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs leading-5 text-amber-300/80">
        Add <span className="font-mono">NEXT_PUBLIC_GOOGLE_CLIENT_ID</span> to enable Google {mode}.
      </div>
    );
  }

  if (scriptError) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
        Google sign-in script could not load.
      </div>
    );
  }

  return (
    <div className="min-h-[44px]">
      {!ready && (
        <div className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm text-white/45">
          <Loader2 size={15} className="animate-spin" />
          Loading Google
        </div>
      )}
      <div className={isLoading ? 'pointer-events-none opacity-60' : ''} ref={containerRef} />
      <div className="sr-only">
        <Chrome size={16} />
      </div>
    </div>
  );
}
