'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Loader from './Loader';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Redirecting to login..." />
      </div>
    );
  }

  return <>{children}</>;
}
