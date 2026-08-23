'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function AuthCallbackContent() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // If the auth context finishes loading and we have a user, redirect to home
    if (!isLoading) {
      if (user) {
        router.push('/');
      } else {
        // If no user could be established, go back to login
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
      <p className="mt-6 text-muted text-lg animate-pulse font-medium">Authenticating...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
