import { Link, graphql, useStaticQuery } from 'gatsby';
import classNames from 'classnames';
import * as React from 'react';

/**
 * Coverflow of real module pages.
 *
 * Adapted from the supplied component for this codebase: no `"use client"`
 * (Gatsby has no such directive), `classNames` in place of shadcn's `cn`, and
 * the cleanup effect rewritten — as supplied it read `() => () => if (...)`,
 * which does not parse.
 *
 * Cards are built from each module's real frontmatter — title, author,
 * description, difficulty, prerequisite count — laid out the way the module
 * page lays them out.
 *
 * The centre card also carries a live frame of the real module page, mounted
 * over that face once it loads.
 *
 * Exactly one frame exists at a time. Every card being a live iframe is what
 * made this section unusable before: each framed module pulls React, KaTeX and
 * its own stylesheet, and loading seven locked the main thread hard enough to
 * stop the tab responding. The neighbours are raked ~44 degrees away and faded,
 * so a live page there buys nothing anyway — the frontmatter face reads better
 * at that angle, and stays as the ground under the centre frame while it loads.
 *
 * Mounting is deferred until the carousel settles, so dragging or holding an
 * arrow key across the deck does not spawn and tear down a frame per card.
 */

/** Width the framed module renders at before scaling, so it always shows
    desktop rather than the card's own narrow layout. */
const FRAME_WIDTH = 1380;

/** Cards are 1.3x their width; the frame matches so it fills the face. */
const FRAME_RATIO = 1.3;

/** How long the selection must hold still before a frame is mounted. */
const SETTLE_MS = 260;

export type CoverflowModule = {
  path: string;
  /** Module id, used to look the real frontmatter up. */
  id: string;
  title: string;
  track: string;
};

type ModuleMeta = {
  title: string;
  author: string | null;
  description: string | null;
  difficulty: string | null;
  prerequisites: number;
};

type Props = {
  modules: CoverflowModule[];
  /** Degrees the first neighbour tilts. */
  rotate?: number;
  /** How far the first neighbour recedes, as a fraction of card width. */
  depth?: number;
  /** Viewer distance as a multiple of card width — smaller is a wider lens. */
  perspective?: number;
  /** Exponent on distance. Below 1 the rake eases off as cards travel out. */
  falloff?: number;
  /** Opacity lost per step from the centre. */
  fade?: number;
  gap?: number;
  label?: string;
};

