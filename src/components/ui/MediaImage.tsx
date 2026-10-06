import Image from 'next/image';
import { Icon, type IconName } from '@/components/ui/Icon';
import { cx } from '@/lib/cx';
import { isRedirectedMedia } from '@/lib/media';

type MediaImageProps = {
  src: string | null;
  alt: string;
  /** `sizes` attribute for next/image. */
  sizes: string;
  /** Wrapper classes; must fix the aspect ratio (e.g. aspect-[4/5]). */
  className?: string;
  imageClassName?: string;
  /** Icon shown on the blush placeholder when there is no image. */
  icon?: IconName;
  preload?: boolean;
};

/** Fixed-ratio image with a calm blush placeholder when no photo exists. */
export function MediaImage({
  src,
  alt,
  sizes,
  className,
  imageClassName,
  icon = 'image',
  preload = false,
}: MediaImageProps) {
  return (
    <div className={cx('relative overflow-hidden bg-blush', className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          preload={preload}
          unoptimized={isRedirectedMedia(src)}
          className={cx('object-cover', imageClassName)}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <div
            aria-hidden="true"
            className="absolute inset-3 rounded-[calc(var(--radius-card)-8px)] border border-white/70"
          />
          <span className="relative grid size-16 place-items-center rounded-full bg-white/75 text-magenta shadow-soft">
            <Icon name={icon} className="size-7" />
          </span>
        </div>
      )}
    </div>
  );
}
