import React from 'react';
import { useBlindMode } from '../context/BlindModeContext';

export default function BlindModeToggle() {
  const { isBlindMode, toggleBlindMode } = useBlindMode();

  return (
    <button
      onClick={toggleBlindMode}
      aria-pressed={isBlindMode}
      className="purple-motion-effect inline-flex items-center justify-center rounded-full px-5 py-2 font-mono text-sm leading-tight font-bold"
      style={{
        border: '1px solid rgba(240, 194, 255, 0.34)',
        background: '#6D3B9F',
        ['--pme-color' as string]: '#F4EDEA',
        ['--pme-hover-color' as string]: '#201C36',
        ['--pme-wipe-bg' as string]: '#F0C2FF',
      }}
      title={isBlindMode ? "Show 'Appears in' tags" : "Hide 'Appears in' tags"}
    >
      <svg
        className="mr-2 h-5 w-5 text-[#F4EDEA]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        {isBlindMode ? (
          <>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3l18 18"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.58 10.58a2 2 0 002.84 2.84"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.88 5.09A9.77 9.77 0 0112 5c4.48 0 8.27 2.94 9.54 7a10.67 10.67 0 01-4.04 5.13M6.61 6.61A10.72 10.72 0 002.46 12c.57 1.81 1.62 3.39 3 4.57"
            />
          </>
        ) : (
          <>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </>
        )}
      </svg>
      {isBlindMode ? 'Show tags' : 'Hide tags'}
    </button>
  );
}
