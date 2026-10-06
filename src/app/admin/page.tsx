import { AdminApp } from '@/components/admin/AdminApp';
import type { SeedService } from '@/components/admin/store';
import { t } from '@/components/admin/strings';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { services } from '@/config/services';
import { siteConfig } from '@/config/site';
import { readAmplifyOutputs } from '@/lib/amplify-server';

// Reads amplify_outputs.json on every request (it appears after the backend deploys).
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const outputs = await readAmplifyOutputs();

  if (!outputs) {
    return (
      <main className="grid min-h-dvh place-items-center p-4">
        <div className="w-full max-w-lg rounded-card bg-white p-6 text-center shadow-lift ring-1 ring-line sm:p-10">
          <Logo alt={t.siteName} className="mx-auto h-28" sizes="85px" />
          <span className="mx-auto mt-6 grid size-12 place-items-center rounded-full bg-blush text-magenta">
            <Icon name="alert" className="size-6" />
          </span>
          <h1 className="mt-4 text-[1.75rem] leading-tight">{t.missing.title}</h1>
          <p className="mt-3 text-muted">{t.missing.text}</p>
          <ul className="mt-5 space-y-2 text-start text-sm text-ink">
            {t.missing.steps.map((step) => (
              <li key={step} className="flex gap-2">
                <Icon name="check" className="mt-0.5 size-4 shrink-0 text-magenta" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    );
  }

  // Built-in services offered by the one-time "Import current services" button.
  const seedServices: SeedService[] = services.map((service) => ({
    slug: service.slug,
    nameEn: service.name.en,
    nameAr: service.name.ar,
    summaryEn: service.summary.en,
    summaryAr: service.summary.ar,
    introEn: service.intro.en,
    introAr: service.intro.ar,
    imagePath: service.image,
    icon: service.icon,
  }));

  return <AdminApp outputs={outputs} seedServices={seedServices} phoneDisplay={siteConfig.phone.display} />;
}
