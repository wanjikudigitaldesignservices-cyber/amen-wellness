/**
 * Environment variable access with type safety.
 *
 * All VITE_ prefixed vars are available in the browser bundle.
 * Server-only vars (SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY_*, etc.)
 * must only be accessed inside Edge Functions.
 */

export const env = {
  /** Supabase project URL */
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string,

  /** Supabase anonymous (public) key — safe for the browser */
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,

  /** Public app URL */
  appUrl: import.meta.env.VITE_APP_URL as string,

  /** Current environment */
  environment: (import.meta.env.VITE_ENV ?? 'development') as
    'development' | 'staging' | 'production',

  /** Stripe publishable keys (one per region) */
  stripe: {
    publishableKeyNY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_NY as string,
    publishableKeyParis: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_PARIS as string,
  },

  /** IntaSend publishable key */
  intasend: {
    publishableKey: import.meta.env.VITE_INTASEND_PUBLISHABLE_KEY as string,
  },

  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
