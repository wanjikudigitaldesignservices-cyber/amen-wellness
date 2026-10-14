import { describe, it, expect } from 'vitest';
import { cn, formatMoney } from '@/lib/utils';

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('filters falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });

  it('returns empty string for no truthy args', () => {
    expect(cn(false, null)).toBe('');
  });
});

describe('formatMoney', () => {
  it('formats KES for Nairobi', () => {
    const result = formatMoney(650000, 'KES', 'en-KE');
    expect(result).toContain('6,500');
  });

  it('formats USD for New York', () => {
    const result = formatMoney(16500, 'USD', 'en-US');
    expect(result).toContain('165');
    expect(result).toContain('$');
  });

  it('formats EUR for Paris', () => {
    const result = formatMoney(12000, 'EUR', 'fr-FR');
    // French locale uses non-breaking space and € symbol
    expect(result).toContain('120');
    expect(result).toContain('€');
  });

  it('handles zero', () => {
    const result = formatMoney(0, 'USD', 'en-US');
    expect(result).toContain('0');
  });
});
