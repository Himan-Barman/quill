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
      // This prevents relying solely on supabase-js background process which 
      // sometimes races with Next.js router.
      supabase.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
        if (exchangeError) {
          console.error('Code exchange error:', exchangeError);
          // If the error is 'Auth session missing' or 'code challenge not found',
          // it might mean supabase-js ALREADY exchanged it in the background.
          // In that case, we don't immediately fail, we let AuthContext pick it up.
          // But if after 3 seconds we still have no user, we fail.
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
      // Implicit Flow: supabase-js will detect this and set the session automatically.
      // We just need to wait for AuthContext to pick it up.
      // It will trigger the `if (user)` block above.
    } else {
      // No code, no access token, no user? Invalid state.
      // Wait a tiny bit just in case, then redirect to login.
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
