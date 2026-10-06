import type { Metadata } from 'next';
import { CtaBanner } from '@/components/sections/CtaBanner';
import { Hero } from '@/components/sections/Hero';
import { OfferCard } from '@/components/sections/OfferCard';
import { ServiceCard } from '@/components/sections/ServiceCard';
import { ServiceModes } from '@/components/sections/ServiceModes';
import { TrustStrip } from '@/components/sections/TrustStrip';
import { ArrowLink, SectionHeading } from '@/components/ui/SectionHeading';
import { resolveLocale, type LangParams } from '@/i18n/params';
import { localizePath } from '@/i18n/routes';
import { getOffers, getServices, getSettings } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: LangParams }): Promise<Metadata> {
  const { locale, dict } = await resolveLocale(params);
  return pageMetadata({
    locale,
    path: '/',
    title: dict.meta.home.title,
    description: dict.meta.home.description,
    absoluteTitle: true,
  });
}

export default async function HomePage({ params }: { params: LangParams }) {
  const { locale, dict } = await resolveLocale(params);
  const [services, offers, settings] = await Promise.all([getServices(), getOffers(), getSettings()]);
  const servicesBySlug = new Map(services.map((service) => [service.slug, service]));

  return (
    <>
      <Hero dict={dict} video={settings.heroVideo} />

      <div className="container-page">
        <TrustStrip dict={dict} />
      </div>

      <section aria-labelledby="services-title" className="container-page py-16 sm:py-20">
        <SectionHeading
          id="services-title"
          title={dict.servicesSection.title}
          subtitle={dict.servicesSection.subtitle}
          action={<ArrowLink href={localizePath(locale, '/services')}>{dict.common.viewAllServices}</ArrowLink>}
        />
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
          {services.map((service) => (
            <li key={service.slug}>
              <ServiceCard
                service={service}
                locale={locale}
                detailsLabel={dict.common.viewDetails}
                homeLabel={dict.common.availableAtHome}
                sizes="(min-width: 1216px) 220px, (min-width: 1024px) 19vw, (min-width: 768px) 31vw, 47vw"
              />
            </li>
          ))}
        </ul>
      </section>

      <ServiceModes dict={dict} locale={locale} services={services} />

      {offers.length > 0 ? (
        <section aria-labelledby="offers-title" className="container-page pt-16 sm:pt-20">
          <SectionHeading
            id="offers-title"
            title={dict.offersSection.title}
            subtitle={dict.offersSection.subtitle}
            action={<ArrowLink href={localizePath(locale, '/offers')}>{dict.common.viewAllOffers}</ArrowLink>}
          />
          <ul className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
            {offers.slice(0, 4).map((offer) => (
              <li key={offer.id}>
                <OfferCard
                  offer={offer}
                  service={offer.serviceSlug ? servicesBySlug.get(offer.serviceSlug) : undefined}
                  locale={locale}
                  dict={dict}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <CtaBanner dict={dict} />
    </>
  );
}
