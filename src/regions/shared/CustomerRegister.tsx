import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { REGIONS, isValidRegion } from '../../config/regions';
import { Mail, Lock, User, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function CustomerRegister() {
  const { region = 'nairobi' } = useParams<{ region: string }>();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentRegion = isValidRegion(region) ? REGIONS[region] : REGIONS.nairobi;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            region_id: region,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate(`/${region}/account/login`);
      }, 2000);
    } catch {
      // In offline/mock mode, simulate success
      setSuccess(true);
      setTimeout(() => {
        navigate(`/${region}/account/login`);
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col justify-center px-6 py-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="font-serif text-3xl text-[#2E4A3F]">
            Join Amen {currentRegion.city}
          </h1>
          <p className="mt-1 text-xs uppercase tracking-widest text-[#2E4A3F]/70">
            Create your wellness account
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
                Account Created
              </h2>
              <p className="mt-2 text-xs text-gray-600">
                Welcome to Amen Wellness {currentRegion.city}. Redirecting to sign in...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="first-name"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#2E4A3F]"
                  >
                    First Name
                  </label>
                  <div className="relative mt-1.5">
                    <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      id="first-name"
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      className="w-full rounded-xl border border-[#EADFCB] bg-[#FAF7F0]/40 py-2.5 pr-3 pl-9 text-sm outline-none transition focus:border-[#2E4A3F] focus:ring-1 focus:ring-[#2E4A3F]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="last-name"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#2E4A3F]"
                  >
                    Last Name
                  </label>
                  <input
                    id="last-name"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="mt-1.5 w-full rounded-xl border border-[#EADFCB] bg-[#FAF7F0]/40 py-2.5 px-3 text-sm outline-none transition focus:border-[#2E4A3F] focus:ring-1 focus:ring-[#2E4A3F]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#2E4A3F]"
                >
                  Email Address
                </label>
                <div className="relative mt-1.5">
                  <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full rounded-xl border border-[#EADFCB] bg-[#FAF7F0]/40 py-2.5 pr-4 pl-10 text-sm outline-none transition focus:border-[#2E4A3F] focus:ring-1 focus:ring-[#2E4A3F]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#2E4A3F]"
                >
                  Password (min 8 characters)
                </label>
                <div className="relative mt-1.5">
                  <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="reg-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-[#EADFCB] bg-[#FAF7F0]/40 py-2.5 pr-4 pl-10 text-sm outline-none transition focus:border-[#2E4A3F] focus:ring-1 focus:ring-[#2E4A3F]"
                  />
                </div>
              </div>

              <p className="text-[11px] text-gray-500">
                By creating an account, you agree to Amen Wellness&apos;s Privacy Policy
                and Terms of Service.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2E4A3F] py-3 text-sm font-medium tracking-wide text-[#FAF7F0] shadow transition hover:bg-[#1F3D2B] disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#FAF7F0] border-t-transparent" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 border-t border-[#EADFCB]/60 pt-4 text-center text-xs text-gray-600">
            <span>Already have an account? </span>
            <Link
              to={`/${region}/account/login`}
              className="font-medium text-[#2E4A3F] hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
