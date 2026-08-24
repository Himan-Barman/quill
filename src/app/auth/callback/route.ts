import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';

  // Use x-forwarded-host for Vercel deployments, fall back to origin
  const forwardedHost = request.headers.get('x-forwarded-host');
  const origin = forwardedHost
    ? `https://${forwardedHost}`
    : requestUrl.origin;

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mlqpmqghsdfzhckpryiw.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1scXBtcWdoc2Rmemhja3ByeWl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0MjgyMzAsImV4cCI6MjEwMjAwNDIzMH0.EhmsrvHQTgxQpD6QgVDxO5gyj06avXF-w9cnrkxIRZM';

    // Buffer cookies that Supabase wants to set during the exchange.
    // We must explicitly attach them to the redirect response.
    const responseCookies: { name: string; value: string; options: Record<string, unknown> }[] = [];

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            // Read cookies directly from the incoming request
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            // Don't set cookies immediately — buffer them for the redirect response
            cookiesToSet.forEach(({ name, value, options }) => {
              responseCookies.push({ name, value, options: options as Record<string, unknown> });
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`);
      // Explicitly attach every auth cookie to the redirect response
      responseCookies.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });
      return response;
    } else {
      console.error('[auth/callback] exchangeCodeForSession failed:', error.message);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=No+code+provided`);
}
