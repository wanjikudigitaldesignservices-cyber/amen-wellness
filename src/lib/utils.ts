/**
 * Shared utility helpers — pure functions, no side effects.
 */

/**
 * Combine class names, filtering out falsy values.
 * Lightweight alternative to clsx for now.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format money in minor units to a locale-aware display string.
 *
 * @param amountMinor - amount in minor currency units (e.g. cents)
 * @param currency    - ISO 4217 code (KES, USD, EUR)
 * @param locale      - BCP 47 locale string
 */
export function formatMoney(
  amountMinor: number,
  currency: string,
  locale: string,
): string {
  const major = amountMinor / 100;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(major);
}

/**
 * Format a Date (or ISO string) in a region's timezone.
 */
export function formatDateTime(
  date: Date | string,
  tz: string,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    timeZone: tz,
    ...options,
  }).format(d);
}
