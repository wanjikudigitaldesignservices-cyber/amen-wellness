import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth/useAuth';
import { REGIONS, isValidRegion } from '../../config/regions';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function CustomerLogin() {
  const { region = 'nairobi' } = useParams<{ region: string }>();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const currentRegion = isValidRegion(region) ? REGIONS[region] : REGIONS.nairobi;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate(`/${region}/account`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid login credentials';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col justify-center px-6 py-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="font-serif text-3xl text-[#2E4A3F]">
            Amen {currentRegion.city}
          </h1>
          <p className="mt-1 text-xs uppercase tracking-widest text-[#2E4A3F]/70">
            Client Portal · Espace Client
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="customer-email"
                className="block text-xs font-semibold uppercase tracking-wider text-[#2E4A3F]"
              >
                Email Address
              </label>
              <div className="relative mt-2">
                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="customer-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full rounded-xl border border-[#EADFCB] bg-[#FAF7F0]/40 py-2.5 pr-4 pl-10 text-sm outline-none transition focus:border-[#2E4A3F] focus:ring-1 focus:ring-[#2E4A3F]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="customer-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#2E4A3F]"
                >
                  Password
                </label>
              </div>
              <div className="relative mt-2">
                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="customer-password"
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
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2E4A3F] py-3 text-sm font-medium tracking-wide text-[#FAF7F0] shadow transition hover:bg-[#1F3D2B] disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#FAF7F0] border-t-transparent" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-[#EADFCB]/60 pt-4 text-center text-xs text-gray-600">
            <span>New to Amen {currentRegion.city}? </span>
            <Link
              to={`/${region}/account/register`}
              className="font-medium text-[#2E4A3F] hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
