import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import React from 'react';

const PAGE_BG = 'var(--bg-page)';
const VANILLA = '#F4EDEA';
const TEXT_SECONDARY = 'rgba(244, 237, 234, 0.78)';

interface Testimonial {
  name: string;
  role: string;
  content: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Sohil Rathi',
    role: 'Author of OmegaLearn',
    content:
      'The USAMO Guide is an incredible resource for competitive math. The way it structures problems by difficulty and topic is exactly what students need to progress efficiently.',
  },
  {
    name: 'Alexandar',
    role: 'YIMO Founder',
    content:
      'A comprehensive and well-organized platform that brings together the best of competitive math education. The community-driven approach sets it apart from other resources.',
  },
  {
    name: 'Lalith',
    role: 'Community Member & Contributor',
    content:
      "I started as a learner on this platform and the quality of explanations helped me level up. Now I'm thrilled to give back and contribute to help others on their journey.",
  },
];

const TestimonialsSection = () => {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const firstSetRef = React.useRef<HTMLDivElement>(null);
  const firstCardRef = React.useRef<HTMLDivElement>(null);
  const setWidthRef = React.useRef(0);
  const offsetRef = React.useRef(0);
  const rafRef = React.useRef<number>();
  const lastTsRef = React.useRef<number | null>(null);
  const [isPaused, setIsPaused] = React.useState(false);

  const normalizeOffset = React.useCallback(() => {
    const setWidth = setWidthRef.current;
    if (setWidth <= 0) return;
    offsetRef.current = ((offsetRef.current % setWidth) + setWidth) % setWidth;
  }, []);

  const applyTransform = React.useCallback(() => {
    if (!trackRef.current || setWidthRef.current <= 0) return;
    // Keep the middle copy as the visible base; wrap by one set width for seamless looping.
    trackRef.current.style.transform = `translate3d(${-setWidthRef.current - offsetRef.current}px, 0, 0)`;
  }, []);

  const measure = React.useCallback(() => {
    if (!firstSetRef.current) return;
    setWidthRef.current = firstSetRef.current.offsetWidth;
    normalizeOffset();
    applyTransform();
  }, [applyTransform, normalizeOffset]);

  const stepByOneCard = React.useCallback(
    (direction: 'next' | 'back') => {
      const fallback = 640 + 32;
      const step = (firstCardRef.current?.offsetWidth ?? fallback) + 32;
      offsetRef.current += direction === 'next' ? step : -step;
      normalizeOffset();
      applyTransform();
    },
    [applyTransform, normalizeOffset]
  );

  React.useEffect(() => {
    measure();
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [measure]);

  React.useEffect(() => {
    const SPEED_PX_PER_SEC = 14;
    const tick = (ts: number) => {
      if (lastTsRef.current == null) {
        lastTsRef.current = ts;
      }

      const delta = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      if (!isPaused && setWidthRef.current > 0) {
        offsetRef.current += SPEED_PX_PER_SEC * delta;
        normalizeOffset();
        applyTransform();
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
      lastTsRef.current = null;
    };
  }, [applyTransform, isPaused, normalizeOffset]);

  return (
    <div
      className="relative overflow-hidden py-16 font-sans transition-colors duration-500 md:py-24"
      style={{
        background: PAGE_BG,
        color: VANILLA,
      }}
    >
      <div className="px-4 sm:px-6 lg:px-8 2xl:px-16">
        {/* Section Title */}
        <div className="mb-12 text-center">
          <div className="mb-2">
            <h2
              className="text-4xl font-black tracking-tight md:text-5xl 2xl:text-6xl"
              style={{ color: VANILLA }}
            >
              What Our Users
            </h2>
            <p
              className="mt-1 text-4xl font-black tracking-tight italic md:text-5xl 2xl:text-6xl"
              style={{ color: 'rgba(240, 194, 255, 0.85)' }}
            >
              Are Saying
            </p>
          </div>
          <p
            className="mt-4 text-base md:text-lg"
            style={{ color: TEXT_SECONDARY }}
          >
            Stop juggling different resources. Get comprehensive math education
            and community support in one platform.
          </p>
        </div>

        {/* Infinite marquee with centered card + side peeks */}
        <div className="relative mt-10 w-full">
          <div
            className="overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              ref={trackRef}
              className="flex w-max will-change-transform"
              style={{
                paddingLeft: 'max(1rem, calc(50vw - 320px))',
                paddingRight: 'max(1rem, calc(50vw - 320px))',
              }}
            >
              {[0, 1, 2].map(copyIndex => (
                <div
                  key={copyIndex}
                  ref={copyIndex === 0 ? firstSetRef : undefined}
                  className="flex gap-8 pr-8"
                >
                  {testimonials.map((testimonial, idx) => (
                    <div
                      key={`${copyIndex}-${idx}`}
                      ref={
                        copyIndex === 1 && idx === 0 ? firstCardRef : undefined
                      }
                      className="flex min-h-[180px] w-[78vw] flex-shrink-0 flex-col justify-between p-5 md:w-[66vw] md:p-6 lg:w-[640px]"
                      style={{}}
                    >
                      <p
                        className="text-xl leading-relaxed md:text-[1.9rem]"
                        style={{ color: TEXT_SECONDARY }}
                      >
                        “{testimonial.content}”
                      </p>

                      <div
                        className="mt-4 h-px w-full"
                        style={{ background: 'rgba(240, 240, 240, 0.06)' }}
                      />

                      <div className="mt-3">
                        <p
                          className="text-2xl font-semibold tracking-tight md:text-3xl"
                          style={{ color: VANILLA }}
                        >
                          {testimonial.name}
                        </p>
                        <p
                          className="mt-1 text-base"
                          style={{ color: 'rgba(240, 194, 255, 0.62)' }}
                        >
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => stepByOneCard('back')}
              className="flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-200 hover:bg-white/10"
              style={{ borderColor: 'rgba(229, 194, 255, 0.28)' }}
              aria-label="Previous testimonial"
            >
              <ChevronLeftIcon className="h-5 w-5" style={{ color: VANILLA }} />
            </button>
            <button
              type="button"
              onClick={() => stepByOneCard('next')}
              className="flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-200 hover:bg-white/10"
              style={{ borderColor: 'rgba(229, 194, 255, 0.28)' }}
              aria-label="Next testimonial"
            >
              <ChevronRightIcon
                className="h-5 w-5"
                style={{ color: VANILLA }}
              />
            </button>
          </div>
        </div>

        {/* Ambient glow effect */}
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full blur-[120px]"
          style={{ backgroundColor: 'rgba(112, 66, 138, 0.15)' }}
        />
      </div>
    </div>
  );
};

export default TestimonialsSection;
