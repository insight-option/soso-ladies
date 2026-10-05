import type { Metadata } from 'next';
import { CtaBanner } from '@/components/sections/CtaBanner';
import { PageHeader } from '@/components/sections/PageHeader';
import { ServiceRow } from '@/components/sections/ServiceCard';
import { resolveLocale, type LangParams } from '@/i18n/params';
import { localizePath } from '@/i18n/routes';
import { getServices } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: LangParams }): Promise<Metadata> {
  const { locale, dict } = await resolveLocale(params);
  return pageMetadata({
    locale,
    path: '/services',
    title: dict.meta.services.title,
    description: dict.meta.services.description,
  });
}

export default async function ServicesPage({ params }: { params: LangParams }) {
  const { locale, dict } = await resolveLocale(params);
  const services = await getServices();

  return (
    <>
      <PageHeader
        breadcrumbLabel={dict.common.breadcrumbLabel}
        breadcrumb={[{ label: dict.nav.home, href: localizePath(locale, '/') }, { label: dict.nav.services }]}
        title={dict.servicesPage.title}
        subtitle={dict.servicesPage.subtitle}
      />
      <div className="container-page">
        <ul className="grid gap-4 sm:gap-5 md:grid-cols-2">
          {services.map((service) => (
            <li key={service.slug}>
              <ServiceRow service={service} locale={locale} detailsLabel={dict.common.viewDetails} />
            </li>
          ))}
        </ul>
      </div>
      <CtaBanner dict={dict} />
    </>
  );
}
