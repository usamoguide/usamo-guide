import * as React from 'react';
import { useEffect, useState } from 'react';

const ScrollProgressButton = (): JSX.Element | null => {
  const [isVisible, setIsVisible] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const [progress, setProgress] = useState(0);
  const [pointerEvents, setPointerEvents] = useState('auto');

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // Show button immediately on any scroll
      setIsVisible(scrolled > 0);

      // Calculate scroll progress
      const docHeightMinusWindow = docHeight - windowHeight;
      const scrollPercent =
        docHeightMinusWindow > 0 ? (scrolled / docHeightMinusWindow) * 100 : 0;
      setProgress(scrollPercent);

      // Calculate fade when approaching the bottom (AoPS banner area)
      // Start fading when within 500px of the bottom
      const distanceFromBottom = docHeight - (scrolled + windowHeight);
      const fadeStartDistance = 500;

      if (distanceFromBottom < fadeStartDistance && distanceFromBottom > 0) {
        // Fade out as we approach the bottom
        const fadeOpacity = Math.max(0, distanceFromBottom / fadeStartDistance);
        setOpacity(fadeOpacity);
        // Disable pointer events when fading out
        setPointerEvents(fadeOpacity < 0.1 ? 'none' : 'auto');
      } else if (distanceFromBottom >= fadeStartDistance) {
        setOpacity(1);
        setPointerEvents('auto');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  // Calculate circumference for circular progress (radius ~28 for ~56px container)
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-20 right-6 z-40 hidden lg:flex items-center justify-center w-14 h-14 rounded-full shadow-md transition-all duration-200 hover:shadow-lg"
      style={{
        opacity,
        transform: `scale(${isVisible ? 1 : 0.8})`,
        transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-out',
        pointerEvents: pointerEvents as any,
        background: '#6D3B9F',
        border: '1px solid rgba(240, 194, 255, 0.34)',
      }}
      aria-label="Back to top"
      title="Back to top"
    >
      {/* Circular progress background */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 56 56">
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="rgba(240,194,255,0.25)"
          strokeWidth="1.5"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="rgba(240,194,255,0.85)"
          strokeWidth="1.5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-200"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '28px 28px',
          }}
        />
      </svg>

      {/* Up arrow icon */}
      <svg
        className="relative z-10 w-5 h-5 text-white dark:text-gray-900"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M12 19V5m-7 7l7-7 7 7"
        />
      </svg>
    </button>
  );
};

export default ScrollProgressButton;
