'use client';

import Image from 'next/image';
import { useId, useState } from 'react';
import { siteConfig } from '@/config/site';
import { buttonClasses } from '@/components/ui/button';
import { Icon } from '@/components/ui/Icon';
import { resolveMediaPath } from '@/lib/media';
import { useFeedback } from './feedback';
import { PageHeading, Panel, Spinner } from './fields';
import {
  IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  prepareImage,
  removeMedia,
  uploadMedia,
  type PendingFile,
} from './media-client';
import { useStore } from './store';
import { t } from './strings';

/** Grabs an early frame of a video file as a WebP poster (null if the browser can't). */
async function capturePoster(file: File): Promise<PendingFile | null> {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.src = url;
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error('video decode failed'));
    });
    video.currentTime = Math.min(0.1, video.duration || 0);
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
    });
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return null;
    return await prepareImage(new File([blob], 'poster.png', { type: 'image/png' }));
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function FilePicker({
  label,
  accept,
  disabled,
  onFile,
}: {
  label: string;
  accept: string;
  disabled: boolean;
  onFile: (file: File) => void;
}) {
  const id = useId();
  return (
    <>
      <label
        htmlFor={id}
        aria-disabled={disabled}
        className={buttonClasses({
          variant: 'soft',
          size: 'sm',
          className: disabled ? 'pointer-events-none opacity-60' : 'cursor-pointer',
        })}
      >
        <Icon name="upload" className="size-4" />
        {label}
      </label>
      <input
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) onFile(file);
        }}
      />
    </>
  );
}

