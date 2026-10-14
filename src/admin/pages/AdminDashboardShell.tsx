import { useAuth } from '../../lib/auth/useAuth';
import { REGIONS, type RegionId } from '../../config/regions';
import { ShieldCheck, Building2, Calendar, Users, LogOut, Sparkles } from 'lucide-react';

export default function AdminDashboardShell() {
  const { user, activeRegion, switchActiveRegion, isSuperAdmin, logout } = useAuth();

  const currentRegionConfig = REGIONS[activeRegion];

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#222222]">
      {/* Top Navbar */}
      <header className="border-b border-[#EADFCB] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2E4A3F] text-[#FAF7F0] shadow-sm">
              <span className="font-serif text-lg font-bold">A</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl tracking-wide text-[#2E4A3F]">
                  AMEN
                </span>
                <span className="rounded-md bg-[#FAF7F0] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#2E4A3F]">
                  {user?.role}
                </span>
              </div>
              <p className="text-[11px] text-gray-500">Staff Portal · {user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Region Switcher: Super Admin only */}
            {isSuperAdmin ? (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#2E4A3F]" />
                <span className="text-xs font-medium text-[#2E4A3F]">Region:</span>
                <select
                  value={activeRegion}
                  onChange={(e) => switchActiveRegion(e.target.value as RegionId)}
                  className="rounded-lg border border-[#EADFCB] bg-[#FAF7F0] px-3 py-1.5 text-xs font-semibold text-[#2E4A3F] outline-none"
                >
                  <option value="nairobi">Nairobi (KES)</option>
                  <option value="new-york">New York (USD)</option>
                  <option value="paris">Paris (EUR)</option>
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-lg border border-[#EADFCB] bg-[#FAF7F0] px-3 py-1.5 text-xs font-semibold text-[#2E4A3F]">
                <Building2 className="h-3.5 w-3.5" />
                <span>
                  Region Locked:{' '}
                  {currentRegionConfig ? currentRegionConfig.city : activeRegion}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => void logout()}
              className="flex items-center gap-1.5 rounded-lg border border-[#EADFCB] px-3 py-1.5 text-xs text-gray-600 transition hover:bg-gray-50 hover:text-[#2E4A3F]"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 rounded-2xl border border-[#EADFCB] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-serif text-2xl text-[#2E4A3F]">
                Amen {currentRegionConfig.city} Administration
              </h1>
              <p className="mt-1 text-xs text-gray-600">
                Active timezone: {currentRegionConfig.tz} · Gateway:{' '}
                {currentRegionConfig.gateway} · Currency: {currentRegionConfig.currency}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800">
              <ShieldCheck className="h-4 w-4" />
              <span>Zero-Trust RLS Active · MFA Verified</span>
            </div>
          </div>
        </div>

        {/* Quick KPI Overview Skeleton */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#EADFCB] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-medium uppercase tracking-wider">
                Today&apos;s Bookings
              </span>
              <Calendar className="h-4 w-4 text-[#2E4A3F]" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-[#2E4A3F]">8</span>
              <span className="text-xs text-emerald-600">All rooms active</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#EADFCB] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-medium uppercase tracking-wider">
                Staff On Duty
              </span>
              <Users className="h-4 w-4 text-[#2E4A3F]" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-[#2E4A3F]">6</span>
              <span className="text-xs text-gray-500">
                Licensed therapists in {currentRegionConfig.city}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#EADFCB] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-medium uppercase tracking-wider">
                Active Treatments
              </span>
              <Sparkles className="h-4 w-4 text-[#2E4A3F]" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-[#2E4A3F]">9</span>
              <span className="text-xs text-gray-500">
                Priced in {currentRegionConfig.currency}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
