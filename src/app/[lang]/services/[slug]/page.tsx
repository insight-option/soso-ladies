import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CallButton, WhatsAppButton } from '@/components/cta/ContactLinks';
import { CtaBanner } from '@/components/sections/CtaBanner';
import { ServiceCard } from '@/components/sections/ServiceCard';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Icon, type IconName } from '@/components/ui/Icon';
import { MediaImage } from '@/components/ui/MediaImage';
import { format } from '@/i18n/dictionaries';
import { resolveLocale } from '@/i18n/params';
import { localizePath } from '@/i18n/routes';
import { getService, getServices } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 60;
// Services added from /admin after the build get their page on first request.
export const dynamicParams = true;

type Params = Promise<{ lang: string; slug: string }>;

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, dict } = await resolveLocale(params);
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return {};
  return pageMetadata({
    locale,
    path: `/services/${service.slug}`,
    title: format(dict.meta.serviceTitle, { name: service.name[locale] }),
    description: service.intro[locale] || service.summary[locale],
    image: service.image,
  });
}

export default async function ServicePage({ params }: { params: Params }) {
  const { locale, dict } = await resolveLocale(params);
  const { slug } = await params;
  const [service, services] = await Promise.all([getService(slug), getServices()]);
  if (!service) notFound();

  const others = services.filter((s) => s.slug !== service.slug);
  const name = service.name[locale];
  const whatsappMessage = format(dict.whatsappMessages.service, { service: name });
  const availability: Array<{ key: string; icon: IconName; label: string }> = [
    ...(service.availability.salon ? [{ key: 'salon', icon: 'chair' as const, label: dict.serviceDetail.availableSalon }] : []),
    ...(service.availability.home ? [{ key: 'home', icon: 'home' as const, label: dict.serviceDetail.availableHome }] : []),
  ];

  return (
    <>
      <div className="container-page pt-6 sm:pt-8">
        <Breadcrumb
          label={dict.common.breadcrumbLabel}
          items={[
            { label: dict.nav.home, href: localizePath(locale, '/') },
            { label: dict.nav.services, href: localizePath(locale, '/services') },
            { label: name },
          ]}
        />
      </div>

      <article className="container-page mt-5 grid gap-7 sm:mt-8 sm:gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:grid-rows-[auto_1fr] lg:gap-x-14 lg:gap-y-8">
        {/* Hero image: first on mobile (shorter 4:3 crop), a tall 4:5 column on desktop. */}
        <MediaImage
          src={service.image}
          alt={name}
          icon={service.icon}
          sizes="(min-width: 1216px) 500px, (min-width: 1024px) 42vw, 100vw"
          preload
          className="aspect-[4/3] rounded-[1.75rem] shadow-soft sm:aspect-[16/10] lg:sticky lg:top-32 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:aspect-[4/5] lg:self-start"
        />

        <header className="lg:col-start-2 lg:row-start-1">
          <span className="inline-grid size-12 place-items-center rounded-full bg-blush text-magenta">
            <Icon name={service.icon} className="size-6" />
          </span>
          <h1 className="mt-4 text-[2.5rem] leading-tight sm:text-5xl">{name}</h1>
          {service.intro[locale] ? (
            <p className="mt-4 max-w-xl text-lg text-muted sm:text-xl">{service.intro[locale]}</p>
          ) : null}
        </header>

        <div className="space-y-10 lg:col-start-2 lg:row-start-2">
          {service.highlights.length > 0 ? (
            <section aria-labelledby="highlights-title">
              <h2 id="highlights-title" className="sr-only">
                {dict.serviceDetail.highlightsTitle}
              </h2>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {service.highlights.map((highlight) => (
                  <li
                    key={highlight.label.en}
                    className="flex flex-col items-center gap-2.5 rounded-2xl bg-white px-3 py-5 text-center shadow-soft ring-1 ring-line/70"
                  >
                    <span className="grid size-11 place-items-center rounded-full bg-blush text-magenta">
                      <Icon name={highlight.icon} className="size-5" />
                    </span>
                    <span className="text-sm font-medium text-plum">{highlight.label[locale]}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {service.items.length > 0 ? (
            <section aria-labelledby="items-title">
              <h2 id="items-title" className="text-[1.75rem] leading-tight sm:text-3xl">
                {format(dict.serviceDetail.itemsTitle, { name })}
              </h2>
              <ul className="mt-5 divide-y divide-line overflow-hidden rounded-card bg-white shadow-soft ring-1 ring-line/70">
                {service.items.map((item) => (
                  <li key={item.name.en} className="flex items-center gap-4 p-4 sm:px-5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-blush text-magenta">
                      <Icon name={service.icon} className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-plum">{item.name[locale]}</span>
                      {item.summary ? <span className="block text-sm text-muted">{item.summary[locale]}</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {availability.length > 0 ? (
            <section aria-labelledby="availability-title">
              <h2 id="availability-title" className="text-[1.375rem] leading-tight sm:text-2xl">
                {dict.serviceDetail.availabilityTitle}
              </h2>
              <ul className="mt-4 flex flex-wrap gap-3">
                {availability.map((option) => (
                  <li
                    key={option.key}
                    className="flex items-center gap-2.5 rounded-full bg-white py-2 ps-2 pe-4 shadow-soft ring-1 ring-line/70"
                  >
                    <span className="grid size-9 place-items-center rounded-full bg-blush text-magenta">
                      <Icon name={option.icon} className="size-[1.125rem]" />
                    </span>
                    <span className="text-[0.9375rem] font-medium text-plum">{option.label}</span>
                    <Icon name="check" className="size-4 text-magenta" />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="grid gap-3 sm:flex">
            <WhatsAppButton
              label={dict.common.askOnWhatsApp}
              newTabHint={dict.common.opensInNewTab}
              message={whatsappMessage}
              size="lg"
              full
              className="sm:w-auto sm:px-7"
            />
            <CallButton label={dict.common.callNow} size="lg" full className="sm:w-auto sm:px-7" />
          </div>
        </div>
      </article>

      {others.length > 0 ? (
        <section aria-labelledby="other-services-title" className="container-page pt-16 sm:pt-20">
          <h2 id="other-services-title" className="text-[2rem] leading-tight sm:text-[2.5rem]">
            {dict.serviceDetail.otherServices}
          </h2>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {others.map((other) => (
              <li key={other.slug}>
                <ServiceCard
                  service={other}
                  locale={locale}
                  detailsLabel={dict.common.viewDetails}
                  sizes="(min-width: 1216px) 280px, (min-width: 768px) 23vw, 47vw"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <CtaBanner
        dict={dict}
        title={format(dict.serviceDetail.ctaTitle, { name })}
        text={dict.serviceDetail.ctaText}
        whatsappMessage={whatsappMessage}
      />
    </>
  );
}
