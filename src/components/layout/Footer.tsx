import Link from 'next/link';
import { ContactList } from '@/components/cta/ContactList';
import { Logo } from '@/components/ui/Logo';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { localizePath } from '@/i18n/routes';
import type { Service, SiteSettings } from '@/lib/content';
import { locationLabel } from '@/lib/location';
import { navItems } from '@/lib/nav';

const headingClass = 'mb-4 font-sans text-xs font-semibold tracking-[0.18em] text-gold-ink uppercase';
const linkClass = 'rounded text-[0.9375rem] text-ink transition-colors hover:text-magenta';

export function Footer({
  locale,
  dict,
  services,
  settings,
}: {
  locale: Locale;
  dict: Dictionary;
  services: Service[];
  settings: SiteSettings;
}) {
  const year = new Date().getFullYear();
  const location = locationLabel(locale, dict.footer.location);

  return (
    <footer className="mt-16 border-t border-line bg-blush/50 sm:mt-24">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_1fr_1.2fr] lg:gap-12">
        <div>
          <Link href={localizePath(locale, '/')} className="inline-block rounded-lg">
            <Logo alt={dict.nav.homeLinkLabel} className="h-28" sizes="85px" />
          </Link>
          <p className="mt-4 max-w-xs text-[0.9375rem] text-muted">{dict.footer.tagline}</p>
          {location ? <p className="mt-2 text-sm font-medium text-plum">{location}</p> : null}
        </div>

        <nav aria-labelledby="footer-explore">
          <h2 id="footer-explore" className={headingClass}>
            {dict.footer.explore}
          </h2>
          <ul className="space-y-2.5">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link href={localizePath(locale, item.path)} className={linkClass}>
                  {dict.nav[item.key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-services">
          <h2 id="footer-services" className={headingClass}>
            {dict.footer.services}
          </h2>
          <ul className="space-y-2.5">
            {services.map((service) => (
              <li key={service.slug}>
                <Link href={localizePath(locale, `/services/${service.slug}`)} className={linkClass}>
                  {service.name[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className={headingClass}>{dict.footer.contact}</h2>
          <ContactList
            locale={locale}
            details={settings}
            labels={dict.contact}
            newTabHint={dict.common.opensInNewTab}
            variant="compact"
          />
        </div>
      </div>

      <div className="border-t border-line">
        <p className="container-page py-6 text-sm text-muted">
          © {year} {dict.meta.siteName}. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
