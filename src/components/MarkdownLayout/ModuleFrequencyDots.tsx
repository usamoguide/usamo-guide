import * as React from 'react';

export default function ModuleFrequencyDots({ count, color, totalCount }) {
  const emptyCircle = 'text-[var(--text-muted)] dark:text-[var(--text-muted)]';
  return (
    <>
      {new Array(totalCount).fill(null).map((_, idx) => (
        <svg
  className={`mr-0.5 h-2.5 w-2.5 ${idx >= count ? emptyCircle : color}`}
  fill="currentColor"
  viewBox="0 0 20 20"
  key={idx}
>
  <path d="M10 2L12.4 8.2L19 9.2C19.5 9.3 19.8 9.9 19.4 10.3L14.5 15L15.7 21.6C15.8 22.1 15.3 22.5 14.8 22.2L10 18.8L5.2 22.2C4.7 22.5 4.2 22.1 4.3 21.6L5.5 15L0.6 10.3C0.2 9.9 0.5 9.3 1 9.2L7.6 8.2L10 2Z" strokeLinecap="round" strokeLinejoin="round" />
</svg>
      ))}
    </>
  );
}
