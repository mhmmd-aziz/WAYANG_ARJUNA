import type { ReactNode } from 'react';

interface PageBannerProps {
  /** Background illustration from the ARJUNA asset kit (see assets/kitImages.ts). */
  image: string;
  children: ReactNode;
  /** Layout classes for the content row (flex/grid, gaps). */
  contentClassName?: string;
  /** CSS object-position for the image, e.g. 'center 30%'. */
  imagePosition?: string;
}

/**
 * Page header on an illustrated backdrop, same treatment as the landing hero:
 * full-bleed image, dark gradient from the left so cream text stays readable.
 */
export function PageBanner({
  image,
  children,
  contentClassName = '',
  imagePosition = 'center',
}: PageBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-wayang-brown">
      <img
        src={image}
        alt=""
        aria-hidden="true"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: imagePosition }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-wayang-charcoal/90 via-wayang-charcoal/70 to-wayang-charcoal/25"
      />
      <div className={`relative p-5 sm:p-7 ${contentClassName}`}>{children}</div>
    </div>
  );
}
