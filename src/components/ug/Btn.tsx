import { Link } from 'gatsby';
import * as React from 'react';
import { pop } from './hooks';
import { IcoArrow } from './icons';

/**
 * The redesign's pressable key button: a face sitting on a darker edge.
 *   <Btn kind="p" size="lg" to="/foundations" arrow>Start the track</Btn>
 * kind: p (purple), s (paper), w (gold, for purple bands), o (outline on purple)
 * Internal paths (`to`) use Gatsby's Link; `href` renders a plain anchor;
 * neither renders a <button>.
 */
export type BtnProps = {
  kind?: 'p' | 's' | 'w' | 'o';
  size?: 'sm' | 'lg';
  to?: string;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  /** adds the trailing arrow (with the `arr` nudge on hover) */
  arrow?: boolean | 'plain';
  className?: string;
  children?: React.ReactNode;
  type?: 'button' | 'submit';
  disabled?: boolean;
  target?: string;
  rel?: string;
  'aria-current'?: 'page' | undefined;
  'aria-label'?: string;
  /** extra content after the face (rare) */
  after?: React.ReactNode;
};

export default function Btn({
  kind = 'p',
  size,
  to,
  href,
  onClick,
  arrow,
  className,
  children,
  type = 'button',
  disabled,
  target,
  rel,
  after,
  ...aria
}: BtnProps): JSX.Element {
  const cls = ['btn', `btn-${kind}`, size ? `btn-${size}` : '', className || '']
    .filter(Boolean)
    .join(' ');
  const inner = (
    <>
      <span className="btn-edge" aria-hidden="true" />
      <span className="btn-face">
        {children}
        {arrow ? <IcoArrow className={arrow === 'plain' ? undefined : 'arr'} /> : null}
      </span>
      <span className="btn-pop" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      {after}
    </>
  );
  if (to) {
    return (
      <Link className={cls} to={to} onPointerDown={pop} onClick={onClick} {...aria}>
        {inner}
      </Link>
    );
  }
  if (href) {
    return (
      <a
        className={cls}
        href={href}
        onPointerDown={pop}
        onClick={onClick}
        target={target}
        rel={rel ?? (target === '_blank' ? 'noreferrer' : undefined)}
        {...aria}
      >
        {inner}
      </a>
    );
  }
  return (
    <button
      className={cls}
      type={type}
      onPointerDown={pop}
      onClick={onClick}
      disabled={disabled}
      {...aria}
    >
      {inner}
    </button>
  );
}
