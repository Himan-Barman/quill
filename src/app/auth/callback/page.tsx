'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  useEffect(() => {
    // If we have a user, authentication was successful
    if (user) {
      router.push('/');
      return;
    }
    
    // If an error was returned from Supabase, go back to login
    if (error) {
      router.push(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    // If context finished loading, but we have NO user and NO code in URL,
    // then it's an invalid state, go to login.
    // (If code IS present, we wait for Supabase's background exchange to finish 
    // and populate `user`, which will trigger the user block above)
    if (!isLoading && !code) {
      router.push('/login');
    }
  }, [user, isLoading, code, error, router]);

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
