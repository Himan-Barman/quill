'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

function AuthCallbackContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // If we already have a user, we're good to go
    if (user) {
      router.push('/');
      return;
    }

    // Since Next.js useSearchParams might miss the hash fragment,
    // we inspect window.location directly on the client.
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error') || url.searchParams.get('error_description');
    
    // Hash fragments (Implicit flow)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const hashError = hashParams.get('error') || hashParams.get('error_description');

    const finalError = error || hashError;
    if (finalError) {
      setAuthError(finalError);
      setTimeout(() => router.push(`/login?error=${encodeURIComponent(finalError)}`), 2000);
      return;
    }

    if (code) {
      // PKCE Flow: Explicitly exchange the code for a session
      supabase.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
        if (exchangeError) {
          console.error('Code exchange error:', exchangeError);
          setTimeout(() => {
            supabase.auth.getSession().then(({ data: { session } }) => {
              if (session) {
                router.push('/');
              } else {
                router.push(`/login?error=Authentication+failed`);
              }
            });
          }, 3000);
        } else {
          router.push('/');
        }
      });
    } else if (accessToken) {
      // Implicit Flow: Explicitly set the session
      const refreshToken = hashParams.get('refresh_token');
      if (accessToken && refreshToken) {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          .then(({ error: sessionError }) => {
            if (sessionError) {
              console.error('Session set error:', sessionError);
              router.push(`/login?error=${encodeURIComponent(sessionError.message)}`);
            } else {
              router.push('/');
            }
          });
      } else {
         router.push('/login?error=Missing+refresh+token');
      }
    } else {
      // No code, no access token, no user? Invalid state.
      const timer = setTimeout(() => {
        router.push('/login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, router]);

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
