/**
 * Supabase client singleton.
 *
 * Uses the ANON key — safe for the browser. The service-role key is
 * used only in Edge Functions and is never imported here.
 */
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

// In development the env vars may be blank; guard to avoid runtime crash
// before they're configured.
const url = env.supabaseUrl ?? '';
const key = env.supabaseAnonKey ?? '';

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
