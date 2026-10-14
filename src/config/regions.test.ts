import { describe, it, expect } from 'vitest';
import { REGIONS, REGION_SLUGS, isValidRegion, getRegion } from '@/config/regions';
import type { RegionSlug } from '@/config/regions';

describe('REGIONS config', () => {
  it('contains exactly three regions', () => {
    expect(REGION_SLUGS).toHaveLength(3);
    expect(REGION_SLUGS).toEqual(
      expect.arrayContaining(['nairobi', 'new-york', 'paris']),
    );
  });

  it.each(REGION_SLUGS)('region "%s" has all required fields', (slug) => {
    const region = REGIONS[slug as RegionSlug];
    expect(region).toBeDefined();
    expect(region.slug).toBe(slug);
    expect(region.city).toBeTruthy();
    expect(region.country).toBeTruthy();
    expect(region.defaultLocale).toBeTruthy();
    expect(region.locales.length).toBeGreaterThan(0);
    expect(region.locales).toContain(region.defaultLocale);
    expect(region.currency).toMatch(/^[A-Z]{3}$/);
    expect(region.tz).toBeTruthy();
    expect(['intasend', 'stripe']).toContain(region.gateway);
  });

  it.each(REGION_SLUGS)('region "%s" has valid tax config', (slug) => {
    const { tax } = REGIONS[slug as RegionSlug];
    expect(tax.name).toBeTruthy();
    expect(tax.rate).toBeGreaterThanOrEqual(0);
    expect(tax.rate).toBeLessThanOrEqual(1);
    expect(typeof tax.inclusive).toBe('boolean');
  });

  it('Nairobi uses IntaSend gateway', () => {
    expect(REGIONS.nairobi.gateway).toBe('intasend');
  });

  it('New York uses Stripe gateway', () => {
    expect(REGIONS['new-york'].gateway).toBe('stripe');
  });

  it('Paris uses Stripe gateway', () => {
    expect(REGIONS.paris.gateway).toBe('stripe');
  });

  it('Nairobi supports Swahili', () => {
    expect(REGIONS.nairobi.locales).toContain('sw');
  });

  it('Paris defaults to French', () => {
    expect(REGIONS.paris.defaultLocale).toBe('fr-FR');
  });

  it('each region has a unique timezone', () => {
    const tzs = REGION_SLUGS.map((s) => REGIONS[s as RegionSlug].tz);
    expect(new Set(tzs).size).toBe(3);
  });

  it('each region has a unique currency', () => {
    const currencies = REGION_SLUGS.map((s) => REGIONS[s as RegionSlug].currency);
    expect(new Set(currencies).size).toBe(3);
  });
});

describe('isValidRegion', () => {
  it('returns true for known slugs', () => {
    expect(isValidRegion('nairobi')).toBe(true);
    expect(isValidRegion('new-york')).toBe(true);
    expect(isValidRegion('paris')).toBe(true);
  });

  it('returns false for unknown slugs', () => {
    expect(isValidRegion('london')).toBe(false);
    expect(isValidRegion('')).toBe(false);
    expect(isValidRegion('NAIROBI')).toBe(false);
  });
});

describe('getRegion', () => {
  it('returns config for valid slugs', () => {
    const r = getRegion('nairobi');
    expect(r).toBeDefined();
    expect(r!.city).toBe('Nairobi');
  });

  it('returns undefined for invalid slugs', () => {
    expect(getRegion('tokyo')).toBeUndefined();
  });
});
