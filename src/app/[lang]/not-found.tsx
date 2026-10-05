import type { Metadata } from 'next';
import Link from 'next/link';
import { lang } from 'next/root-params';
import { WhatsAppButton } from '@/components/cta/ContactLinks';
import { buttonClasses } from '@/components/ui/button';
import { Icon } from '@/components/ui/Icon';
import { defaultLocale, isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { localizePath } from '@/i18n/routes';

async function currentLocale() {
  const value = await lang();
  return value && isLocale(value) ? value : defaultLocale;
}

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDictionary(await currentLocale());
  return { title: dict.meta.notFound.title };
}

export default async function NotFound() {
  const locale = await currentLocale();
  const dict = getDictionary(locale);

  return (
    <div className="container-page py-16 sm:py-24">
      <div className="mx-auto max-w-xl rounded-card bg-white px-6 py-12 text-center shadow-soft ring-1 ring-line/70 sm:px-10">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-blush text-magenta">
          <Icon name="flower" className="size-7" />
        </span>
        <p className="mt-5 font-display text-5xl text-magenta">404</p>
        <h1 className="mt-3 text-[1.75rem] leading-tight sm:text-3xl">{dict.notFound.title}</h1>
        <p className="mt-3 text-muted">{dict.notFound.text}</p>
        <div className="mt-8 grid gap-3 min-[400px]:grid-cols-2">
          <Link href={localizePath(locale, '/')} className={buttonClasses({ variant: 'outline', full: true })}>
            {dict.notFound.backHome}
          </Link>
          <WhatsAppButton label={dict.common.whatsapp} newTabHint={dict.common.opensInNewTab} full />
        </div>
      </div>
    </div>
  );
}
