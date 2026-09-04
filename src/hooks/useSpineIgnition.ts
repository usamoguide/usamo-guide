import * as React from 'react';

/**
 * Lights each module marker as its row crosses the reading line.
 *
 * IntersectionObserver rather than a scroll handler: a syllabus can carry a
 * couple of hundred rows, and asking every one of them for its position on
 * every scroll event is the classic way to make a long page stutter.
 *
 * `is-lit` is added and never removed. Un-lighting rows as they leave the
 * viewport makes the spine flicker while scrolling back up, and the state it
 * expresses — "you have reached this far" — is not one that should reverse.
 *
 * The class is decorative only: the marker is already visible, and progress is
 * carried in text elsewhere. Nothing here gates content on the observer firing.
 */
export function useSpineIgnition<T extends HTMLElement>(): React.RefObject<T> {
  const rootRef = React.useRef<T>(null);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const rows = Array.from(
      root.querySelectorAll<HTMLElement>('.link-with-progress-container')
    );
    if (rows.length === 0) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      rows.forEach(row => row.classList.add('is-lit'));
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-lit');
          // One-shot: stop watching a row once it has lit.
          observer.unobserve(entry.target);
        }
      },
      // Fires when the row reaches the lower-middle of the viewport, so the
      // spine lights just ahead of where the eye is reading.
      { rootMargin: '0px 0px -35% 0px', threshold: 0 }
    );

    rows.forEach(row => observer.observe(row));
    return () => observer.disconnect();
  }, []);

  return rootRef;
}

export default useSpineIgnition;
