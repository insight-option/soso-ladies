import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { locales } from '@/i18n/config';
import { localizePath } from '@/i18n/routes';
import { getServices } from '@/lib/content';

export const revalidate = 60;

const absolute = (path: string) => new URL(path, siteConfig.url).toString();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const services = await getServices();
  const paths = [
    '/',
    '/services',
    ...services.map((service) => `/services/${service.slug}`),
    '/offers',
    '/about',
    '/contact',
  ];

  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: absolute(localizePath(locale, path)),
      changeFrequency: 'weekly' as const,
      priority: path === '/' ? 1 : path.startsWith('/services/') ? 0.7 : 0.8,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, absolute(localizePath(l, path))])),
      },
    })),
  );
}
