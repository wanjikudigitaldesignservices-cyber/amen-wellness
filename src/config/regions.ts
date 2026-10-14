/**
 * REGIONS — single source of truth
 *
 * Tax rates are seeded defaults. They must be editable per region in admin
 * Settings and are flagged on the Go-Live Checklist for confirmation by the
 * client's accountant.
 */

export type RegionSlug = 'nairobi' | 'new-york' | 'paris';
export type RegionId = RegionSlug;

export interface RegionTax {
  /** Tax display name (VAT, Sales tax, TVA) */
  readonly name: string;
  /** Default tax rate as a decimal (0.16 = 16 %) */
  readonly rate: number;
  /** true → displayed price includes tax; false → tax added at checkout */
  readonly inclusive: boolean;
}

export interface RegionConfig {
  readonly slug: RegionSlug;
  readonly city: string;
  readonly country: string;
  readonly defaultLocale: string;
  readonly locales: readonly string[];
  readonly currency: string;
  readonly tz: string;
  readonly gateway: 'intasend' | 'stripe';
  readonly tax: RegionTax;
}

export const REGIONS: Record<RegionSlug, RegionConfig> = {
  nairobi: {
    slug: 'nairobi',
    city: 'Nairobi',
    country: 'Kenya',
    defaultLocale: 'en-KE',
    locales: ['en-KE', 'sw'],
    currency: 'KES',
    tz: 'Africa/Nairobi',
    gateway: 'intasend',
    tax: { name: 'VAT', rate: 0.16, inclusive: true },
  },
  'new-york': {
    slug: 'new-york',
    city: 'New York',
    country: 'USA',
    defaultLocale: 'en-US',
    locales: ['en-US'],
    currency: 'USD',
    tz: 'America/New_York',
    gateway: 'stripe',
    tax: { name: 'Sales tax', rate: 0, inclusive: false },
  },
  paris: {
    slug: 'paris',
    city: 'Paris',
    country: 'France',
    defaultLocale: 'fr-FR',
    locales: ['fr-FR', 'en'],
    currency: 'EUR',
    tz: 'Europe/Paris',
    gateway: 'stripe',
    tax: { name: 'TVA', rate: 0.2, inclusive: true },
  },
} as const;

/** Ordered list for UI rendering (region gate, admin switcher) */
export const REGION_SLUGS = Object.keys(REGIONS) as RegionSlug[];

/** Validate a string against known region slugs */
export function isValidRegion(slug: string): slug is RegionSlug {
  return slug in REGIONS;
}

/** Get region config or undefined */
export function getRegion(slug: string): RegionConfig | undefined {
  return isValidRegion(slug) ? REGIONS[slug] : undefined;
}
