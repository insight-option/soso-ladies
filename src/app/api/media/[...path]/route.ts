import { getUrl } from 'aws-amplify/storage/server';
import { runAsGuest } from '@/lib/amplify-server';
import { isMediaPath } from '@/lib/media';

// Presigned URLs must never be baked into cached HTML: pages link here and this
// handler redirects to a fresh, short-lived S3 URL on each (CDN-cached) hit.
export const dynamic = 'force-dynamic';

const PRESIGNED_TTL_SECONDS = 3600;

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  const key = segments.join('/');

  if (!isMediaPath(key)) {
    return new Response('Not found', { status: 404 });
  }

  const signed = await runAsGuest((_backend, context) =>
    getUrl(context, {
      path: key,
      options: { expiresIn: PRESIGNED_TTL_SECONDS, validateObjectExistence: true },
    }),
  );

  if (!signed) {
    return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: signed.url.toString(),
      'Cache-Control': 'public, max-age=600',
    },
  });
}
