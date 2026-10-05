'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { buttonClasses } from '@/components/ui/button';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/cx';
import { t } from './strings';

type Toast = { id: number; tone: 'success' | 'error'; message: string };

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'danger' | 'default';
};

type Feedback = {
  toast: (tone: Toast['tone'], message: string) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const FeedbackContext = createContext<Feedback | null>(null);

export function useFeedback(): Feedback {
  const value = useContext(FeedbackContext);
  if (!value) throw new Error('useFeedback must be used inside <FeedbackProvider>');
  return value;
}

/** Toast notifications (aria-live) and a promise-based confirmation dialog. */
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [request, setRequest] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((item) => item.id !== id)), []);

  const toast = useCallback<Feedback['toast']>(
    (tone, message) => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-2), { id, tone, message }]);
      window.setTimeout(() => dismiss(id), tone === 'error' ? 7000 : 4000);
    },
    [dismiss],
  );

  const confirm = useCallback<Feedback['confirm']>(
    (options) => new Promise<boolean>((resolve) => setRequest({ ...options, resolve })),
    [],
  );

  useEffect(() => {
    if (request) dialogRef.current?.showModal();
  }, [request]);

  function settle(ok: boolean) {
    request?.resolve(ok);
    dialogRef.current?.close();
    setRequest(null);
  }

  return (
    <FeedbackContext.Provider value={{ toast, confirm }}>
      {children}

      <dialog
        ref={dialogRef}
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        onCancel={(event) => {
          event.preventDefault();
          settle(false);
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-card bg-white p-0 text-ink shadow-lift backdrop:bg-plum/30 backdrop:backdrop-blur-[2px]"
      >
        {request ? (
          <div className="p-6 sm:p-7">
            <h2 id="confirm-title" className="text-2xl">
              {request.title}
            </h2>
            <p id="confirm-message" className="mt-2 text-muted">
              {request.message}
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                autoFocus
                onClick={() => settle(false)}
                className={buttonClasses({ variant: 'outline', size: 'sm' })}
              >
                {request.cancelLabel ?? t.cancel}
              </button>
              <button
                type="button"
                onClick={() => settle(true)}
                className={buttonClasses({
                  size: 'sm',
                  className: request.tone === 'danger' ? 'bg-[#9b1c1c] hover:bg-[#7f1515]' : undefined,
                })}
              >
                {request.confirmLabel}
              </button>
            </div>
          </div>
        ) : null}
      </dialog>

      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cx(
              'pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl px-4 py-3 text-sm shadow-lift ring-1',
              item.tone === 'success' ? 'bg-white text-ink ring-line' : 'bg-[#fdf2f2] text-[#7f1515] ring-[#f3c9c9]',
            )}
          >
            <Icon
              name={item.tone === 'success' ? 'check' : 'alert'}
              className={cx('mt-0.5 size-5 shrink-0', item.tone === 'success' ? 'text-magenta' : 'text-[#9b1c1c]')}
            />
            <p className="flex-1">{item.message}</p>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label={t.dismiss}
              className="-m-1 grid size-7 shrink-0 place-items-center rounded-full hover:bg-black/5"
            >
              <Icon name="close" className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </FeedbackContext.Provider>
  );
}
