import * as React from 'react';
import { useDarkMode } from '../../context/DarkModeContext';
import {
  useHideDifficultySetting,
  useSetHideDifficultySetting,
  useSetShowIgnoredSetting,
  useSetShowTagsSetting,
  useSetThemeSetting,
  useShowIgnoredSetting,
  useShowTagsSetting,
} from '../../context/UserDataContext/properties/simpleProperties';

export function motionAllowed(): boolean {
  try {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return false;
    }
  } catch (e) {
    // ignore
  }
  return true;
}

/**
 * The moon/sun toggle. Switching spreads the new theme out from the button in a
 * circle (a view transition), as in the export.
 */
export function useUGTheme(): {
  dark: boolean;
  toggle: (e?: React.MouseEvent<HTMLElement>) => void;
} {
  const dark = useDarkMode();
  const setTheme = useSetThemeSetting();
  const toggle = React.useCallback(
    (e?: React.MouseEvent<HTMLElement>) => {
      const next = dark ? 'light' : 'dark';
      const go = () => {
        const html = document.documentElement;
        html.classList.toggle('ug-dark', next === 'dark');
        html.classList.toggle('dark', next === 'dark');
        document
          .querySelectorAll('.ug')
          .forEach(el => el.setAttribute('data-theme', next));
        setTheme(next);
      };
      const btn = e?.currentTarget;
      const doc = document as Document & {
        startViewTransition?: (cb: () => void) => unknown;
      };
      if (btn && typeof doc.startViewTransition === 'function' && motionAllowed()) {
        const r = btn.getBoundingClientRect();
        const st = document.documentElement.style;
        st.setProperty('--vtx', Math.round(r.left + r.width / 2) + 'px');
        st.setProperty('--vty', Math.round(r.top + r.height / 2) + 'px');
        try {
          doc.startViewTransition(go);
        } catch (err) {
          go();
        }
      } else {
        go();
      }
    },
    [dark, setTheme]
  );
  return { dark, toggle };
}

/**
 * Display settings (the gear): show tags, show difficulty, show ignored problems.
 * Backed by the user's synced settings rather than the export's localStorage key.
 */
export function useUGPrefs() {
  const tags = useShowTagsSetting();
  const diff = !useHideDifficultySetting();
  const ign = useShowIgnoredSetting();
  const setTags = useSetShowTagsSetting();
  const setHideDiff = useSetHideDifficultySetting();
  const setIgn = useSetShowIgnoredSetting();
  return {
    tags,
    diff,
    ign,
    flipTags: () => setTags(!tags),
    flipDiff: () => setHideDiff(diff),
    flipIgn: () => setIgn(!ign),
  };
}

/** Restart the three "pop" lines on a pressed .btn. */
export function pop(e: React.PointerEvent<HTMLElement>): void {
  const el = e.currentTarget;
  if (!el || !el.setAttribute) return;
  el.removeAttribute('data-pop');
  void el.offsetWidth;
  el.setAttribute('data-pop', '');
}

/**
 * Pop-up menus are <details data-dismiss>. They close when you pick a link or a
 * menu item inside them, or click anywhere else.
 */
export function useDismissDetails(): void {
  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const pick = target?.closest
        ? target.closest(
            'details[data-dismiss] a, details[data-dismiss] [role="menuitemradio"], details[data-dismiss] [data-close]'
          )
        : null;
      document
        .querySelectorAll<HTMLDetailsElement>('details[data-dismiss][open]')
        .forEach(d => {
          if (!d.contains(target) || (pick && d.contains(pick))) d.open = false;
        });
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);
}

/** Close the <details> menu that contains the event's target. */
export function closeMenu(e: React.SyntheticEvent<HTMLElement>): void {
  const d = e.currentTarget.closest('details');
  if (d) d.open = false;
}

/** Initials for the avatar in the nav. */
export function initialsOf(name: string | null | undefined, email?: string | null): string {
  const src = (name || '').trim() || (email || '').split('@')[0] || '';
  const parts = src.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
