import 'server-only';

import { cache } from 'react';
import type { Schema } from '@amplify/data/resource';
import { isIconName } from '@/components/ui/Icon';
import { offers as staticOffers, type OfferDefinition } from '@/config/offers';
import { services as staticServices, type ServiceDefinition } from '@/config/services';
import { siteConfig } from '@/config/site';
import { runAsGuest } from '@/lib/amplify-server';
import { localized, toContactDetails, type ContactDetails } from '@/lib/contact-details';
import { resolveMediaPath } from '@/lib/media';

/**
 * Content for the public site. Reads the admin database (as a guest) and falls
 * back to the static files in src/config whenever the backend is missing,
 * empty or unreachable, so local development and builds never break.
 */

export type Service = ServiceDefinition;
export type Offer = OfferDefinition;
export type { ContactDetails };

export type SiteSettings = ContactDetails & {
  heroVideo: { mp4: string; webm: string | null; poster: string | null };
};

type ServiceRow = Schema['Service']['type'];
type OfferRow = Schema['Offer']['type'];
type SettingsRow = Schema['SiteSettings']['type'];

const PAGE_SIZE = 1000;

function bySortOrder(a: { sortOrder?: number | null }, b: { sortOrder?: number | null }) {
  return (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER);
}

function isPublished(row: { published?: boolean | null }) {
  return row.published !== false;
}

async function listServiceRows(): Promise<ServiceRow[] | null> {
  return runAsGuest(async ({ client }, context) => {
    const rows: ServiceRow[] = [];
    let nextToken: string | null | undefined;
    do {
      const page = await client.models.Service.list(context, {
        authMode: 'identityPool',
        limit: PAGE_SIZE,
        nextToken,
      });
      if (page.errors?.length) throw new Error(page.errors.map((e) => e.message).join('; '));
      rows.push(...page.data);
      nextToken = page.nextToken;
    } while (nextToken);
    return rows;
  });
}

async function listOfferRows(): Promise<OfferRow[] | null> {
  return runAsGuest(async ({ client }, context) => {
    const rows: OfferRow[] = [];
    let nextToken: string | null | undefined;
    do {
      const page = await client.models.Offer.list(context, {
        authMode: 'identityPool',
        limit: PAGE_SIZE,
        nextToken,
      });
      if (page.errors?.length) throw new Error(page.errors.map((e) => e.message).join('; '));
      rows.push(...page.data);
      nextToken = page.nextToken;
    } while (nextToken);
    return rows;
  });
}

async function getSettingsRow(): Promise<SettingsRow | null> {
  return runAsGuest(async ({ client }, context) => {
    const { data, errors } = await client.models.SiteSettings.get(
      context,
      { id: 'main' },
      { authMode: 'identityPool' },
    );
    if (errors?.length) throw new Error(errors.map((e) => e.message).join('; '));
    return data;
  });
}

/**
 * Published services in display order. Database rows win (matched by slug) and
 * keep the highlights/items of the matching static service; services that only
 * exist in the database have none, so those sections hide.
 */
export const getServices = cache(async (): Promise<Service[]> => {
  const rows = await listServiceRows();
  if (!rows || rows.length === 0) return staticServices;

  const staticBySlug = new Map(staticServices.map((service) => [service.slug, service]));
  const seen = new Set<string>();

  return rows
    .filter(isPublished)
    .sort(bySortOrder)
    .flatMap((row): Service[] => {
      if (!row.slug || seen.has(row.slug)) return [];
      seen.add(row.slug);
      const base = staticBySlug.get(row.slug);
      const name = localized(row.nameEn, row.nameAr) ?? base?.name;
      if (!name) return [];
      const summary = localized(row.summaryEn, row.summaryAr) ?? base?.summary ?? { en: '', ar: '' };
      return [
        {
          slug: row.slug,
          icon: isIconName(row.icon) ? row.icon : (base?.icon ?? 'sparkles'),
          image: resolveMediaPath(row.imagePath),
          name,
          summary,
          intro: localized(row.introEn, row.introAr) ?? base?.intro ?? summary,
          highlights: base?.highlights ?? [],
          items: base?.items ?? [],
        },
      ];
    });
});

export async function getService(slug: string): Promise<Service | undefined> {
  return (await getServices()).find((service) => service.slug === slug);
}

/** Published offers in display order; empty until real offers exist. */
export const getOffers = cache(async (): Promise<Offer[]> => {
  const rows = await listOfferRows();
  if (!rows || rows.length === 0) return staticOffers;

  return rows
    .filter(isPublished)
    .sort(bySortOrder)
    .flatMap((row): Offer[] => {
      const title = localized(row.titleEn, row.titleAr);
      if (!title) return [];
      return [
        {
          id: row.id,
          title,
          description: localized(row.descriptionEn, row.descriptionAr),
          badge: localized(row.badgeEn, row.badgeAr),
          priceNow: typeof row.priceNow === 'number' ? row.priceNow : null,
          priceWas: typeof row.priceWas === 'number' ? row.priceWas : null,
          serviceSlug: row.serviceSlug || null,
          image: resolveMediaPath(row.imagePath),
        },
      ];
    });
});

/** Contact details and hero media: database values first, then src/config/site.ts. */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const row = await getSettingsRow();
  const bundled = siteConfig.heroVideo;
  const customVideo = resolveMediaPath(row?.heroVideoPath);
  const customPoster = resolveMediaPath(row?.heroPosterPath);

  return {
    ...toContactDetails(row, siteConfig),
    heroVideo: customVideo
      ? { mp4: customVideo, webm: null, poster: customPoster }
      : { mp4: bundled.mp4, webm: bundled.webm, poster: customPoster ?? bundled.poster },
  };
});
