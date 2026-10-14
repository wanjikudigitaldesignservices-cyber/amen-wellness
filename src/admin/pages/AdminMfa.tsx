import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth/useAuth';
import { ShieldAlert, KeyRound, ArrowRight, ArrowLeft } from 'lucide-react';

export default function AdminMfa() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pendingMfaUser, verifyMfa, logout } = useAuth();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // If no user is in the pending MFA state, bounce back to login
  if (!pendingMfaUser) {
    return <Navigate to="/admin/login" replace />;
  }

  const targetFrom =
    (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);

    try {
      await verifyMfa(code);
      navigate(targetFrom, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid MFA code';
      setError(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBackToLogin = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#FAF7F0] px-6 py-12 text-[#222222] sm:px-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2E4A3F] text-[#FAF7F0] shadow-md">
            <KeyRound className="h-7 w-7 text-[#FAF7F0]" />
          </div>
          <h1 className="mt-4 font-serif text-2xl font-normal text-[#2E4A3F]">
            Two-Step Verification
          </h1>
          <p className="mt-1 text-xs text-[#2E4A3F]/70">
            Mandatory Zero-Trust security check for Amen Wellness staff.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-[#EADFCB] bg-white p-8 shadow-sm">
          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-6 rounded-xl bg-[#FAF7F0] p-4 text-xs text-[#2E4A3F]">
            <p className="font-semibold">Authenticating as: {pendingMfaUser.email}</p>
            <p className="mt-1 text-[#2E4A3F]/70">
              Role: <span className="uppercase">{pendingMfaUser.role}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="totp-code"
                className="block text-center text-xs font-semibold uppercase tracking-wider text-[#2E4A3F]"
              >
                Enter 6-Digit Authenticator Code
              </label>
              <div className="mt-3">
                <input
                  id="totp-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full text-center font-mono text-2xl tracking-[0.5em] rounded-xl border border-[#EADFCB] bg-[#FAF7F0]/40 py-3.5 outline-none transition focus:border-[#2E4A3F] focus:ring-1 focus:ring-[#2E4A3F]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying || code.length !== 6}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2E4A3F] py-3 text-sm font-medium tracking-wide text-[#FAF7F0] shadow transition hover:bg-[#1F3D2B] disabled:opacity-50"
            >
              {isVerifying ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#FAF7F0] border-t-transparent" />
              ) : (
                <>
                  <span>Verify & Enter</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between border-t border-[#EADFCB]/60 pt-4 text-xs">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="flex items-center gap-1.5 text-[#2E4A3F]/70 hover:text-[#2E4A3F]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Cancel / Sign Out</span>
            </button>
            <span className="text-[11px] text-gray-400">Demo code: 123456</span>
          </div>
        </div>
      </div>
    </div>
  );
}
