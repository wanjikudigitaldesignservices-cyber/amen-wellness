import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth/useAuth';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { SEED_USERS } from '../../lib/auth/mockUsers';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const targetFrom =
    (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.mfaRequired) {
        navigate('/admin/mfa', { state: { from: { pathname: targetFrom } } });
      } else {
        navigate(targetFrom, { replace: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#FAF7F0] px-6 py-12 text-[#222222] sm:px-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Lockup */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2E4A3F] text-[#FAF7F0] shadow-md">
            <svg
              className="h-8 w-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                d="M4 21V11a8 8 0 1 1 16 0v10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 13a4 4 0 0 1 4 4v4H8v-4a4 4 0 0 1 4-4Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="mt-4 font-serif text-3xl font-normal tracking-wide text-[#2E4A3F]">
            AMEN
          </h1>
          <p className="mt-0.5 text-xs tracking-[0.25em] text-[#2E4A3F]/70">
            ADMINISTRATION PORTAL
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 rounded-2xl border border-[#EADFCB] bg-white p-8 shadow-sm">
          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-[#2E4A3F]"
              >
                Work Email
              </label>
              <div className="relative mt-2">
                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@amenwellness.com"
                  className="w-full rounded-xl border border-[#EADFCB] bg-[#FAF7F0]/40 py-2.5 pr-4 pl-10 text-sm outline-none transition focus:border-[#2E4A3F] focus:ring-1 focus:ring-[#2E4A3F]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#2E4A3F]"
                >
                  Password
                </label>
                <Link
                  to="/admin/forgot-password"
                  className="text-xs text-[#2E4A3F]/70 hover:text-[#2E4A3F] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-2">
                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-[#EADFCB] bg-[#FAF7F0]/40 py-2.5 pr-4 pl-10 text-sm outline-none transition focus:border-[#2E4A3F] focus:ring-1 focus:ring-[#2E4A3F]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2E4A3F] py-3 text-sm font-medium tracking-wide text-[#FAF7F0] shadow transition hover:bg-[#1F3D2B] disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#FAF7F0] border-t-transparent" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* MFA Notice */}
          <div className="mt-6 flex items-center justify-center gap-2 border-t border-[#EADFCB]/60 pt-4 text-xs text-[#2E4A3F]/70">
            <ShieldCheck className="h-4 w-4 text-[#2E4A3F]" />
            <span>Multi-Factor Authentication (MFA) Enforced</span>
          </div>

          {/* Quick Demo Credentials Bar */}
          <div className="mt-6 rounded-xl border border-dashed border-[#EADFCB] bg-[#FAF7F0]/50 p-3.5">
            <p className="text-[11px] font-semibold tracking-wider text-[#2E4A3F] uppercase">
              Demo Credentials (flagged is_demo = true)
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() =>
                  fillDemo(SEED_USERS[0].user.email, SEED_USERS[0].passwordHash)
                }
                className="rounded-lg border border-[#EADFCB] bg-white px-2 py-1 text-[11px] text-[#2E4A3F] transition hover:bg-[#EADFCB]/30"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() =>
                  fillDemo(SEED_USERS[1].user.email, SEED_USERS[1].passwordHash)
                }
                className="rounded-lg border border-[#EADFCB] bg-white px-2 py-1 text-[11px] text-[#2E4A3F] transition hover:bg-[#EADFCB]/30"
              >
                Nairobi Admin
              </button>
              <button
                type="button"
                onClick={() =>
                  fillDemo(SEED_USERS[3].user.email, SEED_USERS[3].passwordHash)
                }
                className="rounded-lg border border-[#EADFCB] bg-white px-2 py-1 text-[11px] text-[#2E4A3F] transition hover:bg-[#EADFCB]/30"
              >
                Paris Admin
              </button>
              <button
                type="button"
                onClick={() =>
                  fillDemo(SEED_USERS[4].user.email, SEED_USERS[4].passwordHash)
                }
                className="rounded-lg border border-[#EADFCB] bg-white px-2 py-1 text-[11px] text-[#2E4A3F] transition hover:bg-[#EADFCB]/30"
              >
                Reception
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
