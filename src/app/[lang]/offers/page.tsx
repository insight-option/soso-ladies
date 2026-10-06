import type { Metadata } from 'next';
import { WhatsAppButton } from '@/components/cta/ContactLinks';
import { CtaBanner } from '@/components/sections/CtaBanner';
import { OfferCard } from '@/components/sections/OfferCard';
import { PageHeader } from '@/components/sections/PageHeader';
import { ServiceCard } from '@/components/sections/ServiceCard';
import { Icon } from '@/components/ui/Icon';
import { resolveLocale, type LangParams } from '@/i18n/params';
import { localizePath } from '@/i18n/routes';
import { getOffers, getServices } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

// Rendered on every request so admin edits show up within ~60 s (see lib/content.ts).
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: LangParams }): Promise<Metadata> {
  const { locale, dict } = await resolveLocale(params);
  return pageMetadata({
    locale,
    path: '/offers',
    title: dict.meta.offers.title,
    description: dict.meta.offers.description,
  });
}

export default async function OffersPage({ params }: { params: LangParams }) {
  const { locale, dict } = await resolveLocale(params);
  const [offers, services] = await Promise.all([getOffers(), getServices()]);
  const servicesBySlug = new Map(services.map((service) => [service.slug, service]));

  return (
    <>
      <PageHeader
        breadcrumbLabel={dict.common.breadcrumbLabel}
        breadcrumb={[{ label: dict.nav.home, href: localizePath(locale, '/') }, { label: dict.nav.offers }]}
        title={dict.offersPage.title}
        subtitle={dict.offersPage.subtitle}
      />

      {offers.length > 0 ? (
        <>
          <div className="container-page">
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {offers.map((offer) => (
                <li key={offer.id}>
                  <OfferCard
                    offer={offer}
                    service={offer.serviceSlug ? servicesBySlug.get(offer.serviceSlug) : undefined}
                    locale={locale}
                    dict={dict}
                    headingLevel="h2"
                  />
                </li>
              ))}
            </ul>
          </div>
          <CtaBanner dict={dict} />
        </>
      ) : (
        <>
          {/* No active offers: an intentional "coming soon" panel, never an empty grid. */}
          <section aria-labelledby="offers-soon-title" className="container-page">
            <div className="relative overflow-hidden rounded-[1.75rem] bg-blush px-6 py-12 text-center sm:px-12 sm:py-16">
              <Icon
                name="lotus"
                className="pointer-events-none absolute -start-10 -top-10 size-44 text-blush-deep sm:size-56"
              />
              <Icon
                name="lotus"
                className="pointer-events-none absolute -end-8 -bottom-12 size-40 text-blush-deep sm:size-52"
              />
              <div className="relative mx-auto max-w-lg">
                <span className="mx-auto grid size-16 place-items-center rounded-full bg-white text-magenta shadow-soft">
                  <Icon name="tag" className="size-7" />
                </span>
                <h2 id="offers-soon-title" className="mt-6 text-[2rem] leading-tight sm:text-[2.5rem]">
                  {dict.offersPage.emptyTitle}
                </h2>
                <p className="mt-3 text-lg text-muted">{dict.offersPage.emptyText}</p>
                <WhatsAppButton
                  label={dict.offersPage.emptyCta}
                  newTabHint={dict.common.opensInNewTab}
                  message={dict.whatsappMessages.latestOffers}
                  className="mt-8"
                />
              </div>
            </div>
          </section>

          <section aria-labelledby="offers-services-title" className="container-page pt-14 sm:pt-16">
            <h2 id="offers-services-title" className="text-[1.75rem] leading-tight sm:text-[2rem]">
              {dict.offersPage.emptyServices}
            </h2>
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
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
        </>
      )}
    </>
  );
}
