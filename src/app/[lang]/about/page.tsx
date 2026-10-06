import type { Metadata } from 'next';
import { CtaBanner } from '@/components/sections/CtaBanner';
import { PageHeader } from '@/components/sections/PageHeader';
import { TrustStrip } from '@/components/sections/TrustStrip';
import { Icon } from '@/components/ui/Icon';
import { MediaImage } from '@/components/ui/MediaImage';
import { resolveLocale, type LangParams } from '@/i18n/params';
import { localizePath } from '@/i18n/routes';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: LangParams }): Promise<Metadata> {
  const { locale, dict } = await resolveLocale(params);
  return pageMetadata({
    locale,
    path: '/about',
    title: dict.meta.about.title,
    description: dict.meta.about.description,
  });
}

export default async function AboutPage({ params }: { params: LangParams }) {
  const { locale, dict } = await resolveLocale(params);

  return (
    <>
      <PageHeader
        breadcrumbLabel={dict.common.breadcrumbLabel}
        breadcrumb={[{ label: dict.nav.home, href: localizePath(locale, '/') }, { label: dict.nav.about }]}
        title={dict.about.title}
      />

      <section className="container-page grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <div>
          <p className="font-display text-[1.75rem] leading-snug text-magenta sm:text-[2.125rem]">{dict.about.lead}</p>
          <p className="mt-5 text-lg text-muted">{dict.about.body}</p>
        </div>
        <MediaImage
          src="/images/about-salon.webp"
          alt={dict.about.imageAlt}
          sizes="(min-width: 1216px) 560px, (min-width: 1024px) 46vw, 100vw"
          preload
          className="aspect-[16/10] rounded-[1.75rem] shadow-soft"
        />
      </section>

      <div className="container-page pt-16 sm:pt-20">
        <TrustStrip dict={dict} title={dict.about.valuesTitle} />
      </div>

      <section aria-labelledby="commitment-title" className="container-page pt-16 sm:pt-20">
        <div className="flex flex-col gap-5 rounded-card bg-white p-6 shadow-soft ring-1 ring-line/70 sm:flex-row sm:items-start sm:p-10">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-blush text-magenta">
            <Icon name="heart" className="size-7" />
          </span>
          <div>
            <h2 id="commitment-title" className="text-[2rem] leading-tight sm:text-[2.5rem]">
              {dict.about.commitmentTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-lg text-muted">{dict.about.commitmentText}</p>
          </div>
        </div>
      </section>

      <CtaBanner dict={dict} />
    </>
  );
}
