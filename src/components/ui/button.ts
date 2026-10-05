import { cx } from '@/lib/cx';

export type ButtonVariant = 'primary' | 'outline' | 'soft';
export type ButtonSize = 'sm' | 'md' | 'lg';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-magenta text-white shadow-[0_8px_20px_-12px_rgb(163_29_90/0.7)] hover:bg-magenta-hover active:bg-magenta-hover',
  outline: 'border border-magenta/60 bg-white text-magenta hover:border-magenta hover:bg-blush',
  soft: 'bg-blush text-magenta hover:bg-blush-deep',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-10 text-sm gap-2',
  md: 'h-12 text-[0.9375rem] gap-2.5',
  lg: 'h-13 text-base gap-2.5',
};

const padding: Record<ButtonSize, string> = {
  sm: 'px-4',
  md: 'px-5',
  lg: 'px-7',
};

/**
 * Shared button look for links and buttons. Full-width buttons use tighter
 * padding so two of them fit side by side on a 320px screen.
 */
export function buttonClasses({
  variant = 'primary',
  size = 'md',
  full = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  className?: string;
} = {}): string {
  return cx(
    'inline-flex shrink-0 items-center justify-center rounded-xl font-semibold whitespace-nowrap transition-colors duration-200 disabled:pointer-events-none disabled:opacity-60',
    variants[variant],
    sizes[size],
    full ? 'w-full px-3' : padding[size],
    className,
  );
}
