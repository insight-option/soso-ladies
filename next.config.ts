import { readFileSync } from 'node:fs';
import type { NextConfig } from 'next';

// Canonical/OG URLs need an absolute origin. Prefer an explicit value (set
// NEXT_PUBLIC_SITE_URL in the Amplify console), then the Amplify Hosting
// default domain (available at build time), then localhost for local dev.
const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.AWS_APP_ID && process.env.AWS_BRANCH
    ? `https://${process.env.AWS_BRANCH}.${process.env.AWS_APP_ID}.amplifyapp.com`
    : 'http://localhost:3000')
).replace(/\/+$/, '');

// The Amplify backend phase writes amplify_outputs.json before `next build`.
// Embed a copy as a fallback for hosts that don't ship root files with the
// server bundle (lib/amplify-server.ts reads the file first). Public config only.
function embeddedAmplifyOutputs(): string {
  try {
    return readFileSync('amplify_outputs.json', 'utf8');
  } catch {
    return '';
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_SITE_URL: siteUrl,
    AMPLIFY_OUTPUTS_JSON: embeddedAmplifyOutputs(),
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // amplify_outputs.json is read with fs at runtime, so make sure it ships with
  // the server bundle when it exists.
  outputFileTracingIncludes: {
    '/**': ['./amplify_outputs.json'],
  },
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/admin',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/video/:file*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800' }],
      },
    ];
  },
};

export default nextConfig;
