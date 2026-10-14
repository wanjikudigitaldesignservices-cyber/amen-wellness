import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth/useAuth';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function AdminForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestPasswordReset(email);
    } finally {
      setSubmitted(true);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#FAF7F0] px-6 py-12 text-[#222222] sm:px-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-normal text-[#2E4A3F]">
            Reset Password
          </h1>
          <p className="mt-1 text-xs text-[#2E4A3F]/70">
            Enter your Amen Wellness staff email address to receive reset instructions.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-[#EADFCB] bg-white p-8 shadow-sm">
          {submitted ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
              <h2 className="mt-3 text-base font-semibold text-[#2E4A3F]">
                Reset Link Sent
              </h2>
              <p className="mt-2 text-xs text-gray-600">
                If an account exists for{' '}
                <span className="font-medium text-[#2E4A3F]">{email}</span>, you will
                receive a password recovery link shortly.
              </p>
              <Link
                to="/admin/login"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-[#2E4A3F] hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="reset-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#2E4A3F]"
                >
                  Work Email
                </label>
                <div className="relative mt-2">
                  <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@amenwellness.com"
                    className="w-full rounded-xl border border-[#EADFCB] bg-[#FAF7F0]/40 py-2.5 pr-4 pl-10 text-sm outline-none transition focus:border-[#2E4A3F] focus:ring-1 focus:ring-[#2E4A3F]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-[#2E4A3F] py-3 text-sm font-medium text-[#FAF7F0] shadow transition hover:bg-[#1F3D2B] disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Recovery Link'}
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-1 text-xs text-[#2E4A3F]/70 hover:text-[#2E4A3F]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
