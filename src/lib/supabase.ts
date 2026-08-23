import { createClient } from '@supabase/supabase-js';

// Using the keys found in the Flutter mobile app
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mlqpmqghsdfzhckpryiw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1scXBtcWdoc2Rmemhja3ByeWl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0MjgyMzAsImV4cCI6MjEwMjAwNDIzMH0.EhmsrvHQTgxQpD6QgVDxO5gyj06avXF-w9cnrkxIRZM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'implicit',
  },
});