export default function ModuleCoverflow({
  modules,
  rotate = 44,
  depth = 0.6,
  perspective = 3,
  falloff = 0.56,
  fade = 0.1,
  gap = 0.05,
  label = 'Module previews',
}: Props): JSX.Element {
  const count = modules.length;

  const data = useStaticQuery(graphql`
    query CoverflowModules {
      allXdm(filter: { fileAbsolutePath: { regex: "/content/" } }) {
        nodes {
          frontmatter {
            id
            title
            author
            description
            difficulty
            prerequisites
          }
        }
      }
    }
  `);

  /** Frontmatter by module id, so a card can find its own content in O(1). */
  const metaById: Record<string, ModuleMeta> = React.useMemo(() => {
    const out: Record<string, ModuleMeta> = {};
    for (const node of data.allXdm.nodes) {
      const fm = node.frontmatter;
      if (!fm?.id) continue;
      out[fm.id] = {
        title: fm.title,
        author: fm.author ?? null,
        description: fm.description ?? null,
        difficulty: fm.difficulty ?? null,
        prerequisites: fm.prerequisites?.length ?? 0,
      };
    }
    return out;
  }, [data]);

  const frameRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  /** Fractional card index at the centre. The single source of truth. */
  const posRef = React.useRef(0);
  /** Where the current settle is headed. Stepping off `pos` would swallow a
      keypress that lands mid-flight, before the round-off moves. */
  const targetRef = React.useRef(0);
  const widthRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const dragRef = React.useRef<{
    id: number;
    x: number;
    pos: number;
    v: number;
    t: number;
  } | null>(null);

  const [selected, setSelected] = React.useState(0);

  /* The live frame on the centre card. `settled` lags `selected` so flicking
     through the deck does not mount a frame per card on the way past, and
     `ready` gates the fade so the frontmatter face shows until the page has
     actually painted. */
  const [settled, setSettled] = React.useState<number | null>(null);
  const [ready, setReady] = React.useState(false);
  const [scale, setScale] = React.useState(0);

  React.useEffect(() => {
    setReady(false);
    const id = window.setTimeout(() => setSettled(selected), SETTLE_MS);
    return () => window.clearTimeout(id);
  }, [selected]);

  // Cards are all one width, so measuring any mounted card sizes the frame.
  React.useEffect(() => {
    const card = cardRefs.current.find(Boolean);
    if (!card) return;
    const apply = () => setScale(card.clientWidth / FRAME_WIDTH);
    const ro = new ResizeObserver(apply);
    ro.observe(card);
    apply();
    return () => ro.disconnect();
  }, []);

  const indexAt = React.useCallback(
    (pos: number) => ((Math.round(pos) % count) + count) % count,
    [count]
  );

  // Paint straight to the DOM. Sixty state updates a second would re-render
  // every card for numbers React never needs to see.
  const paint = React.useCallback(() => {
    const width = widthRef.current;
    if (!width) return;
    const pitch = width * (1 + gap);
    const pos = posRef.current;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      // Fold the distance into the shorter way round the ring. This is the
      // whole looping mechanism — no cloned nodes, no shuffling the DOM.
      let offset = index - pos;
      offset = ((offset % count) + count) % count;
      if (offset > count / 2) offset -= count;

      const distance = Math.abs(offset);
      // Tilt and recession both ease off as cards travel out. A linear ramp
      // folds the second card shut; this keeps it readable.
      const ramp = Math.pow(distance, falloff);
      // Capped short of edge-on so a far card never turns its back.
      const tilt = Math.min(rotate * ramp, 82) * Math.sign(offset);

      card.style.transform =
        `translateX(calc(-50% + ${offset * pitch}px)) ` +
        `translateZ(${-depth * width * ramp}px) rotateY(${-tilt}deg)`;

      // A card is teleported across the ring at exactly half a turn out, so it
      // has to be gone by then or the jump is visible.
      const edge = Math.min(1, Math.max(0, count / 2 - distance));
      card.style.opacity = String(Math.max(0, 1 - fade * distance) * edge);
      card.style.zIndex = String(100 - Math.round(distance));
    });
  }, [count, depth, fade, falloff, gap, rotate]);

  const settle = React.useCallback(
    (target: number) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      targetRef.current = target;
      setSelected(indexAt(target));

      const step = () => {
        const remaining = target - posRef.current;
        if (Math.abs(remaining) < 0.0004) {
          posRef.current = target;
          paint();
          rafRef.current = null;
          return;
        }
        posRef.current += remaining * 0.16;
        paint();
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [indexAt, paint]
  );

  const goTo = React.useCallback(
    (index: number) => {
      // Take the shorter way round rather than unwinding the whole ring.
      const target =
        index + Math.round((targetRef.current - index) / count) * count;
      settle(target);
    },
    [count, settle]
  );

  const nudge = React.useCallback(
    (by: number) => settle(Math.round(targetRef.current) + by),
    [settle]
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    targetRef.current = posRef.current;
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      pos: posRef.current,
      v: 0,
      t: performance.now(),
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;

    const pitch = widthRef.current * (1 + gap);
    if (!pitch) return;

    const now = performance.now();
    const previous = posRef.current;
    posRef.current = drag.pos - (event.clientX - drag.x) / pitch;
    // Cards per second, for the throw.
    drag.v = ((posRef.current - previous) / Math.max(now - drag.t, 1)) * 1000;
    drag.t = now;

    const index = indexAt(posRef.current);
    if (index !== selected) setSelected(index);
    paint();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    // Let a flick carry, but never more than two cards.
    const carried = Math.max(-2, Math.min(2, drag.v * 0.18));
    settle(Math.round(posRef.current + carried));
  };

  // Card width drives pitch, depth and perspective, so it is the only thing
  // worth measuring — and only when the box actually changes.
  React.useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const measure = () => {
      const card = cardRefs.current[0];
      if (!card) return;
      widthRef.current = card.offsetWidth;
      paint();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [paint]);

  React.useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    []
  );



  /** Shortest ring distance from the selected card. */
  const ringDistance = (index: number) => {
    let d = Math.abs(index - selected);
    if (d > count / 2) d = count - d;
    return d;
  };

  const active = modules[selected];

  return (
    <section className="cf" aria-roledescription="carousel" aria-label={label}>
      <div className="cf__inner">
        <h2 className="cf__heading">Two hundred modules, all like this.</h2>
      </div>

      <div className="cf__stage">
        <div
          ref={frameRef}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={event => {
            if (event.key === 'ArrowLeft') {
              event.preventDefault();
              nudge(-1);
            } else if (event.key === 'ArrowRight') {
              event.preventDefault();
              nudge(1);
            }
          }}
          className="cf__frame"
          style={{
            perspective: `calc(var(--cf-card) * ${perspective})`,
            // Horizontal drag is ours; the page keeps vertical scrolling.
            touchAction: 'pan-y',
          }}
        >
          <div className="cf__track">
            {modules.map((mod, index) => {
              const meta = metaById[mod.id];
              return (
                <div
                  key={mod.path}
                  ref={node => {
                    cardRefs.current[index] = node;
                  }}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${count}: ${mod.title}`}
                  className="cf__card"
                >
                  {/* Laid out the way the module page lays its header out, so
                      the card reads as a page rather than as a tile. */}
                  <article className="cf__page" aria-hidden="true">
                    <p className="cf__page-track">{mod.track}</p>
                    <h3 className="cf__page-title">
                      {meta?.title ?? mod.title}
                    </h3>
                    {meta?.author && (
                      <p className="cf__page-author">Author: {meta.author}</p>
                    )}
                    {meta?.description && (
                      <p className="cf__page-desc">{meta.description}</p>
                    )}
                    <div className="cf__page-rule" />
                    <dl className="cf__page-meta">
                      {meta?.difficulty && (
                        <div>
                          <dt>Level</dt>
                          <dd>{meta.difficulty}</dd>
                        </div>
                      )}
                      <div>
                        <dt>Prereqs</dt>
                        <dd>{meta?.prerequisites ?? 0}</dd>
                      </div>
                    </dl>
                  </article>

                  {/* The real page, over the face, on the centre card only.
                      Inert: no keyboard focus, no pointer events, and out of
                      the accessibility tree — the caption below the deck
                      carries the name and the link. */}
                  {index === settled && scale > 0 && (
                    <div
                      className={classNames('cf__live', ready && 'is-ready')}
                      aria-hidden="true"
                    >
                      <iframe
                        src={mod.path}
                        title=""
                        className="cf__live-frame"
                        width={FRAME_WIDTH}
                        height={Math.round(FRAME_WIDTH * FRAME_RATIO)}
                        style={{ transform: `scale(${scale})` }}
                        loading="lazy"
                        scrolling="no"
                        tabIndex={-1}
                        aria-hidden="true"
                        onLoad={() => setReady(true)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          aria-label="Previous module"
          onClick={() => nudge(-1)}
          className="btn btn-sm cf__arrow cf__arrow--prev"
        >
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 3 5 8l5 5" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Next module"
          onClick={() => nudge(1)}
          className="btn btn-sm cf__arrow cf__arrow--next"
        >
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 3l5 5-5 5" />
          </svg>
        </button>
      </div>

      <div className="cf__caption" key={selected}>
        <p className="cf__track-name">{active.track}</p>
        <Link to={active.path} className="cf__title-link">
          {active.title}
        </Link>
      </div>

      <div className="cf__dots">
        {modules.map((mod, index) => (
          <button
            key={mod.path}
            type="button"
            aria-label={`Go to ${mod.title}`}
            aria-current={index === selected}
            onClick={() => goTo(index)}
            className={classNames(
              'cf__dot',
              index === selected && 'is-current'
            )}
          />
        ))}
      </div>
    </section>
  );
}
