import type { RegionId } from '../../config/regions';
import type { AuthUser, Permission, UserRole } from '../../types/auth';

/**
 * Role Permission Matrix
 * Dictates granular operational permissions per role.
 */
export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  super_admin: [
    'admin:all',
    'admin:settings:read',
    'admin:settings:write',
    'admin:users:manage',
    'bookings:read',
    'bookings:write',
    'bookings:cancel',
    'services:read',
    'services:write',
    'therapists:read',
    'therapists:write',
    'rooms:read',
    'rooms:write',
    'customers:read',
    'customers:write',
    'intake:read_sensitive',
    'finance:read',
    'finance:refund',
    'cms:read',
    'cms:write',
    'audit:read',
  ],
  region_admin: [
    'admin:settings:read',
    'admin:settings:write',
    'bookings:read',
    'bookings:write',
    'bookings:cancel',
    'services:read',
    'services:write',
    'therapists:read',
    'therapists:write',
    'rooms:read',
    'rooms:write',
    'customers:read',
    'customers:write',
    'intake:read_sensitive',
    'finance:read',
    'finance:refund',
    'cms:read',
    'cms:write',
    'audit:read',
  ],
  receptionist: [
    'bookings:read',
    'bookings:write',
    'bookings:cancel',
    'services:read',
    'therapists:read',
    'rooms:read',
    'customers:read',
    'customers:write',
  ],
  therapist: [
    'bookings:read',
    'therapists:read',
    'rooms:read',
    'customers:read',
    'intake:read_sensitive',
  ],
  content_editor: ['cms:read', 'cms:write', 'services:read', 'therapists:read'],
  customer: [],
} as const;

/**
 * Returns true if the role is an internal staff/admin role
 */
export function isAdminRole(role: UserRole): boolean {
  return role !== 'customer';
}

/**
 * Per Section 6: MFA is mandatory for all admin roles.
 */
export function requiresMfa(role: UserRole): boolean {
  return isAdminRole(role);
}

/**
 * Verifies if user has one of the allowed roles
 */
export function hasRole(
  user: AuthUser | null,
  allowedRoles: UserRole | UserRole[],
): boolean {
  if (!user) return false;
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(user.role);
}

/**
 * Hard Zero-Trust Regional Isolation Check.
 * - super_admin has global access across all regions.
 * - Any other user must have the specific region_id present in their regionIds array.
 */
export function canAccessRegion(user: AuthUser | null, targetRegion: RegionId): boolean {
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  return user.regionIds.includes(targetRegion);
}

/**
 * Checks whether user possesses a specific permission, scoped to region.
 */
export function hasPermission(
  user: AuthUser | null,
  permission: Permission,
  targetRegion?: RegionId,
): boolean {
  if (!user) return false;

  // Zero-Trust region barrier check
  if (targetRegion && !canAccessRegion(user, targetRegion)) {
    return false;
  }

  // Super admin possesses wildcard capability
  if (user.role === 'super_admin') {
    return true;
  }

  const rolePerms = ROLE_PERMISSIONS[user.role] ?? [];
  return rolePerms.includes(permission);
}
