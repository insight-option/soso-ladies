import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';

export type Crumb = { label: string; href?: string };

export function Breadcrumb({ items, label }: { items: Crumb[]; label: string }) {
  return (
    <nav aria-label={label}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 ? <Icon name="chevron" className="size-3.5 opacity-60" /> : null}
            {item.href ? (
              <Link href={item.href} className="rounded transition-colors hover:text-magenta">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-plum">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
