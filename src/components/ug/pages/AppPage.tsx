import { Link } from 'gatsby';
import * as React from 'react';

/**
 * Building blocks for the app pages the export doesn't draw (about, contact,
 * settings, the legal pages, 404, resources). They use the export's own
 * vocabulary: crumbs, a k-label over a display headline (like the track and
 * problems heads), and sections laid out like the track page's (title on the
 * left, body on the right). Styled by `.ap-*` in src/styles/ug/fix-app.css.
 */

export type Crumb = { label: string; to?: string };

/** Intrinsic sizes of the mascot poses in static/ug/img. */
const POSE_SIZE: Record<string, [number, number]> = {
  'panda-cheer': [300, 245],
  'panda-point': [480, 383],
  'panda-search': [440, 395],
  'panda-head': [346, 346],
};
export function poseSize(pose: string): [number, number] {
  return POSE_SIZE[pose] ?? [450, 464];
}

export function Crumbs({ items }: { items: Crumb[] }): JSX.Element {
  return (
    <nav className="crumbs ap-crumbs" aria-label="Breadcrumb">
      {items.map((c, i) => (
        <React.Fragment key={c.label + i}>
          {i > 0 ? (
            <span className="sep" aria-hidden="true">
              ›
            </span>
          ) : null}
          {c.to ? (
            <Link to={c.to}>{c.label}</Link>
          ) : (
            <span className="here" aria-current="page">
              {c.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export function AppPageHead({
  crumbs,
  k,
  title,
  lede,
  meta,
  pose,
  size,
  children,
}: {
  crumbs?: Crumb[];
  /** the small uppercase label over the headline */
  k: React.ReactNode;
  title: React.ReactNode;
  lede?: React.ReactNode;
  /** a row of facts under the lede (`.ap-meta`) */
  meta?: React.ReactNode;
  /** a mascot pose from /ug/img, e.g. "panda-wave" */
  pose?: string;
  /** 'sm' for long headlines */
  size?: 'sm';
  /** call-to-action buttons */
  children?: React.ReactNode;
}): JSX.Element {
  return (
    <header className={pose ? 'ap-head has-pose' : 'ap-head'}>
      {crumbs ? <Crumbs items={crumbs} /> : null}
      <div className="ap-head-g">
        <div className="ap-head-t">
          <p className="k-label">{k}</p>
          <h1 className={size === 'sm' ? 'ap-h1 sm' : 'ap-h1'}>{title}</h1>
          {lede ? <p className="ap-lede">{lede}</p> : null}
          {meta ? <div className="ap-meta">{meta}</div> : null}
          {children ? <div className="cta-row ap-cta">{children}</div> : null}
        </div>
        {pose ? (
          <img
            className="ap-pose"
            src={`/ug/img/${pose}.webp`}
            alt=""
            width={poseSize(pose)[0]}
            height={poseSize(pose)[1]}
          />
        ) : null}
      </div>
    </header>
  );
}

/** A section with its title on the left and its body on the right (`.tr-sec`). */
export function AppSection({
  id,
  k,
  title,
  children,
}: {
  id: string;
  k?: React.ReactNode;
  title: React.ReactNode;
  children?: React.ReactNode;
}): JSX.Element {
  return (
    <section className="ap-sec" id={id} aria-labelledby={`${id}-h`}>
      <div className="ap-sec-h">
        {k ? <p className="k-label">{k}</p> : null}
        <h2 className="ap-sec-t" id={`${id}-h`}>
          {title}
        </h2>
      </div>
      <div className="ap-prose">{children}</div>
    </section>
  );
}
