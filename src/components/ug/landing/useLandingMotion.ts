import Lenis from 'lenis';
import * as React from 'react';
import { motionAllowed } from '../hooks';

/**
 * The landing page's behaviour, ported from the `<script type="text/x-dc">` of
 * usamo-guide-export/index.html:
 *  - "live" mode (motion allowed, a normal-sized window): `ug-live` on <html>,
 *    blur-in reveals for every `.rv` below the fold, Lenis smooth scrolling;
 *  - on each frame that scrolling or the pointer asks for: the scroll-linked
 *    CSS variables (--sy, --prog, --lp, --mp, --fp, --tp, --cp, --mq, --mx,
 *    --my, the doodles' --dp), the ladder rung, the fox scene pose, the contest
 *    climb, the sample lesson section being read, and `ug-navdark` while the
 *    nav sits over a purple band.
 * The export puts those variables on <html>; here each goes on the elements
 * that read it (VAR_TARGETS), and only when its value changes. A custom
 * property changed on <html> restyles the whole page, every scroll frame.
 * Nothing runs per frame while the page is still: Lenis only gets frames while
 * a smooth scroll is moving, and the looping decorations pause while their
 * section is off screen (`data-idle`, fix-landing.css).
 * Everything it sets is removed again on unmount.
 */

/** The elements that read each scroll-linked variable (landing.css). */
const VAR_TARGETS = {
  sy: '.hero-in, .dd',
  pointer: '.dd', // --mx, --my
  prog: '.nav-prog',
  lp: '.pin-prog',
  mp: '.mf', // its words (.w) inherit it
  fp: '.foot-mark',
  tp: '.person',
  cp: '.cg',
  mq: '.mi-circle',
};

/** Sections whose looping decorations pause while they are off screen. */
const IDLE_SECTIONS = '.hero, .sec, .cta, .foot';

type Els = {
  steps: HTMLElement[];
  sstepEls: HTMLElement[];
  scpin: HTMLElement | null;
  ladpin: HTMLElement | null;
  o4: HTMLElement | null;
  o4climb: HTMLElement | null;
  dz: HTMLElement[];
  lsecs: HTMLElement[];
  vars: { [K in keyof typeof VAR_TARGETS]: HTMLElement[] };
  mf: HTMLElement | null;
  mission: HTMLElement | null;
  team: HTMLElement | null;
  cta: HTMLElement | null;
  foot: HTMLElement | null;
};

export type LandingState = {
  /** ladder rung, 0..3 */
  step: number;
  /** fox scene pose, 0..4 */
  sstep: number;
  /** sample lesson section being read (index into its shown sections) */
  lsec: number;
  /** contest climb stage, 0..3 (3 is the static, fully drawn state) */
  climb: number;
};

export type LandingMotion = LandingState & {
  /** put on any element inside the page's `.ug` root (the hero) */
  hookRef: React.RefObject<HTMLElement>;
  /** in-page anchors (#faq, #top, ...) glide with smooth scrolling */
  onAnchor: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  /** the sample lesson's contents list: scroll the page to its section i */
  jumpTo: (i: number) => void;
};

const STATIC: LandingState = { step: 0, sstep: 0, lsec: 0, climb: 3 };

