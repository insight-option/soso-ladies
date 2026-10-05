import { Breadcrumb, type Crumb } from '@/components/ui/Breadcrumb';

/** Breadcrumb, page title (h1) and optional intro for inner pages. */
export function PageHeader({
  breadcrumb,
  breadcrumbLabel,
  title,
  subtitle,
}: {
  breadcrumb: Crumb[];
  breadcrumbLabel: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="container-page pt-6 pb-8 sm:pt-8 sm:pb-10">
      <Breadcrumb items={breadcrumb} label={breadcrumbLabel} />
      <h1 className="mt-5 text-[2.5rem] leading-tight sm:text-5xl lg:text-[3.5rem]">{title}</h1>
      {subtitle ? <p className="mt-3 max-w-2xl text-lg text-muted">{subtitle}</p> : null}
    </div>
  );
}
