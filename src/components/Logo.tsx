import * as React from 'react';

const logoSrc = '/images/Test_logo.png';

export default function Logo(): JSX.Element {
  return (
    <div className="flex flex-nowrap items-center space-x-2 whitespace-nowrap">
      <img
        className="logo-mark h-9 w-9 shrink-0"
        src={logoSrc}
        alt="USAMO Guide"
      />
      {/* Colour comes from --logo-ink so the wordmark can sit on the page
          ground or inside the light nav pill without a Tailwind dark: variant
          overriding it from the utilities layer. */}
      <span
        className="text-xl font-bold tracking-tight"
        style={{ color: 'var(--logo-ink, var(--text-primary))' }}
      >
        USAMO Guide
      </span>
    </div>
  );
}
