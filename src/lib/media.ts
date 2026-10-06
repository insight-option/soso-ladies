/** Uploaded files live under this S3 prefix (see amplify/storage/resource.ts). */
export const MEDIA_PREFIX = 'media/';

const SAFE_SEGMENT = /^[A-Za-z0-9._-]+$/;

/** True for S3 keys like `media/services/1f…-facial.webp` (no traversal). */
export function isMediaPath(path: string): boolean {
  if (!path.startsWith(MEDIA_PREFIX) || path.includes('..')) return false;
  const segments = path.split('/');
  return segments.length >= 2 && segments.every((segment) => SAFE_SEGMENT.test(segment));
}

/** Public URL for an S3 key: our route redirects to a fresh presigned URL. */
export function mediaUrl(path: string): string {
  return `/api/media/${path}`;
}

/**
 * Resolves an image/video path stored in the database: an S3 key (uploaded from
 * /admin) or a file bundled under /public (e.g. /images/services/facial.webp).
 */
export function resolveMediaPath(path: string | null | undefined): string | null {
  if (!path) return null;
  if (isMediaPath(path)) return mediaUrl(path);
  if (/^\/(images|video)\/[A-Za-z0-9/._-]+$/.test(path) && !path.includes('..')) return path;
  return null;
}

/** /api/media URLs are redirects, so next/image must not try to optimize them. */
export function isRedirectedMedia(src: string): boolean {
  return src.startsWith('/api/media/');
}
