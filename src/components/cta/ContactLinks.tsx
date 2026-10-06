import type { ComponentProps } from 'react';
import { siteConfig } from '@/config/site';
import { Icon } from '@/components/ui/Icon';
import { buttonClasses, type ButtonSize, type ButtonVariant } from '@/components/ui/button';

// The only place where the WhatsApp and phone URLs are built (from siteConfig).
const WHATSAPP_URL = `https://wa.me/${siteConfig.phone.whatsapp}`;
const TEL_URL = `tel:${siteConfig.phone.tel}`;

/** wa.me link, with an optional prefilled message (e.g. the service being viewed). */
function whatsappHref(message?: string): string {
  return message ? `${WHATSAPP_URL}?text=${encodeURIComponent(message)}` : WHATSAPP_URL;
}

type AnchorProps = Omit<ComponentProps<'a'>, 'href' | 'target' | 'rel'>;

/** Unstyled link to the salon's WhatsApp chat (opens in a new tab). */
export function WhatsAppLink({ message, ...props }: AnchorProps & { message?: string }) {
  return <a href={whatsappHref(message)} target="_blank" rel="noopener noreferrer" {...props} />;
}

/** Unstyled link that starts a phone call to the salon. */
export function CallLink(props: AnchorProps) {
  return <a href={TEL_URL} {...props} />;
}

/** The salon phone number, always laid out left-to-right. */
export function PhoneNumber({ className }: { className?: string }) {
  return (
    <bdi dir="ltr" className={className}>
      {siteConfig.phone.display}
    </bdi>
  );
}

type ButtonProps = {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  className?: string;
};

export function WhatsAppButton({
  label,
  newTabHint,
  message,
  variant = 'primary',
  size = 'md',
  full,
  className,
}: ButtonProps & {
  /** Screen-reader note that the link opens a new tab. */
  newTabHint?: string;
  /** Prefilled WhatsApp message. */
  message?: string;
}) {
  return (
    <WhatsAppLink message={message} className={buttonClasses({ variant, size, full, className })}>
      <Icon name="whatsapp" className="size-5" />
      {label}
      {newTabHint ? <span className="sr-only"> {newTabHint}</span> : null}
    </WhatsAppLink>
  );
}

export function CallButton({ label, variant = 'outline', size = 'md', full, className }: ButtonProps) {
  return (
    <CallLink className={buttonClasses({ variant, size, full, className })}>
      <Icon name="phone" className="size-[1.125rem]" />
      {label}
    </CallLink>
  );
}
