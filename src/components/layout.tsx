import * as React from 'react';
import { BlindModeProvider } from '../context/BlindModeContext';
import { useAnalyticsEffect } from '../hooks/useAnalyticsEffect';
import { useUpdateStreakEffect } from '../hooks/useUpdateStreakEffect';
import PageLoadingOverlay from './PageLoadingOverlay';

const Layout = ({
  children,
  setLastViewedModule,
}: {
  children?: React.ReactNode;
  /**
   * If specified, in addition to updating number of pageviews,
   * we will also update lastViewedModule
   */
  setLastViewedModule?: string;
}): JSX.Element => {
  useAnalyticsEffect();
  useUpdateStreakEffect({ setLastViewedModule });
  const pageContentRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <BlindModeProvider>
      <div className="relative min-h-screen font-sans">
        <PageLoadingOverlay containerRef={pageContentRef} />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-repeat bg-center opacity-5"
          style={{ backgroundImage: "url(/images/math-doodles.png)" }}
        />
        <div ref={pageContentRef} className="relative z-10">
          {children}
        </div>
      </div>
    </BlindModeProvider>
  );
};

export default Layout;
