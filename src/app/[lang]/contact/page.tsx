import type { Metadata } from 'next';
import { ContactList } from '@/components/cta/ContactList';
import { CallButton, WhatsAppButton } from '@/components/cta/ContactLinks';
import { PageHeader } from '@/components/sections/PageHeader';
import { Logo } from '@/components/ui/Logo';
import { siteConfig } from '@/config/site';
import { format } from '@/i18n/dictionaries';
import { resolveLocale, type LangParams } from '@/i18n/params';
import { localizePath } from '@/i18n/routes';
import { getSettings } from '@/lib/content';
import { locationLabel } from '@/lib/location';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: LangParams }): Promise<Metadata> {
  const { locale, dict } = await resolveLocale(params);
  return pageMetadata({
    locale,
    path: '/contact',
    title: dict.meta.contact.title,
    description: format(dict.meta.contact.description, { phone: siteConfig.phone.display }),
  });
}

export default async function ContactPage({ params }: { params: LangParams }) {
  const { locale, dict } = await resolveLocale(params);
  const settings = await getSettings();
  const location = locationLabel(locale, dict.footer.location);

  return (
    <>
      <PageHeader
        breadcrumbLabel={dict.common.breadcrumbLabel}
        breadcrumb={[{ label: dict.nav.home, href: localizePath(locale, '/') }, { label: dict.nav.contact }]}
        title={dict.contact.title}
        subtitle={dict.contact.subtitle}
      />

      <div className="container-page grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
        <ContactList
          locale={locale}
          details={settings}
          labels={dict.contact}
          newTabHint={dict.common.opensInNewTab}
        />

        <aside
          aria-label={dict.meta.siteName}
          className="flex flex-col items-center rounded-card bg-blush px-6 py-10 text-center sm:px-10 lg:self-start"
        >
          <Logo alt={dict.meta.siteName} className="h-40 sm:h-48" sizes="150px" />
          <p className="mt-6 max-w-xs text-muted">{dict.footer.tagline}</p>
          {location ? <p className="mt-2 text-sm font-medium text-plum">{location}</p> : null}
          <div className="mt-7 grid w-full gap-3 min-[400px]:grid-cols-2">
            <WhatsAppButton label={dict.common.whatsapp} newTabHint={dict.common.opensInNewTab} full />
            <CallButton label={dict.common.callNow} full />
          </div>
        </aside>
      </div>
    </>
  );
}
