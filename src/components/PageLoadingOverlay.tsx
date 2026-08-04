import * as React from 'react';
import { LoadingSpinner } from './elements/LoadingSpinner';

const PAGE_LOADING_EVENT = 'usamoguide:page-loading';

type PageTone = 'light' | 'dark';

function resolvePageTone(container: HTMLElement | null): PageTone {
  if (!container) {
    return 'light';
  }

  const themedRoot = container.querySelector<HTMLElement>('[data-page-tone]');
  if (themedRoot?.dataset.pageTone === 'dark') {
    return 'dark';
  }

  return 'light';
}

export default function PageLoadingOverlay({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}): JSX.Element | null {
  const [isLoading, setIsLoading] = React.useState(false);
  const [tone, setTone] = React.useState<PageTone>('light');

  React.useEffect(() => {
    const handleLoadingEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ loading?: boolean }>;
      const loading = customEvent.detail?.loading === true;

      if (loading) {
        setTone(resolvePageTone(containerRef.current));
      }

      setIsLoading(loading);
    };

    const handleWindowLoad = () => {
      setIsLoading(false);
    };

    if (typeof window !== 'undefined' && document.readyState !== 'complete') {
      setTone(resolvePageTone(containerRef.current));
      setIsLoading(true);
      window.addEventListener('load', handleWindowLoad);
    }

    window.addEventListener(
      PAGE_LOADING_EVENT,
      handleLoadingEvent as EventListener
    );

    return () => {
      window.removeEventListener('load', handleWindowLoad);
      window.removeEventListener(
        PAGE_LOADING_EVENT,
        handleLoadingEvent as EventListener
      );
    };
  }, [containerRef]);

  if (!isLoading) {
    return null;
  }

  const spinnerColor = tone === 'dark' ? '#F0C2FF' : '#120F24';
  const shellBackground =
    tone === 'dark' ? 'rgba(244, 237, 234, 0.10)' : 'rgba(18, 15, 36, 0.08)';
  const shellBorder =
    tone === 'dark' ? 'rgba(240, 194, 255, 0.28)' : 'rgba(18, 15, 36, 0.12)';
  const backdrop =
    tone === 'dark' ? 'rgba(5, 4, 13, 0.18)' : 'rgba(244, 237, 234, 0.32)';

  return (
    <div
      aria-live="polite"
      aria-label="Page loading"
      className="pointer-events-none fixed inset-0 z-[120] flex items-center justify-center"
      style={{ backgroundColor: backdrop }}
    >
      <div
        className="rounded-full p-3 backdrop-blur-md"
        style={{ background: shellBackground, borderColor: shellBorder }}
      >
        <LoadingSpinner className="h-6 w-6" />
        <style>{`
          [aria-label="Page loading"] svg {
            color: ${spinnerColor};
          }
        `}</style>
      </div>
    </div>
  );
}
