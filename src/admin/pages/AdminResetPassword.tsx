import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth/useAuth';
import { Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminResetPassword() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/login');
      }, 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#FAF7F0] px-6 py-12 text-[#222222] sm:px-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-normal text-[#2E4A3F]">
            Set New Password
          </h1>
          <p className="mt-1 text-xs text-[#2E4A3F]/70">
            Create a strong, secure password for your administrative account.
          </p>
        </div>

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

          {success ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
              <h2 className="mt-3 text-base font-semibold text-[#2E4A3F]">
                Password Updated
              </h2>
              <p className="mt-2 text-xs text-gray-600">
                Your password has been changed successfully. Redirecting to sign in...
              </p>
              <Link
                to="/admin/login"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-[#2E4A3F] hover:underline"
              >
                <span>Sign in now</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#2E4A3F]"
                >
                  New Password
                </label>
                <div className="relative mt-2">
                  <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="new-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-[#EADFCB] bg-[#FAF7F0]/40 py-2.5 pr-4 pl-10 text-sm outline-none transition focus:border-[#2E4A3F] focus:ring-1 focus:ring-[#2E4A3F]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#2E4A3F]"
                >
                  Confirm Password
                </label>
                <div className="relative mt-2">
                  <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-[#EADFCB] bg-[#FAF7F0]/40 py-2.5 pr-4 pl-10 text-sm outline-none transition focus:border-[#2E4A3F] focus:ring-1 focus:ring-[#2E4A3F]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-[#2E4A3F] py-3 text-sm font-medium text-[#FAF7F0] shadow transition hover:bg-[#1F3D2B] disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
