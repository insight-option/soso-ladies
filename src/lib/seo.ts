import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { localeTags, locales, type Locale } from '@/i18n/config';
import { localizePath } from '@/i18n/routes';
import type { SiteSettings } from '@/lib/content';

const OG_IMAGE = { url: '/images/og.jpg', width: 1200, height: 630 };

type PageMetadataInput = {
  locale: Locale;
  /** Unprefixed path, e.g. "/services/facial". */
  path: string;
  title: string;
  description: string;
  /** Use the title as-is instead of the "… | SOSO Ladies Salon" template. */
  absoluteTitle?: boolean;
  /** Page-specific share image (path under /public or an /api/media URL). */
  image?: string | null;
};

/** Per-page metadata with canonical URL, hreflang alternates and Open Graph. */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  absoluteTitle = false,
  image,
}: PageMetadataInput): Metadata {
  const canonical = localizePath(locale, path);
  const siteName = siteConfig.name[locale];
  const images = [image ? { url: image } : { ...OG_IMAGE, alt: siteName }];

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, localizePath(l, path)])),
        'x-default': localizePath('en', path),
      },
    },
    openGraph: {
      type: 'website',
      url: canonical,
      siteName,
      title,
      description,
      locale: localeTags[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => localeTags[l]),
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map((i) => i.url),
    },
  };
}

/** BeautySalon structured data built only from supplied facts. */
export function beautySalonJsonLd(locale: Locale, settings: SiteSettings) {
  const url = new URL(localizePath(locale, '/'), siteConfig.url).toString();
  const sameAs = settings.instagram ? [settings.instagram.url] : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name: siteConfig.name[locale],
    alternateName: siteConfig.name[locale === 'en' ? 'ar' : 'en'],
    url,
    logo: new URL('/brand/logo.png', siteConfig.url).toString(),
    image: new URL(OG_IMAGE.url, siteConfig.url).toString(),
    telephone: siteConfig.phone.tel,
    address: {
      '@type': 'PostalAddress',
      ...(settings.address ? { streetAddress: settings.address[locale] } : {}),
      ...(siteConfig.city ? { addressLocality: siteConfig.city[locale] } : {}),
      addressCountry: siteConfig.countryCode,
    },
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.mapUrl ? { hasMap: settings.mapUrl } : {}),
    ...(sameAs ? { sameAs } : {}),
  };
}