/** Replace / restore the hero video and its poster. Changes apply immediately. */
export function MediaManager() {
  const { settings, saveSettings } = useStore();
  const { toast, confirm } = useFeedback();
  const [busy, setBusy] = useState<null | { label: string; progress: number }>(null);

  const videoPath = settings?.heroVideoPath ?? null;
  const posterPath = settings?.heroPosterPath ?? null;
  const videoSrc = resolveMediaPath(videoPath) ?? siteConfig.heroVideo.mp4;
  const posterSrc = resolveMediaPath(posterPath) ?? (videoPath ? null : siteConfig.heroVideo.poster);

  async function replaceVideo(file: File) {
    if (file.type !== 'video/mp4') return toast('error', t.media.videoWrongType);
    if (file.size > MAX_VIDEO_BYTES) return toast('error', t.media.videoTooLarge);

    setBusy({ label: t.media.replaceVideo, progress: 0 });
    let newVideo: string | null = null;
    let newPoster: string | null = null;
    try {
      const pending: PendingFile = { blob: file, previewUrl: '', extension: 'mp4', contentType: 'video/mp4' };
      newVideo = await uploadMedia('hero', file.name, pending, (progress) =>
        setBusy({ label: t.media.replaceVideo, progress }),
      );
      const poster = await capturePoster(file);
      if (poster) {
        newPoster = await uploadMedia('hero', 'poster', poster);
        URL.revokeObjectURL(poster.previewUrl);
      }
      await saveSettings({ heroVideoPath: newVideo, heroPosterPath: newPoster });
      await Promise.all([removeMedia(videoPath), removeMedia(posterPath)]);
      toast('success', newPoster ? t.media.videoSaved : t.saved);
    } catch (error) {
      console.error('[admin] video upload failed', error);
      await Promise.all([removeMedia(newVideo), removeMedia(newPoster)]);
      toast('error', t.saveFailed);
    } finally {
      setBusy(null);
    }
  }

  async function replacePoster(file: File) {
    if (!IMAGE_TYPES.includes(file.type)) return toast('error', t.image.wrongType);
    if (file.size > MAX_IMAGE_BYTES) return toast('error', t.image.tooLarge);

    setBusy({ label: t.media.replacePoster, progress: 0 });
    let newPoster: string | null = null;
    try {
      const pending = await prepareImage(file);
      newPoster = await uploadMedia('hero', 'poster', pending, (progress) =>
        setBusy({ label: t.media.replacePoster, progress }),
      );
      URL.revokeObjectURL(pending.previewUrl);
      await saveSettings({ heroPosterPath: newPoster });
      await removeMedia(posterPath);
      toast('success', t.saved);
    } catch (error) {
      console.error('[admin] poster upload failed', error);
      await removeMedia(newPoster);
      toast('error', t.saveFailed);
    } finally {
      setBusy(null);
    }
  }

  async function restoreVideo() {
    const ok = await confirm({
      title: t.media.restoreTitle,
      message: t.media.restoreMessage,
      confirmLabel: t.media.restoreDefault,
      tone: 'danger',
    });
    if (!ok) return;
    setBusy({ label: t.media.restoreDefault, progress: 1 });
    try {
      await saveSettings({ heroVideoPath: null, heroPosterPath: null });
      await Promise.all([removeMedia(videoPath), removeMedia(posterPath)]);
      toast('success', t.saved);
    } catch {
      toast('error', t.saveFailed);
    } finally {
      setBusy(null);
    }
  }

  async function restorePoster() {
    const ok = await confirm({
      title: t.media.restoreTitle,
      message: t.media.restorePosterMessage,
      confirmLabel: videoPath ? t.media.removePoster : t.media.restoreDefault,
      tone: 'danger',
    });
    if (!ok) return;
    setBusy({ label: t.media.removePoster, progress: 1 });
    try {
      await saveSettings({ heroPosterPath: null });
      await removeMedia(posterPath);
      toast('success', t.saved);
    } catch {
      toast('error', t.saveFailed);
    } finally {
      setBusy(null);
    }
  }

  const disabled = busy !== null;

  return (
    <>
      <PageHeading title={t.media.title} subtitle={t.media.subtitle} />

      {busy ? (
        <div role="status" className="mb-5 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-line">
          <p className="flex items-center gap-2 text-sm text-plum">
            <Spinner className="size-4 text-magenta" />
            {t.media.uploading(Math.round(busy.progress * 100))}
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-blush">
            <div className="h-full rounded-full bg-magenta transition-[width]" style={{ width: `${busy.progress * 100}%` }} />
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title={t.media.video} description={t.media.videoHint}>
          <video
            key={videoSrc}
            src={videoSrc}
            poster={posterSrc ?? undefined}
            controls
            muted
            playsInline
            preload="metadata"
            className="aspect-[3/2] w-full rounded-2xl bg-blush object-cover"
          />
          <p className="mt-3 text-xs text-muted">
            {t.media.current}: {videoPath ? t.media.customFile : t.media.defaultFile}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <FilePicker label={t.media.replaceVideo} accept="video/mp4" disabled={disabled} onFile={(f) => void replaceVideo(f)} />
            {videoPath ? (
              <button
                type="button"
                disabled={disabled}
                onClick={() => void restoreVideo()}
                className={buttonClasses({ variant: 'outline', size: 'sm' })}
              >
                <Icon name="restore" className="size-4" />
                {t.media.restoreDefault}
              </button>
            ) : null}
          </div>
        </Panel>

        <Panel title={t.media.poster} description={t.media.posterHint}>
          <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-blush">
            {posterSrc ? (
              <Image src={posterSrc} alt="" fill unoptimized sizes="600px" className="object-cover" />
            ) : (
              <p className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-muted">
                {t.media.noPosterForCustom}
              </p>
            )}
          </div>
          <p className="mt-3 text-xs text-muted">
            {t.media.current}: {posterPath ? t.media.customFile : t.media.defaultFile}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <FilePicker
              label={t.media.replacePoster}
              accept={IMAGE_TYPES.join(',')}
              disabled={disabled}
              onFile={(f) => void replacePoster(f)}
            />
            {posterPath ? (
              <button
                type="button"
                disabled={disabled}
                onClick={() => void restorePoster()}
                className={buttonClasses({ variant: 'outline', size: 'sm' })}
              >
                <Icon name={videoPath ? 'trash' : 'restore'} className="size-4" />
                {videoPath ? t.media.removePoster : t.media.restoreDefault}
              </button>
            ) : null}
          </div>
        </Panel>
      </div>
    </>
  );
}