export function useLandingMotion(): LandingMotion {
  const hookRef = React.useRef<HTMLElement>(null);
  const [state, setState] = React.useState<LandingState>(STATIC);
  // the latest state, readable from the frame loop without re-subscribing
  const cur = React.useRef<LandingState>(STATIC);
  const lenisRef = React.useRef<Lenis | null>(null);
  // starts Lenis's frame loop (it sleeps while nothing is scrolling)
  const wakeRef = React.useRef<() => void>(() => undefined);

  const update = React.useCallback((patch: Partial<LandingState>) => {
    const prev = cur.current;
    const next = { ...prev, ...patch };
    if (
      next.step === prev.step &&
      next.sstep === prev.sstep &&
      next.lsec === prev.lsec &&
      next.climb === prev.climb
    ) {
      return;
    }
    cur.current = next;
    setState(next);
  }, []);

  React.useEffect(() => {
    const root =
      (hookRef.current?.closest('.ug') as HTMLElement | null) ?? null;
    if (!root) return undefined;
    const html = document.documentElement;
    let live = false;
    let raf = 0;
    let evalT = 0;
    let climbAt = 0;
    let climbTimer = 0;
    let navDark = false;
    let sc: HTMLElement | null = null;
    let io: IntersectionObserver | null = null;
    let idleIO: IntersectionObserver | null = null;
    let lraf = 0;
    let els: Els | null = null;
    let mx = 0;
    let my = 0;
    let tx = 0;
    let ty = 0;

    // The page scrolls the window in the app; the export also supported a
    // scrolling frame around the page, so keep looking for one.
    const findScroller = (): HTMLElement | null => {
      let n = root.parentElement;
      while (n && n !== document.body && n !== document.documentElement) {
        const s = getComputedStyle(n);
        if (
          /(auto|scroll|overlay)/.test(s.overflowY) &&
          n.scrollHeight > n.clientHeight + 4
        ) {
          return n;
        }
        n = n.parentElement;
      }
      return null;
    };
    const viewH = () =>
      sc ? sc.clientHeight : window.innerHeight || html.clientHeight || 0;
    const scrollY = () =>
      sc ? sc.scrollTop : window.pageYOffset || html.scrollTop || 0;
    const scrollH = () => {
      if (sc) return sc.scrollHeight;
      const b = document.body;
      return Math.max(html.scrollHeight, b ? b.scrollHeight : 0);
    };

    const request = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const tick = () => {
      raf = 0;
      frame();
    };

    const onIO: IntersectionObserverCallback = entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.setAttribute('data-st', 'in');
        if (io) io.unobserve(en.target);
      });
    };

    const all = (sel: string) =>
      Array.prototype.slice.call(root.querySelectorAll(sel)) as HTMLElement[];
    const one = (sel: string) => root.querySelector(sel) as HTMLElement | null;
    // what each element was last given, so unchanged values aren't rewritten
    const written = new Map<HTMLElement, Record<string, string>>();
    const setVar = (els: HTMLElement[], k: string, v: string) => {
      els.forEach(el => {
        let w = written.get(el);
        if (!w) {
          w = {};
          written.set(el, w);
        }
        if (w[k] === v) return;
        w[k] = v;
        el.style.setProperty(k, v);
      });
    };
    const clearVars = () => {
      written.forEach((w, el) =>
        Object.keys(w).forEach(k => el.style.removeProperty(k))
      );
      written.clear();
    };
    const cache = () => {
      els = {
        steps: all('.lstep'),
        sstepEls: all('.sc-step'),
        scpin: one('.sc-pinwrap'),
        ladpin: one('.lad-pinwrap'),
        o4: one('.o4e'),
        o4climb: one('.o4-climb'),
        dz: all('.dz'),
        lsecs: all('.sl [data-ls]'),
        vars: Object.fromEntries(
          Object.entries(VAR_TARGETS).map(([k, sel]) => [k, all(sel)])
        ) as Els['vars'],
        mf: one('.mf'),
        mission: one('.mission'),
        team: one('.team-grid'),
        cta: one('.cta'),
        foot: one('.foot'),
      };
    };

    // Lenis smooths wheel scrolling; touch stays native. Its own loop
    // (`autoRaf`) asks for a frame forever, which repaints the whole page 60
    // times a second while it sits still. Drive it here instead, only while a
    // smooth scroll is moving.
    const lenisLoop = (t: number) => {
      lraf = 0;
      const l = lenisRef.current;
      if (!l) return;
      l.raf(t);
      if (l.isScrolling === 'smooth') lraf = requestAnimationFrame(lenisLoop);
    };
    const wakeLenis = () => {
      const l = lenisRef.current;
      if (!l || lraf) return;
      // restart its clock, or the first frame after a pause jumps to the target
      l.time = performance.now();
      lraf = requestAnimationFrame(lenisLoop);
    };
    wakeRef.current = wakeLenis;
    const startLenis = () => {
      if (lenisRef.current) return;
      try {
        lenisRef.current = new Lenis({
          wrapper: sc || window,
          content: sc
            ? (sc.firstElementChild as HTMLElement | null) || sc
            : html,
          autoRaf: false,
          lerp: 0.1,
          allowNestedScroll: true,
        });
      } catch (e) {
        lenisRef.current = null;
      }
    };
    const stopLenis = () => {
      if (lraf) {
        cancelAnimationFrame(lraf);
        lraf = 0;
      }
      if (lenisRef.current) {
        try {
          lenisRef.current.destroy();
        } catch (e) {
          // ignore
        }
        lenisRef.current = null;
      }
    };

    const enable = () => {
      live = true;
      root.setAttribute('data-rvinit', '');
      html.classList.add('ug-live');
      const vh = viewH();
      const obs =
        'IntersectionObserver' in window
          ? new IntersectionObserver(onIO, { threshold: 0.12 })
          : null;
      io = obs;
      if (obs) {
        all('.rv').forEach(el => {
          if (el.getBoundingClientRect().top > vh * 0.92) {
            el.setAttribute('data-st', 'wait');
            obs.observe(el);
          }
        });
      }
      if ('IntersectionObserver' in window) {
        idleIO = new IntersectionObserver(
          entries =>
            entries.forEach(en =>
              en.target.toggleAttribute('data-idle', !en.isIntersecting)
            ),
          { rootMargin: '200px 0px' }
        );
        all(IDLE_SECTIONS).forEach(el => idleIO?.observe(el));
      }
      cache();
      climbAt = 0;
      update({ climb: 0 });
      startLenis();
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          root.removeAttribute('data-rvinit');
        })
      );
    };

    const disable = (unmounting: boolean) => {
      stopLenis();
      live = false;
      navDark = false;
      html.classList.remove('ug-live', 'ug-navdark');
      clearVars();
      if (io) {
        io.disconnect();
        io = null;
      }
      if (idleIO) {
        idleIO.disconnect();
        idleIO = null;
      }
      all('[data-idle]').forEach(el => el.removeAttribute('data-idle'));
      root.removeAttribute('data-rvinit');
      all('[data-st]').forEach(el => el.removeAttribute('data-st'));
      if (climbTimer) {
        clearTimeout(climbTimer);
        climbTimer = 0;
      }
      if (!unmounting) update({ step: 0, sstep: 0, climb: 3 });
    };

    const evaluate = () => {
      sc = findScroller();
      const vh = viewH();
      const want =
        motionAllowed() && vh > 200 && vh < 2400 && scrollH() > vh + 40;
      if (want && !live) enable();
      else if (!want && live) disable(false);
      if (live) request();
    };

    const frame = () => {
      if (!live) return;
      if (!els || !els.foot || !root.contains(els.foot)) cache();
      const E = els as Els;
      const vh = viewH();
      const y = scrollY();
      const max = Math.max(1, scrollH() - vh);
      const clamp = (v: number, a: number, b: number) =>
        Math.min(b, Math.max(a, v));
      const mid = (el: Element) => {
        const r = el.getBoundingClientRect();
        return r.top + r.height / 2;
      };
      const rel = (el: Element | null) =>
        el ? clamp((mid(el) - vh / 2) / vh, -1.5, 1.5) : 0;

      // reads first
      // where a step's text starts (its top padding is the gap above the words)
      const textTop = (el: Element) =>
        el.getBoundingClientRect().top +
        (parseFloat(getComputedStyle(el).paddingTop) || 0);
      const pinned = (el: Element | null) =>
        !!el && getComputedStyle(el).position === 'sticky';
      // on phones the card or circle pins under the nav, so the reading line sits in the space left below it
      const below = (el: Element) => {
        const pb = el.getBoundingClientRect().bottom;
        return pb + (vh - pb) * 0.42;
      };
      let step = 0;
      let lp = 0;
      const st = E.steps;
      const ladPinned = pinned(E.ladpin);
      const line = ladPinned && E.ladpin ? below(E.ladpin) : vh * 0.6;
      const at = ladPinned ? textTop : mid;
      for (let i = 0; i !== st.length; i++) {
        if (line > at(st[i])) step = i;
      }
      if (st.length) {
        const a = at(st[0]);
        const b = at(st[st.length - 1]);
        lp = clamp((line - a) / Math.max(1, b - a), 0, 1);
      }
      // the fox scene: whichever step has crossed the middle of the screen sets the pose
      let sstep = 0;
      const ss = E.sstepEls;
      const scPinned = pinned(E.scpin);
      const sline = scPinned && E.scpin ? below(E.scpin) : vh * 0.56;
      for (let i = 0; i !== ss.length; i++) {
        if (sline > (scPinned ? textTop(ss[i]) : mid(ss[i]))) sstep = i;
      }
      // the sample lesson's contents list: the last section whose top has passed 40% down the screen
      let lsec = 0;
      E.lsecs.forEach((el, i) => {
        if (el.getBoundingClientRect().top < vh * 0.4) lsec = i;
      });
      let mp = 1;
      if (E.mf) {
        const r = E.mf.getBoundingClientRect();
        mp = clamp((vh * 0.86 - r.top) / (vh * 0.42 + r.height), 0, 1);
      }
      let fp = 1;
      if (E.foot) {
        const r = E.foot.getBoundingClientRect();
        fp = clamp((vh - r.top) / Math.max(1, r.height), 0, 1);
      }
      const dzp = E.dz.map(el => {
        const p = el.parentElement;
        if (!p) return 0;
        const c =
          p.getBoundingClientRect().top + el.offsetTop + el.offsetHeight / 2;
        return clamp((c - vh / 2) / vh, -1.5, 1.5);
      });
      const tp = rel(E.team);
      const cp = rel(E.cta);
      const mq = rel(E.mission);
      const under = (el: Element | null) => {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.top <= 34 && r.bottom >= 34;
      };
      const dark = under(E.mission) || under(E.cta) || under(E.o4);
      // the contest climb: one step at a time while it is on screen, reset once it drops below the fold
      let climb = cur.current.climb;
      let climbLater = false;
      if (E.o4climb) {
        const r = E.o4climb.getBoundingClientRect();
        if (r.top > vh) {
          climb = 0;
        } else {
          const c1 = r.top + r.height * 0.6;
          const c2 = r.top + r.height * 0.42;
          let want = vh * 0.9 > c1 ? 1 : 0;
          if (vh * 0.66 > c1) want = 2;
          if (want === 2 && vh * 0.5 > c2) want = 3;
          if (want > climb) {
            const now = performance.now();
            if (climb === 0 || now - climbAt > 1050) {
              climb += 1;
              climbAt = now;
            }
            if (want > climb) climbLater = true;
          }
        }
      }
      mx += (tx - mx) * 0.08;
      my += (ty - my) * 0.08;
      const settling = Math.abs(tx - mx) > 0.001 || Math.abs(ty - my) > 0.001;

      // then writes
      const V = E.vars;
      setVar(V.sy, '--sy', y.toFixed(1));
      setVar(V.prog, '--prog', clamp(y / max, 0, 1).toFixed(4));
      setVar(V.lp, '--lp', lp.toFixed(4));
      setVar(V.mp, '--mp', mp.toFixed(4));
      setVar(V.fp, '--fp', fp.toFixed(4));
      setVar(V.tp, '--tp', tp.toFixed(4));
      setVar(V.cp, '--cp', cp.toFixed(4));
      setVar(V.mq, '--mq', mq.toFixed(4));
      setVar(V.pointer, '--mx', mx.toFixed(4));
      setVar(V.pointer, '--my', my.toFixed(4));
      E.dz.forEach((el, i) => setVar([el], '--dp', dzp[i].toFixed(3)));
      if (dark !== navDark) {
        navDark = dark;
        html.classList.toggle('ug-navdark', dark);
      }
      update({ step, sstep, climb, lsec });
      if (climbLater && !climbTimer) {
        climbTimer = window.setTimeout(() => {
          climbTimer = 0;
          request();
        }, 1100);
      }
      if (settling) request();
    };

    const onScroll = () => {
      if (live) request();
    };
    const onResize = () => {
      if (evalT) clearTimeout(evalT);
      evalT = window.setTimeout(() => {
        evalT = 0;
        evaluate();
      }, 140);
      if (live) request();
    };
    const onPointer = (e: PointerEvent) => {
      if (!live) return;
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      tx = (e.clientX / w) * 2 - 1;
      ty = (e.clientY / h) * 2 - 1;
      request();
    };

    document.addEventListener('scroll', onScroll, {
      passive: true,
      capture: true,
    });
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    // capture, so the clock restarts before Lenis's own wheel handler starts a scroll
    window.addEventListener('wheel', wakeLenis, { passive: true, capture: true });
    evaluate();

    return () => {
      document.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('wheel', wakeLenis, { capture: true });
      wakeRef.current = () => undefined;
      if (evalT) clearTimeout(evalT);
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      disable(true);
      // a pre-paint `ug-live` (see LANDING_PREPAINT) is cleared here too
      html.classList.remove('ug-live', 'ug-navdark');
    };
  }, [update]);

  // with smooth scroll on, in-page links glide instead of jumping
  const onAnchor = React.useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const lenis = lenisRef.current;
      if (
        !lenis ||
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const href = e.currentTarget.getAttribute('href') || '';
      if (!href.startsWith('#')) return;
      const id = decodeURIComponent(href.slice(1));
      const t = id ? document.getElementById(id) : null;
      if (!t) return;
      e.preventDefault();
      lenis.scrollTo(t, { duration: 1.3 });
      wakeRef.current();
    },
    []
  );

  const jumpTo = React.useCallback((i: number) => {
    const root = hookRef.current?.closest('.ug');
    const t = root
      ? (root.querySelector(`.sl [data-ls="${i}"]`) as HTMLElement | null)
      : null;
    if (!t) return;
    // both keep the section's scroll-margin-top (clear of the sticky nav, fix-landing.css)
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(t, { duration: 1.1 });
      wakeRef.current();
    } else {
      t.scrollIntoView({ behavior: motionAllowed() ? 'smooth' : 'auto' });
    }
  }, []);

  return { ...state, hookRef, onAnchor, jumpTo };
}

/**
 * Runs while the server-rendered HTML is parsed: turns on live mode before the
 * first paint, so the hero's entrance plays from the start instead of the
 * finished hero flashing up and then animating in once React hydrates. Same
 * conditions as `evaluate()`; the hook takes over (or undoes it) on mount.
 */
export const LANDING_PREPAINT = `(function(){try{var h=window.innerHeight||0;if(!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)&&h>200&&h<2400)document.documentElement.classList.add('ug-live')}catch(e){}})()`;
