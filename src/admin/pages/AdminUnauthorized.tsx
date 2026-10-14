import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth/useAuth';
import { ShieldX, ArrowLeft, LogOut } from 'lucide-react';

export default function AdminUnauthorized() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#FAF7F0] px-6 py-12 text-[#222222] sm:px-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 shadow-sm border border-amber-200">
            <ShieldX className="h-9 w-9" />
          </div>
          <h1 className="mt-4 font-serif text-3xl font-normal text-[#2E4A3F]">
            Access Restricted
          </h1>
          <p className="mt-1 text-xs uppercase tracking-wider text-amber-700 font-semibold">
            Zero-Trust Regional Boundary Enforced
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-[#EADFCB] bg-white p-8 shadow-sm text-sm">
          <p className="text-gray-700 leading-relaxed">
            Your account does not possess the regional clearance or role permissions
            required to access this resource.
          </p>

          {user && (
            <div className="mt-5 rounded-xl bg-[#FAF7F0] p-4 text-xs space-y-1.5 border border-[#EADFCB]/60">
              <div className="flex justify-between">
                <span className="text-[#2E4A3F]/70">Authenticated user:</span>
                <span className="font-medium text-[#2E4A3F]">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#2E4A3F]/70">Active role:</span>
                <span className="font-mono uppercase text-[#2E4A3F]">{user.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#2E4A3F]/70">Authorized regions:</span>
                <span className="font-mono text-[#2E4A3F]">
                  {user.regionIds.length > 0 ? user.regionIds.join(', ') : 'none'}
                </span>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2E4A3F] py-2.5 text-xs font-medium text-[#FAF7F0] shadow transition hover:bg-[#1F3D2B]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Permitted Dashboard</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#EADFCB] bg-white py-2.5 text-xs font-medium text-[#2E4A3F] transition hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out & Switch Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
