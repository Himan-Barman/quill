import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';

  // Use x-forwarded-host for Vercel deployments, fall back to origin
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';
  let origin: string;
  if (isLocalEnv) {
    origin = requestUrl.origin;
  } else if (forwardedHost) {
    origin = `https://${forwardedHost}`;
  } else {
    origin = requestUrl.origin;
  }

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mlqpmqghsdfzhckpryiw.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1scXBtcWdoc2Rmemhja3ByeWl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0MjgyMzAsImV4cCI6MjEwMjAwNDIzMH0.EhmsrvHQTgxQpD6QgVDxO5gyj06avXF-w9cnrkxIRZM';

    // Buffer cookies that Supabase wants to set during the exchange
    const responseCookies: { name: string; value: string; options: Record<string, unknown> }[] = [];

    // Log all incoming cookies for debugging
    const allCookies = request.cookies.getAll();
    console.log('[auth/callback] Incoming cookies:', allCookies.map(c => c.name));
    console.log('[auth/callback] Origin:', origin);
    console.log('[auth/callback] Code present:', !!code);

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              responseCookies.push({ name, value, options: options as Record<string, unknown> });
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      console.log('[auth/callback] Exchange SUCCESS. User:', data.user?.email);
      console.log('[auth/callback] Setting', responseCookies.length, 'cookies on redirect');
      const response = NextResponse.redirect(`${origin}${next}`);
      responseCookies.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });
      return response;
    } else {
      // CRITICAL: Log the exact error so we can diagnose
      console.error('[auth/callback] Exchange FAILED:', error.message, error.status);
      // Include error in redirect URL so user can see it
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(error.message)}&debug=exchange_failed`
      );
    }
  }

  console.error('[auth/callback] No code parameter in URL');
  return NextResponse.redirect(`${origin}/login?error=No+code+provided&debug=no_code`);
}
