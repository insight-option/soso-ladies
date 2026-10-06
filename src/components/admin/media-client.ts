import { remove, uploadData } from 'aws-amplify/storage';
import { isMediaPath } from '@/lib/media';

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 15 * 1024 * 1024;
const MAX_IMAGE_SIDE = 1600;
const QUALITY = 0.85;

export type MediaFolder = 'services' | 'offers' | 'hero';

/** A processed file waiting to be uploaded on save. */
export type PendingFile = { blob: Blob; previewUrl: string; extension: string; contentType: string };

function canvasBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

/** Resizes to at most 1600px on the long side and re-encodes as WebP (JPEG fallback). */
export async function prepareImage(file: File): Promise<PendingFile> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is not available');
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // Safari may not encode WebP and silently returns PNG; fall back to JPEG then.
  const webp = await canvasBlob(canvas, 'image/webp');
  const blob = webp?.type === 'image/webp' ? webp : await canvasBlob(canvas, 'image/jpeg');
  if (!blob) throw new Error('Could not encode image');
  const isWebp = blob.type === 'image/webp';
  return {
    blob,
    previewUrl: URL.createObjectURL(blob),
    extension: isWebp ? 'webp' : 'jpg',
    contentType: isWebp ? 'image/webp' : 'image/jpeg',
  };
}

/** media/<folder>/<uuid>-<readable-name>.<ext> */
export function mediaKey(folder: MediaFolder, nameHint: string, extension: string): string {
  const readable =
    nameHint
      .toLowerCase()
      .replace(/\.[a-z0-9]+$/, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'file';
  return `media/${folder}/${crypto.randomUUID()}-${readable}.${extension}`;
}

export async function uploadMedia(
  folder: MediaFolder,
  nameHint: string,
  file: PendingFile,
  onProgress?: (fraction: number) => void,
): Promise<string> {
  const path = mediaKey(folder, nameHint, file.extension);
  await uploadData({
    path,
    data: file.blob,
    options: {
      contentType: file.contentType,
      onProgress: ({ transferredBytes, totalBytes }) => {
        if (totalBytes) onProgress?.(transferredBytes / totalBytes);
      },
    },
  }).result;
  return path;
}

/** Best-effort delete of an uploaded file; bundled /public files are never touched. */
export async function removeMedia(path: string | null | undefined): Promise<void> {
  if (!path || !isMediaPath(path)) return;
  try {
    await remove({ path });
  } catch (error) {
    console.warn('[admin] could not delete', path, error);
  }
}
