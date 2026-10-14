import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth/useAuth';
import type { UserRole } from '../../types/auth';
import type { RegionId } from '../../config/regions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredRegion?: RegionId;
}

/**
 * Staff and Administration Route Guard
 * Enforces authentication, mandatory MFA completion, and Zero-Trust regional barriers.
 */
export function AdminRoute({
  children,
  allowedRoles,
  requiredRegion,
}: ProtectedRouteProps) {
  const { user, isLoading, pendingMfaUser, canAccess } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F0] text-[#2E4A3F]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2E4A3F] border-t-transparent" />
          <p className="font-serif text-lg tracking-wider">AMEN</p>
        </div>
      </div>
    );
  }

  // If user completed step 1 (password) but has not verified MFA, force MFA route
  if (pendingMfaUser && !user) {
    return <Navigate to="/admin/mfa" state={{ from: location }} replace />;
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Role validation
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  // Zero-Trust Regional boundary validation
  if (requiredRegion && !canAccess(requiredRegion)) {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  return <>{children}</>;
}

/**
 * Customer Account Area Guard
 * Ensures customer is signed in when accessing regional accounts.
 */
export function CustomerRoute({
  children,
  region,
}: {
  children: React.ReactNode;
  region: RegionId;
}) {
  const { user, isLoading, canAccess } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F0] text-[#2E4A3F]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2E4A3F] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate to={`/${region}/account/login`} state={{ from: location }} replace />
    );
  }

  // Validate regional alignment for customers
  if (user.role === 'customer' && !canAccess(region)) {
    return <Navigate to={`/${region}/account/login`} replace />;
  }

  return <>{children}</>;
}
