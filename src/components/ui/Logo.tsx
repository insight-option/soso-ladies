import Image from 'next/image';
import { cx } from '@/lib/cx';

// Official SOSO logo, only trimmed of its empty white margin (870×1150).
// It has a white background, so it is multiplied onto cream/blush surfaces.
const WIDTH = 870;
const HEIGHT = 1150;

export function Logo({
  alt,
  className,
  sizes = '64px',
  preload = false,
  eager = false,
}: {
  alt: string;
  /** Set the height (e.g. h-16); width follows the logo's proportions. */
  className?: string;
  sizes?: string;
  /** Preload (only where the logo is the main visual, e.g. the admin sign-in). */
  preload?: boolean;
  /** Load immediately without a preload hint (above-the-fold header logo). */
  eager?: boolean;
}) {
  return (
    <Image
      src="/brand/logo.png"
      alt={alt}
      width={WIDTH}
      height={HEIGHT}
      sizes={sizes}
      preload={preload}
      loading={eager && !preload ? 'eager' : undefined}
      className={cx('w-auto mix-blend-multiply select-none', className)}
    />
  );
}
