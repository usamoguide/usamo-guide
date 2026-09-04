import { Link } from 'gatsby';
import * as React from 'react';
import { useGsapScroll } from '../../hooks/useGsapScroll';

/**
 * Guided tour of a real module page.
 *
 * The frame on the right is the live site, not a screenshot — whatever that
 * module looks like today is what a visitor sees here. Scrolling walks the
 * frame down the page and names each part as it arrives.
 *
 * The frame is inert to the visitor (`pointer-events: none`, and the iframe
 * carries no keyboard focus) so it cannot swallow the page scroll or trap a
 * tab. Anyone who wants the real page has the link beneath it.
 */

const MODULE_PATH = '/intermediate/shoelace-theorem-p1';
const MODULE_NAME = 'Shoelace Theorem';

/** Width the frame is rendered at before scaling, so it always shows desktop. */
const FRAME_WIDTH = 1380;
const FRAME_HEIGHT = 940;

/** Each stop scrolls the framed page to a part and names it. Names only. */
const STOPS = [
  { y: 0, title: 'Author' },
  { y: 330, title: 'Prerequisites' },
  { y: 900, title: 'Overview' },
  { y: 1750, title: 'Worked examples' },
  { y: 2700, title: 'Practice problems' },
];

export default function ModuleTour(): JSX.Element {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  const shellRef = React.useRef<HTMLDivElement>(null);
  const [stop, setStop] = React.useState(0);
  const stopRef = React.useRef(0);
  const targetY = React.useRef(0);
  const currentY = React.useRef(0);

  // Scale the fixed-width frame down to whatever the shell actually is.
  React.useEffect(() => {
    const shell = shellRef.current;
    const frame = frameRef.current;
    if (!shell || !frame) return;
    const apply = () => {
      const scale = shell.clientWidth / FRAME_WIDTH;
      frame.style.transform = `scale(${scale})`;
      shell.style.height = `${FRAME_HEIGHT * scale}px`;
    };
    const ro = new ResizeObserver(apply);
    ro.observe(shell);
    apply();
    return () => ro.disconnect();
  }, []);

  // Eased scroll of the framed page. Driven from a rAF rather than written
  // straight from the scrub, so the frame glides between stops instead of
  // jumping every time the scrub ticks.
  React.useEffect(() => {
    let frameId: number | null = null;
    const tick = () => {
      frameId = requestAnimationFrame(tick);
      const frame = frameRef.current;
      const win = frame?.contentWindow;
      if (!win) return;
      const diff = targetY.current - currentY.current;
      if (Math.abs(diff) < 0.5) return;
      currentY.current += diff * 0.09;
      try {
        win.scrollTo(0, currentY.current);
      } catch {
        // Cross-origin would throw; same-origin in practice, but a failed
        // scroll must not take the rAF loop down with it.
      }
    };
    frameId = requestAnimationFrame(tick);
    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, []);

  useGsapScroll(
    ({ ScrollTrigger }) => {
      const root = rootRef.current;
      if (!root) return;
      const trigger = ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: `+=${STOPS.length * 80}%`,
        pin: true,
        scrub: 0.5,
        onUpdate: self => {
          const next = Math.min(
            STOPS.length - 1,
            Math.floor(self.progress * STOPS.length + 0.0001)
          );
          if (next !== stopRef.current) {
            stopRef.current = next;
            setStop(next);
          }
          // Interpolate between stop offsets so the frame tracks the scrub
          // continuously rather than teleporting on each boundary.
          const span = 1 / STOPS.length;
          const idx = Math.min(STOPS.length - 2, Math.floor(self.progress / span));
          const local = Math.min(1, Math.max(0, (self.progress - idx * span) / span));
          targetY.current =
            STOPS[idx].y + (STOPS[idx + 1].y - STOPS[idx].y) * local;
        },
      });
      return () => trigger.kill();
    },
    { fallback: () => setStop(0) }
  );

  return (
    <section ref={rootRef} className="tour">
      <div className="tour__inner">
        <div className="tour__panel">
          <h2 className="tour__heading">Each module:</h2>

          {/* The names swap in place. `key` on the inner span is what makes
              React remount it, which is what restarts the entrance animation —
              without it the text would change with no transition at all. */}
          <div className="tour__cycle" aria-live="polite">
            <span key={stop} className="tour__name">
              {STOPS[stop].title}
            </span>
          </div>

          <ol className="tour__dots" aria-hidden="true">
            {STOPS.map((s2, i) => (
              <li key={s2.title} className={i === stop ? 'is-current' : undefined} />
            ))}
          </ol>

          <Link to={MODULE_PATH} className="btn btn-secondary tour__cta">
            Open {MODULE_NAME}
          </Link>
        </div>

        <div className="tour__stage">
          <div ref={shellRef} className="tour__shell">
            <iframe
              ref={frameRef}
              src={MODULE_PATH}
              title={`Live preview of the ${MODULE_NAME} module`}
              className="tour__frame"
              width={FRAME_WIDTH}
              height={FRAME_HEIGHT}
              loading="lazy"
              scrolling="no"
              // Out of the tab order and inert: the frame is an illustration
              // here, and the link above is the way in.
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
