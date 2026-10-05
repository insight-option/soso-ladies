import localFont from 'next/font/local';

// Self-hosted (no runtime request to Google Fonts). Latin fonts are preloaded;
// the Arabic fonts are only fetched by pages that actually render Arabic text.

export const inter = localFont({
  src: './inter-latin-var.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  variable: '--font-inter',
  adjustFontFallback: 'Arial',
});

export const playfair = localFont({
  src: './playfair-display-latin-var.woff2',
  weight: '400 900',
  style: 'normal',
  display: 'swap',
  variable: '--font-playfair',
  adjustFontFallback: 'Times New Roman',
});

export const plexArabic = localFont({
  src: [
    { path: './ibm-plex-sans-arabic-400.woff2', weight: '400', style: 'normal' },
    { path: './ibm-plex-sans-arabic-500.woff2', weight: '500', style: 'normal' },
    { path: './ibm-plex-sans-arabic-600.woff2', weight: '600', style: 'normal' },
    { path: './ibm-plex-sans-arabic-700.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-plex-arabic',
  preload: false,
  adjustFontFallback: 'Arial',
});

export const amiri = localFont({
  src: [{ path: './amiri-700.woff2', weight: '700', style: 'normal' }],
  display: 'swap',
  variable: '--font-amiri',
  preload: false,
  adjustFontFallback: 'Times New Roman',
});

export const fontVariables = [inter, playfair, plexArabic, amiri].map((f) => f.variable).join(' ');
