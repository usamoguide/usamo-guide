import * as React from 'react';

const PREVIEW_PATH = '/intermediate/shoelace-theorem-p1';
const PREVIEW_VIEWPORT_WIDTH = 1440;
const PREVIEW_SCROLL_SPEED = 0.6;

export default function LearnContestMathHero(): JSX.Element {
  const previewFrameRef = React.useRef<HTMLDivElement>(null);
  const previewIframeRef = React.useRef<HTMLIFrameElement>(null);

  const [previewScale, setPreviewScale] = React.useState(1);
  const [isPreviewEngaged, setIsPreviewEngaged] = React.useState(false);

  React.useEffect(() => {
    const frame = previewFrameRef.current;
    if (!frame) return;

    const updateScale = () => {
      setPreviewScale(frame.clientWidth / PREVIEW_VIEWPORT_WIDTH);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(frame);

    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const frame = previewFrameRef.current;
    const iframe = previewIframeRef.current;

    if (!frame || !iframe) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let animationId: number | null = null;
    let isOnScreen = false;
    let stopped = false;
    let position = 0;
    let detachInteraction: (() => void) | null = null;

    const stop = () => {
      stopped = true;

      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }

      animationId = null;
      detachInteraction?.();
      detachInteraction = null;
    };

    const start = () => {
      if (stopped) return;

      const iframeWindow = iframe.contentWindow;
      const iframeDocument = iframe.contentDocument;

      if (
        !iframeWindow ||
        !iframeDocument ||
        iframeDocument.URL === 'about:blank'
      ) {
        return;
      }

      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }

      animationId = null;
      detachInteraction?.();

      const interactionEvents = [
        'wheel',
        'touchstart',
        'touchmove',
        'pointerdown',
        'keydown',
      ] as const;

      for (const eventType of interactionEvents) {
        iframeDocument.addEventListener(eventType, stop, { passive: true });
        iframeWindow.addEventListener(eventType, stop, { passive: true });
      }

      detachInteraction = () => {
        for (const eventType of interactionEvents) {
          iframeDocument.removeEventListener(eventType, stop);
          iframeWindow.removeEventListener(eventType, stop);
        }
      };

      position = iframeWindow.scrollY;

      const step = () => {
        if (stopped) return;

        if (isOnScreen) {
          const maxScroll =
            iframeDocument.documentElement.scrollHeight -
            iframeWindow.innerHeight -
            1;

          position =
            maxScroll > 0 && position >= maxScroll
              ? 0
              : position + PREVIEW_SCROLL_SPEED;

          iframeWindow.scrollTo(0, position);
        }

        animationId = requestAnimationFrame(step);
      };

      animationId = requestAnimationFrame(step);
    };

    const engagePreview = () => {
      setIsPreviewEngaged(true);
      stop();
    };

    const handleLoad = () => start();

    frame.addEventListener('pointerdown', engagePreview);
    iframe.addEventListener('load', handleLoad);

    if (iframe.contentDocument?.readyState === 'complete') {
      start();
    }

    const visibilityObserver = new IntersectionObserver(
      entries => {
        isOnScreen = entries.some(entry => entry.isIntersecting);
      },
      { threshold: 0.25 }
    );

    visibilityObserver.observe(frame);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      frame.removeEventListener('pointerdown', engagePreview);
      visibilityObserver.disconnect();
      stop();
    };
  }, []);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'var(--bg-page)',
        color: 'var(--text-primary)',
      }}
    >
      <div className="pointer-events-none overflow-hidden leading-[0]">
        <svg
          viewBox="0 0 1200 80"
          preserveAspectRatio="none"
          className="block h-16 w-full md:h-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,80 C300,80 400,0 600,0 C800,0 900,80 1200,80 L1200,0 L0,0 Z"
            fill="var(--bg-page)"
          />
        </svg>
      </div>

      <div className="px-6 sm:px-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center pt-6">
          <div className="relative inline-block">
            <h1
              className="text-[clamp(4.5rem,13vw,11rem)] leading-[0.82] font-black tracking-[-0.03em] text-balance text-[#F4EDEA]"
              style={{ fontFamily: 'var(--font-family)' }}
            >
              USAMO
              <span className="ml-[0.12em] text-[#FF3764]">Guide</span>
            </h1>
            <img
              src="/images/Titlemascot.png"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute -top-7 -right-3 hidden w-16 rotate-[14deg] min-[640px]:block md:-top-10 md:-right-8 md:w-24 lg:-top-13 lg:-right-14 lg:w-32"
            />
          </div>
          <p
            className="mx-auto mt-4 max-w-2xl text-center text-lg leading-relaxed font-medium md:text-xl 2xl:text-2xl"
            style={{ color: 'var(--text-secondary)' }}
          >
            The world's largest youth-led movement making math olympiad preparation 
            free and accessible to everyone.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className="h-10 md:h-16 2xl:h-24" />

        <div
          ref={previewFrameRef}
          className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl"
          style={{
            border: '1px solid var(--border)',
            background: 'rgba(255, 255, 255, 0.03)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)',
          }}
        >
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{
              borderBottom: '1px solid var(--border)',
              background: 'rgba(255, 255, 255, 0.04)',
            }}
          >
            <div
              className="flex shrink-0 items-center gap-1.5"
              aria-hidden="true"
            >
              <span className="h-3 w-3 rounded-full bg-[var(--accent)]/70" />
              <span className="h-3 w-3 rounded-full bg-[var(--accent)]/45" />
              <span className="h-3 w-3 rounded-full bg-[var(--accent)]/25" />
            </div>

            <div className="flex-1" />

            <a
              href={PREVIEW_PATH}
              className="shrink-0 font-mono text-xs whitespace-nowrap md:text-sm"
              style={{
                color: 'var(--accent)',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              Open ↗
            </a>
          </div>

          <div
            className="relative h-[520px] w-full overflow-hidden md:h-[680px] 2xl:h-[760px]"
            style={{ background: 'var(--bg-page)' }}
          >
            <iframe
              ref={previewIframeRef}
              src={PREVIEW_PATH}
              title="Live preview of the Shoelace Theorem module"
              loading="lazy"
              className="block border-0"
              style={{
                background: 'var(--bg-page)',
                width: `${PREVIEW_VIEWPORT_WIDTH}px`,
                height: `${100 / previewScale}%`,
                transform: `scale(${previewScale})`,
                transformOrigin: 'top left',
                pointerEvents: isPreviewEngaged ? 'auto' : 'none',
              }}
            />
          </div>
        </div>

        <div className="h-16 md:h-20 2xl:h-36" />
      </div>
    </section>
  );
}
