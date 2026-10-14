import { describe, it, expect, beforeEach } from 'vitest';
import {
  canAccessRegion,
  hasPermission,
  hasRole,
  isAdminRole,
  requiresMfa,
} from '../lib/auth/rbac';
import {
  getThrottlingState,
  isLockedOut,
  recordFailedAttempt,
  resetThrottling,
} from '../lib/auth/throttling';
import { SEED_USERS } from '../lib/auth/mockUsers';
import type { AuthUser } from '../types/auth';

describe('Auth & RBAC Architecture Verification (Phase 2)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Role & Permission Matrix Rules', () => {
    const superAdmin: AuthUser = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'superadmin@amenwellness.com',
      role: 'super_admin',
      regionIds: ['nairobi', 'new-york', 'paris'],
      mfaEnabled: true,
      mfaVerified: true,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const nairobiAdmin: AuthUser = {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'nairobi.admin@amenwellness.com',
      role: 'region_admin',
      regionIds: ['nairobi'],
      mfaEnabled: true,
      mfaVerified: true,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const newYorkAdmin: AuthUser = {
      id: '00000000-0000-0000-0000-000000000003',
      email: 'newyork.admin@amenwellness.com',
      role: 'region_admin',
      regionIds: ['new-york'],
      mfaEnabled: true,
      mfaVerified: true,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const parisAdmin: AuthUser = {
      id: '00000000-0000-0000-0000-000000000004',
      email: 'paris.admin@amenwellness.com',
      role: 'region_admin',
      regionIds: ['paris'],
      mfaEnabled: true,
      mfaVerified: true,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const receptionist: AuthUser = {
      id: '00000000-0000-0000-0000-000000000005',
      email: 'reception.nairobi@amenwellness.com',
      role: 'receptionist',
      regionIds: ['nairobi'],
      mfaEnabled: true,
      mfaVerified: true,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const therapist: AuthUser = {
      id: '00000000-0000-0000-0000-000000000006',
      email: 'therapist.paris@amenwellness.com',
      role: 'therapist',
      regionIds: ['paris'],
      mfaEnabled: true,
      mfaVerified: true,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const contentEditor: AuthUser = {
      id: '00000000-0000-0000-0000-000000000007',
      email: 'editor@amenwellness.com',
      role: 'content_editor',
      regionIds: ['nairobi', 'new-york', 'paris'],
      mfaEnabled: true,
      mfaVerified: true,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const customer: AuthUser = {
      id: '10000000-0000-0000-0000-000000000001',
      email: 'customer.nairobi@example.com',
      role: 'customer',
      regionIds: ['nairobi'],
      mfaEnabled: false,
      mfaVerified: false,
      createdAt: '2026-01-01T00:00:00Z',
    };

    it('identifies administrative vs customer roles correctly', () => {
      expect(isAdminRole('super_admin')).toBe(true);
      expect(isAdminRole('region_admin')).toBe(true);
      expect(isAdminRole('receptionist')).toBe(true);
      expect(isAdminRole('therapist')).toBe(true);
      expect(isAdminRole('content_editor')).toBe(true);
      expect(isAdminRole('customer')).toBe(false);
    });

    it('enforces mandatory MFA for all administrative roles, never for customers', () => {
      expect(requiresMfa('super_admin')).toBe(true);
      expect(requiresMfa('region_admin')).toBe(true);
      expect(requiresMfa('receptionist')).toBe(true);
      expect(requiresMfa('therapist')).toBe(true);
      expect(requiresMfa('content_editor')).toBe(true);
      expect(requiresMfa('customer')).toBe(false);
    });

    it('proves super_admin possesses global access across all three regions', () => {
      expect(canAccessRegion(superAdmin, 'nairobi')).toBe(true);
      expect(canAccessRegion(superAdmin, 'new-york')).toBe(true);
      expect(canAccessRegion(superAdmin, 'paris')).toBe(true);

      expect(hasPermission(superAdmin, 'admin:all')).toBe(true);
      expect(hasPermission(superAdmin, 'admin:settings:write', 'nairobi')).toBe(true);
      expect(hasPermission(superAdmin, 'admin:settings:write', 'paris')).toBe(true);
      expect(hasPermission(superAdmin, 'finance:refund', 'new-york')).toBe(true);
    });

    it('proves Nairobi admin is locked to Nairobi and DENIED Paris and New York access', () => {
      expect(canAccessRegion(nairobiAdmin, 'nairobi')).toBe(true);
      expect(canAccessRegion(nairobiAdmin, 'new-york')).toBe(false);
      expect(canAccessRegion(nairobiAdmin, 'paris')).toBe(false);

      expect(hasPermission(nairobiAdmin, 'bookings:read', 'nairobi')).toBe(true);
      expect(hasPermission(nairobiAdmin, 'bookings:read', 'paris')).toBe(false);
      expect(hasPermission(nairobiAdmin, 'admin:settings:write', 'new-york')).toBe(false);
    });

    it('proves New York admin is locked to New York and DENIED Nairobi and Paris access', () => {
      expect(canAccessRegion(newYorkAdmin, 'new-york')).toBe(true);
      expect(canAccessRegion(newYorkAdmin, 'nairobi')).toBe(false);
      expect(canAccessRegion(newYorkAdmin, 'paris')).toBe(false);

      expect(hasPermission(newYorkAdmin, 'finance:read', 'new-york')).toBe(true);
      expect(hasPermission(newYorkAdmin, 'finance:read', 'nairobi')).toBe(false);
    });

    it('proves Paris admin is locked to Paris and DENIED Nairobi and New York access', () => {
      expect(canAccessRegion(parisAdmin, 'paris')).toBe(true);
      expect(canAccessRegion(parisAdmin, 'nairobi')).toBe(false);
      expect(canAccessRegion(parisAdmin, 'new-york')).toBe(false);

      expect(hasPermission(parisAdmin, 'services:write', 'paris')).toBe(true);
      expect(hasPermission(parisAdmin, 'services:write', 'nairobi')).toBe(false);
    });

    it('proves Receptionist role permissions: can manage bookings, cannot modify settings or issue refunds', () => {
      expect(hasPermission(receptionist, 'bookings:read', 'nairobi')).toBe(true);
      expect(hasPermission(receptionist, 'bookings:write', 'nairobi')).toBe(true);
      expect(hasPermission(receptionist, 'customers:read', 'nairobi')).toBe(true);

      // Denied actions
      expect(hasPermission(receptionist, 'admin:settings:write', 'nairobi')).toBe(false);
      expect(hasPermission(receptionist, 'finance:refund', 'nairobi')).toBe(false);
      expect(hasPermission(receptionist, 'admin:users:manage', 'nairobi')).toBe(false);
    });

    it('proves Therapist role permissions: can view schedule and sensitive intake, cannot edit services or issue refunds', () => {
      expect(hasPermission(therapist, 'bookings:read', 'paris')).toBe(true);
      expect(hasPermission(therapist, 'intake:read_sensitive', 'paris')).toBe(true);

      // Denied actions
      expect(hasPermission(therapist, 'services:write', 'paris')).toBe(false);
      expect(hasPermission(therapist, 'finance:refund', 'paris')).toBe(false);
      expect(hasPermission(therapist, 'admin:settings:write', 'paris')).toBe(false);
    });

    it('proves Content Editor permissions: can edit CMS and view catalog, cannot access bookings or finance', () => {
      expect(hasPermission(contentEditor, 'cms:read', 'nairobi')).toBe(true);
      expect(hasPermission(contentEditor, 'cms:write', 'paris')).toBe(true);

      // Denied actions
      expect(hasPermission(contentEditor, 'bookings:write', 'new-york')).toBe(false);
      expect(hasPermission(contentEditor, 'finance:refund', 'nairobi')).toBe(false);
      expect(hasPermission(contentEditor, 'intake:read_sensitive', 'paris')).toBe(false);
    });

    it('proves Customer role is DENIED all administrative permissions', () => {
      expect(hasPermission(customer, 'admin:all')).toBe(false);
      expect(hasPermission(customer, 'bookings:read', 'nairobi')).toBe(false);
      expect(hasPermission(customer, 'customers:read', 'nairobi')).toBe(false);
      expect(hasPermission(customer, 'cms:write', 'nairobi')).toBe(false);
      expect(hasPermission(customer, 'finance:refund', 'nairobi')).toBe(false);
    });

    it('proves hasRole function validates single and array of allowed roles', () => {
      expect(hasRole(superAdmin, 'super_admin')).toBe(true);
      expect(hasRole(superAdmin, ['super_admin', 'region_admin'])).toBe(true);
      expect(hasRole(nairobiAdmin, ['receptionist', 'therapist'])).toBe(false);
      expect(hasRole(null, 'customer')).toBe(false);
    });
  });

  describe('Brute-Force Login Throttling & Lockout Engine', () => {
    const testEmail = 'staff.throttle@amenwellness.com';

    it('tracks failed attempts and calculates remaining attempts accurately', () => {
      expect(isLockedOut(testEmail).locked).toBe(false);

      const attempt1 = recordFailedAttempt(testEmail);
      expect(attempt1.attempts).toBe(1);
      expect(attempt1.remainingAttempts).toBe(4);
      expect(attempt1.locked).toBe(false);

      const attempt2 = recordFailedAttempt(testEmail);
      expect(attempt2.attempts).toBe(2);
      expect(attempt2.remainingAttempts).toBe(3);
      expect(attempt2.locked).toBe(false);
    });

    it('locks out account for 15 minutes after 5 consecutive failed attempts', () => {
      for (let i = 1; i <= 4; i++) {
        recordFailedAttempt(testEmail);
      }
      expect(isLockedOut(testEmail).locked).toBe(false);

      // 5th failed attempt triggers lockout
      const attempt5 = recordFailedAttempt(testEmail);
      expect(attempt5.attempts).toBe(5);
      expect(attempt5.remainingAttempts).toBe(0);
      expect(attempt5.locked).toBe(true);
      expect(attempt5.remainingSeconds).toBeGreaterThan(0);

      const lockStatus = isLockedOut(testEmail);
      expect(lockStatus.locked).toBe(true);
      expect(lockStatus.remainingSeconds).toBeGreaterThan(800); // ≈900s
    });

    it('resets throttling state after successful login', () => {
      recordFailedAttempt(testEmail);
      recordFailedAttempt(testEmail);
      expect(getThrottlingState(testEmail).attempts).toBe(2);

      resetThrottling(testEmail);
      expect(getThrottlingState(testEmail).attempts).toBe(0);
      expect(isLockedOut(testEmail).locked).toBe(false);
    });
  });

  describe('Seed Users & Credentials Verification', () => {
    it('contains all required seed staff roles with realistic credentials', () => {
      expect(SEED_USERS.length).toBeGreaterThanOrEqual(7);

      const roles = SEED_USERS.map((s) => s.user.role);
      expect(roles).toContain('super_admin');
      expect(roles).toContain('region_admin');
      expect(roles).toContain('receptionist');
      expect(roles).toContain('therapist');
      expect(roles).toContain('content_editor');
      expect(roles).toContain('customer');
    });

    it('verifies all seed users have is_demo = true', () => {
      for (const entry of SEED_USERS) {
        expect(entry.isDemo).toBe(true);
      }
    });

    it('verifies all staff seed users have mfaEnabled = true', () => {
      for (const entry of SEED_USERS) {
        if (entry.user.role !== 'customer') {
          expect(entry.user.mfaEnabled).toBe(true);
        }
      }
    });
  });
});
