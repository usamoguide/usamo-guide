import * as React from 'react';
import { BlindModeProvider } from '../context/BlindModeContext';
import { useDarkMode } from '../context/DarkModeContext';
import { useAnalyticsEffect } from '../hooks/useAnalyticsEffect';
import { useUpdateStreakEffect } from '../hooks/useUpdateStreakEffect';
import AppFooter from './ug/AppFooter';
import { useDismissDetails } from './ug/hooks';
import MarkDefs from './ug/MarkDefs';

/**
 * Which redesign stylesheet a page uses. The `.ug` root carries `ugv-<view>`,
 * plus `ugv-landing` or `ugv-app`, and the stylesheets in src/styles/ug are
 * scoped to those classes (see scripts/scope-ug-css.mjs). Pages without a view
 * of their own use 'app': the shared tokens, nav, footer and controls.
 */
export type UGView =
  | 'landing'
  | 'start'
  | 'dashboard'
  | 'track'
  | 'module'
  | 'problems'
  | 'app';

// Runs while the HTML is parsed, before first paint, so a saved dark theme
// doesn't flash light. React keeps the attribute in sync after hydration.
const PREPAINT = `(function(s){try{var t=JSON.parse(localStorage.getItem('guide:userData:theme'));if(t==='dark'&&s&&s.parentNode)s.parentNode.setAttribute('data-theme','dark')}catch(e){}})(document.currentScript)`;

const Layout = ({
  children,
  setLastViewedModule,
  view = 'app',
  footer = view !== 'landing',
  className,
}: {
  children?: React.ReactNode;
  /**
   * If specified, in addition to updating number of pageviews,
   * we will also update lastViewedModule
   */
  setLastViewedModule?: string;
  view?: UGView;
  /** the compact app footer; 'wide' for pages on the wide container */
  footer?: boolean | 'wide';
  className?: string;
}): JSX.Element => {
  useAnalyticsEffect();
  useUpdateStreakEffect({ setLastViewedModule });
  useDismissDetails();
  const dark = useDarkMode();
  const scopes = Array.from(
    new Set(['ug', view === 'landing' ? 'ugv-landing' : 'ugv-app', `ugv-${view}`])
  );

  return (
    <BlindModeProvider>
      <div
        className={[...scopes, className || ''].filter(Boolean).join(' ')}
        data-theme={dark ? 'dark' : 'light'}
        suppressHydrationWarning
      >
        <script dangerouslySetInnerHTML={{ __html: PREPAINT }} />
        <MarkDefs />
        {children}
        {footer ? <AppFooter wide={footer === 'wide'} /> : null}
      </div>
    </BlindModeProvider>
  );
};

export default Layout;
