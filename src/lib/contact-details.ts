import type { Localized } from '@/i18n/config';

/**
 * Normalizes contact fields typed in /admin. Shared by the public site
 * (lib/content.ts) and the admin live preview, so both show the same result.
 */

export type ContactDetails = {
  address: Localized | null;
  hours: Localized | null;
  instagram: { handle: string; url: string } | null;
  email: string | null;
  mapUrl: string | null;
};

export type ContactFields = {
  addressEn?: string | null;
  addressAr?: string | null;
  hoursEn?: string | null;
  hoursAr?: string | null;
  instagramHandle?: string | null;
  instagramUrl?: string | null;
  email?: string | null;
  mapUrl?: string | null;
};

/** Both languages, falling back to the other one; null when both are empty. */
export function localized(en?: string | null, ar?: string | null): Localized | null {
  const e = en?.trim() ?? '';
  const a = ar?.trim() ?? '';
  if (!e && !a) return null;
  return { en: e || a, ar: a || e };
}

export function httpsUrl(value?: string | null): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export function emailAddress(value?: string | null): string | null {
  const email = value?.trim() ?? '';
  return /^[^\s@<>()]+@[^\s@<>()]+\.[^\s@<>()]+$/.test(email) ? email : null;
}

export function instagramAccount(handle?: string | null, url?: string | null): ContactDetails['instagram'] {
  const cleanHandle = handle?.trim().replace(/^@/, '') ?? '';
  const safeUrl = httpsUrl(url);
  if (safeUrl) {
    const fromUrl = new URL(safeUrl).pathname.split('/').filter(Boolean)[0] ?? '';
    const shown = cleanHandle || fromUrl;
    return shown ? { handle: shown, url: safeUrl } : null;
  }
  if (/^[A-Za-z0-9._]{1,30}$/.test(cleanHandle)) {
    return { handle: cleanHandle, url: `https://www.instagram.com/${cleanHandle}/` };
  }
  return null;
}

/** Database fields → contact details, falling back to `fallback` per field. */
export function toContactDetails(fields: ContactFields | null | undefined, fallback: ContactDetails): ContactDetails {
  return {
    address: localized(fields?.addressEn, fields?.addressAr) ?? fallback.address,
    hours: localized(fields?.hoursEn, fields?.hoursAr) ?? fallback.hours,
    instagram: instagramAccount(fields?.instagramHandle, fields?.instagramUrl) ?? fallback.instagram,
    email: emailAddress(fields?.email) ?? fallback.email,
    mapUrl: httpsUrl(fields?.mapUrl) ?? fallback.mapUrl,
  };
}
