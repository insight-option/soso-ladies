'use client';

import Image from 'next/image';
import { useId, useRef, useState, type DragEvent } from 'react';
import { buttonClasses } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { cx } from '@/lib/cx';
import { resolveMediaPath } from '@/lib/media';
import { Spinner } from './fields';
import {
  IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  prepareImage,
  removeMedia,
  uploadMedia,
  type MediaFolder,
  type PendingFile,
} from './media-client';
import { t } from './strings';

/** Stored path plus an optional new file that is uploaded when the form is saved. */
export type ImageValue = { path: string | null; pending: PendingFile | null };

const aspectClass = {
  '4/5': 'aspect-[4/5] w-40 sm:w-44',
  '4/3': 'aspect-[4/3] w-56 sm:w-64',
  '16/9': 'aspect-video w-full max-w-md',
} as const;

/** Uploads the pending file (if any) and returns the path to store. */
export async function commitImage(value: ImageValue, folder: MediaFolder, nameHint: string): Promise<string | null> {
  if (value.pending) return uploadMedia(folder, nameHint, value.pending);
  return value.path;
}

/** After a successful save, deletes the previous upload if it was replaced or removed. */
export async function cleanupReplacedImage(previousPath: string | null | undefined, savedPath: string | null) {
  if (previousPath && previousPath !== savedPath) await removeMedia(previousPath);
}

export function ImageField({
  label,
  hint,
  value,
  onChange,
  aspect,
  placeholderIcon = 'image',
}: {
  label: string;
  hint?: string;
  value: ImageValue;
  onChange: (value: ImageValue) => void;
  aspect: keyof typeof aspectClass;
  placeholderIcon?: IconName;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const src = value.pending?.previewUrl ?? resolveMediaPath(value.path);

  async function accept(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!IMAGE_TYPES.includes(file.type)) return setError(t.image.wrongType);
    if (file.size > MAX_IMAGE_BYTES) return setError(t.image.tooLarge);
    setProcessing(true);
    try {
      const pending = await prepareImage(file);
      if (value.pending) URL.revokeObjectURL(value.pending.previewUrl);
      onChange({ path: value.path, pending });
    } catch {
      setError(t.image.processFailed);
    } finally {
      setProcessing(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    void accept(event.dataTransfer.files[0]);
  }

  function clear() {
    if (value.pending) URL.revokeObjectURL(value.pending.previewUrl);
    onChange({ path: null, pending: null });
  }

  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-plum">{label}</legend>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
          className={cx(
            'relative shrink-0 overflow-hidden rounded-2xl bg-blush ring-1 ring-line',
            aspectClass[aspect],
          )}
        >
          {src ? (
            <Image src={src} alt={t.image.previewLabel} fill unoptimized sizes="256px" className="object-cover" />
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <span className="grid size-14 place-items-center rounded-full bg-white/80 text-magenta">
                <Icon name={placeholderIcon} className="size-6" />
              </span>
            </div>
          )}
          {processing ? (
            <div className="absolute inset-0 grid place-items-center bg-white/70" role="status">
              <span className="flex items-center gap-2 text-sm text-plum">
                <Spinner className="size-4 text-magenta" />
                {t.image.processing}
              </span>
            </div>
          ) : null}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap gap-2">
            <label htmlFor={inputId} className={buttonClasses({ variant: 'soft', size: 'sm', className: 'cursor-pointer' })}>
              <Icon name="upload" className="size-4" />
              {src ? t.image.replace : t.image.choose}
            </label>
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept={IMAGE_TYPES.join(',')}
              className="sr-only"
              onChange={(event) => void accept(event.target.files?.[0])}
            />
            {src ? (
              <button type="button" onClick={clear} className={buttonClasses({ variant: 'outline', size: 'sm' })}>
                <Icon name="trash" className="size-4" />
                {t.image.remove}
              </button>
            ) : null}
          </div>
          {hint ? <p className="text-xs text-muted">{hint}</p> : null}
          <p className="text-xs text-muted">{src ? t.image.hint : t.image.placeholder}</p>
          {error ? (
            <p role="alert" className="text-xs font-medium text-[#9b1c1c]">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </fieldset>
  );
}
