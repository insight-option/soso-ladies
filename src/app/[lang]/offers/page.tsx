import type { Metadata } from 'next';
import { WhatsAppButton } from '@/components/cta/ContactLinks';
import { CtaBanner } from '@/components/sections/CtaBanner';
import { OfferCard } from '@/components/sections/OfferCard';
import { PageHeader } from '@/components/sections/PageHeader';
import { Icon } from '@/components/ui/Icon';
import { resolveLocale, type LangParams } from '@/i18n/params';
import { localizePath } from '@/i18n/routes';
import { getOffers, getServices } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 60;

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

      <div className="container-page">
        {offers.length > 0 ? (
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
        ) : (
          <div className="mx-auto max-w-xl rounded-card bg-white px-6 py-12 text-center shadow-soft ring-1 ring-line/70 sm:px-10">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-blush text-magenta">
              <Icon name="tag" className="size-7" />
            </span>
            <h2 className="mt-5 text-[1.75rem] leading-tight sm:text-3xl">{dict.offersPage.emptyTitle}</h2>
            <p className="mt-3 text-muted">{dict.offersPage.emptyText}</p>
            <WhatsAppButton
              label={dict.common.askOnWhatsApp}
              newTabHint={dict.common.opensInNewTab}
              className="mt-7"
            />
          </div>
        )}
      </div>

      {offers.length > 0 ? <CtaBanner dict={dict} /> : null}
    </>
  );
}
