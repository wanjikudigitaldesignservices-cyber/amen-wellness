/**
 * Supabase client singleton.
 *
 * Uses the ANON key — safe for the browser. The service-role key is
 * used only in Edge Functions and is never imported here.
 */
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

// In development or local testing the env vars may be unconfigured;
// supply a valid URL shape so createClient does not crash the client app bundle.
const url =
  env.supabaseUrl && env.supabaseUrl.startsWith('http')
    ? env.supabaseUrl
    : 'https://amen-wellness.supabase.co';

const key =
  env.supabaseAnonKey && env.supabaseAnonKey.length > 20
    ? env.supabaseAnonKey
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.mock-signature-for-development';

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
