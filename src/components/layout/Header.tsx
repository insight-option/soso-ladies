import Link from 'next/link';
import { CallButton, WhatsAppButton } from '@/components/cta/ContactLinks';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { NavLinks, type NavLink } from '@/components/layout/NavLinks';
import { Logo } from '@/components/ui/Logo';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { localizePath } from '@/i18n/routes';
import { navItems } from '@/lib/nav';

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const homeHref = localizePath(locale, '/');
  const links: NavLink[] = navItems.map((item) => ({
    href: localizePath(locale, item.path),
    path: item.path,
    label: dict.nav[item.key],
  }));

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-cream">
      <div className="container-page flex h-[4.5rem] items-center gap-3 lg:h-24 lg:gap-6">
        <Link href={homeHref} className="shrink-0 rounded-lg">
          <Logo alt={dict.nav.homeLinkLabel} className="h-14 lg:h-[4.75rem]" sizes="(min-width: 1024px) 58px, 44px" eager />
        </Link>

        <div className="flex flex-1 justify-center">
          <NavLinks links={links} label={dict.nav.primaryLabel} />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher locale={locale} label={dict.language.switchTo} />
          <div className="hidden items-center gap-2 lg:flex">
            <WhatsAppButton label={dict.common.whatsapp} newTabHint={dict.common.opensInNewTab} size="sm" />
            <CallButton label={dict.common.callNow} size="sm" />
          </div>
          <MobileMenu
            locale={locale}
            links={links}
            homeHref={homeHref}
            labels={{
              open: dict.nav.openMenu,
              close: dict.nav.closeMenu,
              title: dict.nav.menuTitle,
              home: dict.nav.homeLinkLabel,
              nav: dict.nav.primaryLabel,
              language: dict.language.switchTo,
              whatsapp: dict.common.whatsapp,
              callNow: dict.common.callNow,
              newTab: dict.common.opensInNewTab,
            }}
          />
        </div>
      </div>
    </header>
  );
}
