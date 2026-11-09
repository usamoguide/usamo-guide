import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { DarkModeContext } from './DarkModeContext';
import { useThemeSetting } from './UserDataContext/properties/simpleProperties';
import { themeKey } from './UserDataContext/UserDataContext';

/**
 * Light is the default; the moon/sun toggle in the nav stores 'dark' or 'light'
 * in the user's theme setting (localStorage, plus Supabase when signed in).
 * The redesign has no "follow the system" mode, so 'system' reads as light.
 *
 * Two classes on <html> follow the theme: `ug-dark` for the redesign tokens
 * (see src/styles/ug/base.css) and `dark` for Tailwind's dark: variants, which
 * the markdown content and older screens still use. gatsby-ssr.tsx sets both
 * before first paint from the `themeKey` localStorage entry, which the user
 * data reducer keeps in sync with the setting.
 */
export function DarkModeProvider({ children }) {
  const theme = useThemeSetting();
  // false on the server and during hydration, so the markup matches
  const [darkMode, setDarkMode] = useState(false);
  const [ready, setReady] = useState(false);
  const lastTheme = useRef(theme);

  // Start from what the pre-paint script used. User data loads after this,
  // and its defaults ('system') must not undo a saved dark theme meanwhile.
  useEffect(() => {
    let stored: unknown = null;
    try {
      stored = JSON.parse(localStorage.getItem(themeKey) || 'null');
    } catch (e) {
      // ignore
    }
    setDarkMode(stored === 'dark');
    setReady(true);
  }, []);

  // Then follow the setting whenever it actually changes (toggle, sign-in, sync).
  useEffect(() => {
    if (lastTheme.current === theme) return;
    lastTheme.current = theme;
    setDarkMode(theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (!ready) return;
    const html = document.documentElement;
    html.classList.toggle('dark', darkMode);
    html.classList.toggle('ug-dark', darkMode);
    html.style.colorScheme = darkMode ? 'dark' : 'light';
  }, [darkMode, ready]);

  return (
    <DarkModeContext.Provider value={darkMode}>
      {children}
    </DarkModeContext.Provider>
  );
}
