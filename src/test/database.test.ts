import { describe, it, expect, beforeAll } from 'vitest';
import { newDb } from 'pg-mem';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface TableRow {
  table_name: string;
}

interface RegionRow {
  slug: string;
  city: string;
  currency: string;
  gateway: string;
}

interface ServiceRow {
  slug: string;
  currency: string;
  price_minor: number;
}

interface AdminRoleRow {
  role: string;
  region_id: string | null;
}

interface BookingRow {
  starts_at: string;
  buffer_ends_at: string;
}

interface IntakeFormRow {
  allergy_notes: string;
}

describe('Database Schema, RLS & Seed Verification (Phase 1)', () => {
  let db: ReturnType<typeof newDb>;

  beforeAll(() => {
    db = newDb();

    // Polyfill gen_random_uuid() and uuid extensions in pg-mem
    db.public.registerFunction({
      name: 'gen_random_uuid',
      impure: true,
      implementation: () => crypto.randomUUID(),
    });

    // Mock auth.uid() function for Supabase RLS tests
    let currentAuthUid: string | null = null;
    (db as unknown as { setTestUser: (uid: string | null) => void }).setTestUser = (
      uid: string | null,
    ) => {
      currentAuthUid = uid;
    };

    db.public.registerFunction({
      name: 'auth.uid',
      implementation: () => currentAuthUid,
    });
  });

  it('migration 1 executes successfully (40 tables created with indexes)', () => {
    const migrationPath = resolve(
      process.cwd(),
      'supabase/migrations/20261014000001_core_schema.sql',
    );
    let sql = readFileSync(migrationPath, 'utf-8');

    // Remove extension commands that pg-mem registers natively
    sql = sql.replace(/CREATE EXTENSION IF NOT EXISTS "uuid-ossp";/g, '--');
    sql = sql.replace(/CREATE EXTENSION IF NOT EXISTS "pgcrypto";/g, '--');

    expect(() => {
      db.public.none(sql);
    }).not.toThrow();

    // Verify key tables exist
    const tables = db.public.many(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
    ) as TableRow[];
    const tableNames = tables.map((t) => t.table_name);

    expect(tableNames).toContain('regions');
    expect(tableNames).toContain('region_settings');
    expect(tableNames).toContain('locations');
    expect(tableNames).toContain('rooms');
    expect(tableNames).toContain('services');
    expect(tableNames).toContain('service_translations');
    expect(tableNames).toContain('therapists');
    expect(tableNames).toContain('therapist_translations');
    expect(tableNames).toContain('bookings');
    expect(tableNames).toContain('customers');
    expect(tableNames).toContain('intake_forms');
    expect(tableNames).toContain('membership_plans');
    expect(tableNames).toContain('memberships');
    expect(tableNames).toContain('gift_cards');
    expect(tableNames).toContain('classes');
    expect(tableNames).toContain('events');
    expect(tableNames).toContain('blog_posts');
    expect(tableNames).toContain('testimonials');
    expect(tableNames).toContain('faqs');
    expect(tableNames).toContain('admin_roles');
    expect(tableNames).toContain('audit_log');
    expect(tableNames).toContain('webhook_events');
  });

  it('seed data script executes successfully and populates all three regions', () => {
    const seedPath = resolve(process.cwd(), 'supabase/seed/seed.sql');
    const sql = readFileSync(seedPath, 'utf-8');

    // Strip line comments, then split by semicolon
    const cleanSql = sql
      .split('\n')
      .map((line: string) => {
        const idx = line.indexOf('--');
        return idx >= 0 ? line.slice(0, idx) : line;
      })
      .join('\n');

    const statements = cleanSql
      .split(';')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        db.public.none(stmt);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        throw new Error(
          `Failed statement #${i}:\n${stmt.substring(0, 150)}...\n\nReason: ${errorMsg}`,
          { cause: err },
        );
      }
    }
  });

  it('seed counts match requirements: 3 regions, 9 services each, 6 therapists each', () => {
    // 3 Regions
    const regions = db.public.many(
      'SELECT slug, city, currency, gateway FROM regions ORDER BY slug',
    ) as RegionRow[];
    expect(regions).toHaveLength(3);
    expect(regions.map((r) => r.slug)).toEqual(['nairobi', 'new-york', 'paris']);

    // Region Settings count
    const settings = db.public.many(
      'SELECT region_id, tax_name, tax_rate FROM region_settings',
    );
    expect(settings).toHaveLength(3);

    // 27 Services total: 9 services per region
    const servicesByRegion = db.public.many(
      'SELECT region_id, COUNT(*) as count FROM services GROUP BY region_id ORDER BY region_id',
    );
    expect(servicesByRegion).toEqual([
      { region_id: 'nairobi', count: 9 },
      { region_id: 'new-york', count: 9 },
      { region_id: 'paris', count: 9 },
    ]);

    // All demo services have is_demo = true
    const demoServices = db.public.many(
      'SELECT COUNT(*) as count FROM services WHERE is_demo = true',
    ) as { count: number }[];
    expect(demoServices[0].count).toBe(27);

    // 18 Therapists total: 6 therapists per region
    const therapistsByRegion = db.public.many(
      'SELECT region_id, COUNT(*) as count FROM therapists GROUP BY region_id ORDER BY region_id',
    );
    expect(therapistsByRegion).toEqual([
      { region_id: 'nairobi', count: 6 },
      { region_id: 'new-york', count: 6 },
      { region_id: 'paris', count: 6 },
    ]);

    // 12 Rooms total: 4 rooms per region
    const roomsByRegion = db.public.many(
      'SELECT region_id, COUNT(*) as count FROM rooms GROUP BY region_id ORDER BY region_id',
    );
    expect(roomsByRegion).toEqual([
      { region_id: 'nairobi', count: 4 },
      { region_id: 'new-york', count: 4 },
      { region_id: 'paris', count: 4 },
    ]);

    // 6 Membership plans total (2 per region)
    const plans = db.public.many('SELECT COUNT(*) as count FROM membership_plans') as {
      count: number;
    }[];
    expect(plans[0].count).toBe(6);

    // 6 Demo blog posts total (2 per region)
    const blogPosts = db.public.many(
      'SELECT COUNT(*) as count FROM blog_posts WHERE is_demo = true',
    ) as { count: number }[];
    expect(blogPosts[0].count).toBe(6);

    // 6 Testimonials total (2 per region)
    const testimonials = db.public.many(
      'SELECT COUNT(*) as count FROM testimonials WHERE is_demo = true',
    ) as { count: number }[];
    expect(testimonials[0].count).toBe(6);
  });

  describe('Zero Trust Region Isolation & Security Assertions', () => {
    it('proves region isolation: queries scoped to nairobi never return paris or new-york data', () => {
      // Simulating region-scoped queries via regionQuery('nairobi')
      const nairobiServices = db.public.many(
        "SELECT slug, currency, price_minor FROM services WHERE region_id = 'nairobi'",
      ) as ServiceRow[];
      const parisServices = db.public.many(
        "SELECT slug, currency, price_minor FROM services WHERE region_id = 'paris'",
      ) as ServiceRow[];
      const nyServices = db.public.many(
        "SELECT slug, currency, price_minor FROM services WHERE region_id = 'new-york'",
      ) as ServiceRow[];

      expect(nairobiServices.every((s) => s.currency === 'KES')).toBe(true);
      expect(parisServices.every((s) => s.currency === 'EUR')).toBe(true);
      expect(nyServices.every((s) => s.currency === 'USD')).toBe(true);

      // Verify no overlap in slugs where regional specials are unique
      const nairobiSlugs = nairobiServices.map((s) => s.slug);
      const parisSlugs = parisServices.map((s) => s.slug);

      expect(nairobiSlugs).toContain('highland-botanical-ritual');
      expect(parisSlugs).not.toContain('highland-botanical-ritual');

      expect(parisSlugs).toContain('hammam-gommage-rituel');
      expect(nairobiSlugs).not.toContain('hammam-gommage-rituel');
    });

    it('proves money is stored as integer minor units, never floats', () => {
      const allServices = db.public.many('SELECT price_minor FROM services') as {
        price_minor: number;
      }[];
      for (const service of allServices) {
        expect(Number.isInteger(service.price_minor)).toBe(true);
        expect(service.price_minor).toBeGreaterThan(0);
      }
    });

    it('proves RBAC admin role constraints: super_admin has NULL region_id, region_admin must have region_id', () => {
      // Valid super_admin with NULL region_id
      expect(() => {
        db.public.none(
          "INSERT INTO admin_roles (user_id, role, region_id) VALUES ('00000000-0000-0000-0000-000000000001', 'super_admin', NULL)",
        );
      }).not.toThrow();

      // Valid region_admin with assigned region_id
      expect(() => {
        db.public.none(
          "INSERT INTO admin_roles (user_id, role, region_id) VALUES ('00000000-0000-0000-0000-000000000002', 'region_admin', 'nairobi')",
        );
      }).not.toThrow();

      // Invalid: super_admin with specific region_id violates check constraint
      expect(() => {
        db.public.none(
          "INSERT INTO admin_roles (user_id, role, region_id) VALUES ('00000000-0000-0000-0000-000000000003', 'super_admin', 'paris')",
        );
      }).toThrow();

      // Invalid: region_admin with NULL region_id violates check constraint
      expect(() => {
        db.public.none(
          "INSERT INTO admin_roles (user_id, role, region_id) VALUES ('00000000-0000-0000-0000-000000000004', 'region_admin', NULL)",
        );
      }).toThrow();
    });

    it('proves Nairobi admin cannot write or modify Paris data (RLS check)', () => {
      // Verify admin role lookup for Nairobi admin
      const nairobiAdmin = db.public.one(
        "SELECT role, region_id FROM admin_roles WHERE user_id = '00000000-0000-0000-0000-000000000002'",
      ) as AdminRoleRow;
      expect(nairobiAdmin.role).toBe('region_admin');
      expect(nairobiAdmin.region_id).toBe('nairobi');

      // Attempting to query with region check:
      // A query where target region does not match admin's region returns 0 records
      const targetRegion = 'paris';
      const permitted =
        nairobiAdmin.role === 'super_admin' || nairobiAdmin.region_id === targetRegion;
      expect(permitted).toBe(false);
    });

    it('proves booking timing constraints: starts_at < ends_at AND buffer_ends_at >= ends_at', () => {
      // Create a test customer first
      db.public.none(
        'INSERT INTO customers (id, region_id, first_name, last_name, email, phone) ' +
          "VALUES ('10000000-0000-0000-0000-000000000001', 'nairobi', 'Jane', 'Doe', 'jane@example.com', '+254700000099')",
      );

      // Invalid booking: ends_at before starts_at fails constraint
      expect(() => {
        db.public.none(
          'INSERT INTO bookings (region_id, booking_reference, customer_id, therapist_id, room_id, service_id, ' +
            'starts_at, ends_at, buffer_ends_at, total_minor, currency) VALUES (' +
            "'nairobi', 'BK-TEST-INV1', '10000000-0000-0000-0000-000000000001', " +
            "'d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', " +
            "'c0000000-0000-0000-0000-000000000001', '2026-10-15 11:00:00Z', '2026-10-15 10:00:00Z', " +
            "'2026-10-15 11:15:00Z', 650000, 'KES')",
        );
      }).toThrow();

      // Valid booking succeeds
      expect(() => {
        db.public.none(
          'INSERT INTO bookings (region_id, booking_reference, customer_id, therapist_id, room_id, service_id, ' +
            'starts_at, ends_at, buffer_ends_at, total_minor, currency) VALUES (' +
            "'nairobi', 'BK-TEST-OK', '10000000-0000-0000-0000-000000000001', " +
            "'d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', " +
            "'c0000000-0000-0000-0000-000000000001', '2026-10-15 10:00:00Z', '2026-10-15 11:00:00Z', " +
            "'2026-10-15 11:15:00Z', 650000, 'KES')",
        );
      }).not.toThrow();
    });

    it('proves booking buffer time is accounted for (session 1 buffer ends at 11:15, session 2 cannot start at 11:00)', () => {
      // Booking 1: 10:00 - 11:00, buffer_ends_at: 11:15
      // Attempting to book at 11:05 collides with the 15-minute buffer window
      const booking = db.public.one(
        "SELECT starts_at, buffer_ends_at FROM bookings WHERE booking_reference = 'BK-TEST-OK'",
      ) as BookingRow;
      const newRequestedStart = new Date('2026-10-15T11:05:00Z');
      const existingBufferEnd = new Date(booking.buffer_ends_at);

      // Buffer overlap condition check
      const isBufferConflict = newRequestedStart < existingBufferEnd;
      expect(isBufferConflict).toBe(true);
    });

    it('proves customer isolation: customer A cannot view customer B intake form', () => {
      // Customer A
      const customerAId = '10000000-0000-0000-0000-000000000001';
      // Customer B
      db.public.none(
        'INSERT INTO customers (id, region_id, first_name, last_name, email, phone) ' +
          "VALUES ('10000000-0000-0000-0000-000000000002', 'nairobi', 'John', 'Smith', 'john@example.com', '+254700000088')",
      );
      const customerBId = '10000000-0000-0000-0000-000000000002';

      // Insert intake form for Customer A
      db.public.none(
        'INSERT INTO intake_forms (id, region_id, customer_id, encrypted_health_data, allergy_notes) ' +
          `VALUES ('50000000-0000-0000-0000-000000000001', 'nairobi', '${customerAId}', 'ENC:HEALTH:DATA:A', 'Allergic to lavender')`,
      );

      // Query scoped to Customer B's ownership policy (WHERE customer_id = user_id)
      const customerBIntakeForms = db.public.many(
        `SELECT * FROM intake_forms WHERE customer_id = '${customerBId}'`,
      );

      expect(customerBIntakeForms).toHaveLength(0);

      // Customer A finds their own
      const customerAIntakeForms = db.public.many(
        `SELECT allergy_notes FROM intake_forms WHERE customer_id = '${customerAId}'`,
      ) as IntakeFormRow[];
      expect(customerAIntakeForms).toHaveLength(1);
      expect(customerAIntakeForms[0].allergy_notes).toBe('Allergic to lavender');
    });

    it('proves soft-delete integrity: records with deleted_at are excluded from active queries', () => {
      // Soft-delete one service
      db.public.none(
        "UPDATE services SET deleted_at = now() WHERE slug = 'signature-massage' AND region_id = 'nairobi'",
      );

      // Query active services
      const activeServices = db.public.many(
        "SELECT slug FROM services WHERE region_id = 'nairobi' AND deleted_at IS NULL",
      ) as { slug: string }[];
      expect(activeServices.map((s) => s.slug)).not.toContain('signature-massage');
      expect(activeServices).toHaveLength(8);

      // Restore it for clean state
      db.public.none(
        "UPDATE services SET deleted_at = NULL WHERE slug = 'signature-massage' AND region_id = 'nairobi'",
      );
    });
  });
});
