import { Link } from 'gatsby';
import * as React from 'react';

/**
 * Textured button.
 *
 * Three stacked layers make the bevel: an outer shell carrying the rim
 * gradient and the drop shadow, a 1px inset that reads as the lit edge, and
 * the face itself with its own top-to-bottom gradient. A single background
 * plus a border cannot produce the same result — the rim has to be brighter at
 * the top and darker at the bottom independently of the face.
 *
 * Renders as `<button>`, `<a>`, or a Gatsby `<Link>` depending on the props,
 * so the texture never forces the wrong element: a thing that navigates stays
 * a link, and a thing that acts stays a button.
 */

type Variant = 'primary' | 'secondary' | 'icon' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
  className?: string;
  /** Internal route — renders a Gatsby Link. */
  to?: string;
  /** External URL — renders an anchor. */
  href?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

export default function TextureButton({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  to,
  href,
  ...rest
}: Props): JSX.Element {
  const classes = [
    'tex-btn',
    `tex-btn--${variant}`,
    `tex-btn--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const inner = <span className="tex-btn__face">{children}</span>;

  if (to) {
    return (
      <Link to={to} className={classes}>
        {inner}
      </Link>
    );
  }

  if (href) {
    const external = /^https?:/.test(href);
    return (
      <a
        href={href}
        className={classes}
        {...(external
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : null)}
      >
        {inner}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      {inner}
    </button>
  );
}
