import 'server-only';

import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import type { Schema } from '@amplify/data/resource';
import { isIconName } from '@/components/ui/Icon';
import { offers as staticOffers, type OfferData } from '@/config/offers';
import { services as staticServices, type ServiceDefinition } from '@/config/services';
import { siteConfig } from '@/config/site';
import type { Localized } from '@/i18n/config';
import { runAsGuest } from '@/lib/amplify-server';
import { localized, toContactDetails, type ContactDetails } from '@/lib/contact-details';
import { resolveMediaPath } from '@/lib/media';

/**
 * Content for the public site. Reads the admin database (as a guest) and falls
 * back to the static files in src/config whenever the backend is missing,
 * empty or unreachable, so local development and builds never break.
 *
 * Every database read runs inside `unstable_cache` (60 s). Amplify fetches the
 * guest credentials with `cache: 'no-store'`; outside a cache scope that would
 * make every page dynamic (rendered on each request) instead of ISR.
 */

const REVALIDATE_SECONDS = 60;

export type Service = ServiceDefinition;
export type { ContactDetails };

/** An offer as the UI renders it (static data and database rows normalize to this). */
export type Offer = {
  id: string;
  slug: string;
  title: Localized;
  description: Localized | null;
  badge: Localized | null;
  priceNow: number | null;
  priceWas: number | null;
  serviceSlug: string | null;
  image: string | null;
};

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

/** true/false when set in the database; undefined when null (not set yet). */
function optionalBoolean(value: boolean | null | undefined): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function price(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
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
 * keep the highlights and any confirmed treatments of the matching static
 * service. Salon/home availability comes from the database when set (true or
 * false); otherwise from the static config, which leaves it undefined unless
 * explicitly confirmed. Nothing is assumed.
 */
const loadServices = unstable_cache(
  async (): Promise<Service[]> => {
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
            items: base?.items,
            availableAtSalon: optionalBoolean(row.availableAtSalon) ?? base?.availableAtSalon,
            availableAtHome: optionalBoolean(row.availableAtHome) ?? base?.availableAtHome,
          },
        ];
      });
  },
  ['soso-content', 'services'],
  { revalidate: REVALIDATE_SECONDS, tags: ['services'] },
);

export const getServices = cache(() => loadServices());

export async function getService(slug: string): Promise<Service | undefined> {
  return (await getServices()).find((service) => service.slug === slug);
}

function fromStaticOffer(offer: OfferData): Offer {
  return {
    id: offer.id,
    slug: offer.slug,
    title: { en: offer.titleEn, ar: offer.titleAr },
    description: localized(offer.descriptionEn, offer.descriptionAr),
    badge: localized(offer.badgeEn, offer.badgeAr),
    priceNow: price(offer.offerPrice),
    priceWas: price(offer.originalPrice),
    serviceSlug: offer.service ?? null,
    image: resolveMediaPath(offer.image),
  };
}

/** Active offers in display order; empty until real offers exist. */
const loadOffers = unstable_cache(
  async (): Promise<Offer[]> => {
    const rows = await listOfferRows();
    if (!rows || rows.length === 0) return staticOffers.filter((offer) => offer.isActive).map(fromStaticOffer);

    return rows
      .filter(isPublished)
      .sort(bySortOrder)
      .flatMap((row): Offer[] => {
        const title = localized(row.titleEn, row.titleAr);
        if (!title) return [];
        return [
          {
            id: row.id,
            slug: row.id,
            title,
            description: localized(row.descriptionEn, row.descriptionAr),
            badge: localized(row.badgeEn, row.badgeAr),
            priceNow: price(row.priceNow),
            priceWas: price(row.priceWas),
            serviceSlug: row.serviceSlug || null,
            image: resolveMediaPath(row.imagePath),
          },
        ];
      });
  },
  ['soso-content', 'offers'],
  { revalidate: REVALIDATE_SECONDS, tags: ['offers'] },
);

export const getOffers = cache(() => loadOffers());

/** Contact details and hero media: database values first, then src/config/site.ts. */
const loadSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
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
  },
  ['soso-content', 'settings'],
  { revalidate: REVALIDATE_SECONDS, tags: ['settings'] },
);

export const getSettings = cache(() => loadSettings());
