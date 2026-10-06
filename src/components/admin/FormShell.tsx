'use client';

import type { FormEvent, ReactNode } from 'react';
import { buttonClasses } from '@/components/ui/button';
import { Icon } from '@/components/ui/Icon';
import { useFeedback } from './feedback';
import { Spinner } from './fields';
import { t } from './strings';

/**
 * Form page frame: back button with unsaved-changes check, title, content and a
 * sticky save bar (kept above the mobile tab bar).
 */
export function FormShell({
  title,
  subtitle,
  dirty,
  saving,
  onSubmit,
  onBack,
  extraActions,
  children,
}: {
  title: string;
  subtitle?: string;
  dirty: boolean;
  saving: boolean;
  onSubmit: () => void;
  onBack?: () => void;
  extraActions?: ReactNode;
  children: ReactNode;
}) {
  const { confirm } = useFeedback();

  async function leave() {
    if (!onBack) return;
    if (dirty) {
      const ok = await confirm({
        title: t.unsavedTitle,
        message: t.unsavedMessage,
        confirmLabel: t.discard,
        cancelLabel: t.keepEditing,
      });
      if (!ok) return;
    }
    onBack();
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!saving) onSubmit();
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="mb-6 flex flex-wrap items-start gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={() => void leave()}
            aria-label={t.back}
            className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-plum shadow-soft ring-1 ring-line hover:bg-blush"
          >
            <Icon name="arrow" back className="size-5" />
          </button>
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="text-[1.75rem] leading-tight sm:text-[2.25rem]">{title}</h1>
          {subtitle ? <p className="mt-1 text-muted">{subtitle}</p> : null}
        </div>
        {extraActions}
      </div>

      <div className="space-y-5">{children}</div>

      <div className="sticky bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-20 mt-6 -mx-4 border-t border-line bg-cream/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-4 lg:bottom-4">
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className={buttonClasses({ size: 'md' })}>
            {saving ? <Spinner className="size-4" /> : <Icon name="check" className="size-5" />}
            {saving ? t.saving : t.saveChanges}
          </button>
          {onBack ? (
            <button
              type="button"
              onClick={() => void leave()}
              disabled={saving}
              className={buttonClasses({ variant: 'outline', size: 'md' })}
            >
              {t.cancel}
            </button>
          ) : null}
          {dirty && !saving ? (
            <span className="ms-auto hidden text-xs text-muted sm:inline">{t.unsavedTitle}</span>
          ) : null}
        </div>
      </div>
    </form>
  );
}
