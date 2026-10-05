import { NextResponse, type NextRequest } from 'next/server';

/**
 * Locale routing: English is served without a prefix (/services is rewritten
 * to /en/services), Arabic lives under /ar, and /en/… redirects to the
 * unprefixed URL so every page has exactly one English address.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || '/';
    return NextResponse.redirect(url, 308);
  }

  if (pathname === '/ar' || pathname.startsWith('/ar/')) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === '/' ? '/en' : `/en${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip the admin panel, API routes, Next.js internals and any file with an
  // extension (images, video, favicon, robots.txt, sitemap.xml…).
  matcher: ['/((?!api|admin|_next|.*\\..*).*)'],
};
