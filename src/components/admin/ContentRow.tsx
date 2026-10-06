'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import { Icon, type IconName } from '@/components/ui/Icon';
import { cx } from '@/lib/cx';
import { resolveMediaPath } from '@/lib/media';
import { Toggle } from './fields';
import { t } from './strings';

/** One row in the services/offers lists: drag handle, thumbnail, text and actions. */
export function ContentRow({
  handle,
  imagePath,
  aspect,
  placeholderIcon,
  title,
  subtitle,
  published,
  onTogglePublished,
  onEdit,
  onDelete,
}: {
  handle: ReactNode;
  imagePath: string | null | undefined;
  aspect: '4/5' | '4/3';
  placeholderIcon: IconName;
  title: string;
  subtitle: ReactNode;
  published: boolean;
  onTogglePublished: (published: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const src = resolveMediaPath(imagePath);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl bg-white p-2.5 pe-3 shadow-soft ring-1 ring-line/70">
      {handle}
      <div
        className={cx(
          'relative shrink-0 overflow-hidden rounded-lg bg-blush',
          aspect === '4/5' ? 'aspect-[4/5] w-12' : 'aspect-[4/3] w-16',
        )}
      >
        {src ? (
          <Image src={src} alt="" fill unoptimized sizes="64px" className="object-cover" />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-magenta">
            <Icon name={placeholderIcon} className="size-5" />
          </span>
        )}
      </div>
      <div className="min-w-[8rem] flex-1">
        <p className="truncate font-semibold text-plum">{title}</p>
        <div className="truncate text-xs text-muted">{subtitle}</div>
      </div>
      <div className="ms-auto flex items-center gap-1">
        <span className={cx('me-1 hidden text-xs sm:inline', published ? 'text-magenta' : 'text-muted')}>
          {published ? t.published : t.hidden}
        </span>
        <Toggle
          checked={published}
          onChange={onTogglePublished}
          label={`${t.publishToggle}: ${title}`}
          showLabel={false}
        />
        <button
          type="button"
          onClick={onEdit}
          aria-label={`${t.edit}: ${title}`}
          className="ms-1 grid size-10 place-items-center rounded-xl text-plum hover:bg-blush"
        >
          <Icon name="pencil" className="size-[1.125rem]" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`${t.delete}: ${title}`}
          className="grid size-10 place-items-center rounded-xl text-[#9b1c1c] hover:bg-[#fdf2f2]"
        >
          <Icon name="trash" className="size-[1.125rem]" />
        </button>
      </div>
    </div>
  );
}
