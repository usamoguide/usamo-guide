import * as React from 'react';

type GsapModules = {
  gsap: typeof import('gsap').gsap;
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger;
};

type Options = {
  /**
   * Run when the effect is skipped — reduced motion, or a browser without the
   * APIs ScrollTrigger needs. Pinned scenes reveal their content across the
   * scrub, so without this the section would ship showing only its first
   * frame. Put the finished state here.
   */
  fallback?: () => void;
};

/**
 * Loads GSAP + ScrollTrigger on the client and runs a scroll setup function.
 *
 * Three things this centralises, because getting any of them wrong is silent:
 *
 * 1. **SSR.** Gatsby builds these pages in Node. ScrollTrigger touches
 *    `window` on import, so the import has to be dynamic and client-only.
 * 2. **Reduced motion.** A pinned, scrubbed section hijacks the scrollbar,
 *    which is precisely what the preference asks us not to do. We skip the
 *    setup entirely and call `fallback` so the section renders complete.
 * 3. **Teardown.** Gatsby navigations unmount without a reload; a leaked
 *    ScrollTrigger keeps its pin-spacer in the layout and corrupts the scroll
 *    height of the next page.
 */
export function useGsapScroll(
  setup: (modules: GsapModules) => void | (() => void),
  options: Options = {}
): void {
  const setupRef = React.useRef(setup);
  setupRef.current = setup;
  const fallbackRef = React.useRef(options.fallback);
  fallbackRef.current = options.fallback;

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      fallbackRef.current?.();
      return;
    }

    let cleanup: void | (() => void);
    let cancelled = false;

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
      .then(([gsapModule, scrollTriggerModule]) => {
        if (cancelled) return;
        const { gsap } = gsapModule;
        const { ScrollTrigger } = scrollTriggerModule;
        gsap.registerPlugin(ScrollTrigger);
        cleanup = setupRef.current({ gsap, ScrollTrigger });
      })
      .catch(() => {
        // Chunk failed to load — show the finished state rather than a
        // half-built scene.
        if (!cancelled) fallbackRef.current?.();
      });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);
}

export default useGsapScroll;
