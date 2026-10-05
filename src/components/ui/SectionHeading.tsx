import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';

export function SectionHeading({
  id,
  title,
  subtitle,
  eyebrow,
  action,
}: {
  /** id of the heading, for aria-labelledby on the section. */
  id: string;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
        <h2 id={id} className="text-[2rem] leading-tight sm:text-[2.5rem]">
          {title}
        </h2>
        {subtitle ? <p className="mt-2 text-muted sm:text-lg">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

/** "View all →" style link. */
export function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 self-start rounded-md text-[0.9375rem] font-semibold text-magenta transition-colors hover:text-magenta-hover sm:self-auto"
    >
      {children}
      <Icon
        name="arrow"
        className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
      />
    </Link>
  );
}
