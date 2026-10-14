import type { RegionId } from '../config/regions';

export function saveUserRegionPreference(region: RegionId): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('amen_region', region);
      if (typeof document !== 'undefined') {
        document.cookie = `amen_region=${region}; path=/; max-age=31536000; SameSite=Lax`;
      }
    }
  } catch {
    // Non-blocking
  }
}

export function detectBrowserRegion(): RegionId {
  try {
    if (typeof Intl !== 'undefined') {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase();
      if (tz.includes('nairobi') || tz.includes('africa') || tz.includes('cairo')) {
        return 'nairobi';
      }
      if (
        tz.includes('york') ||
        tz.includes('america') ||
        tz.includes('chicago') ||
        tz.includes('los_angeles')
      ) {
        return 'new-york';
      }
      if (
        tz.includes('paris') ||
        tz.includes('europe') ||
        tz.includes('london') ||
        tz.includes('berlin')
      ) {
        return 'paris';
      }
    }
  } catch {
    // fallback
  }
  return 'nairobi';
}
