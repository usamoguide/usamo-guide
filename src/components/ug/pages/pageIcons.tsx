import * as React from 'react';

// Stroke icons from the redesign export that the shared icon set doesn't have yet.
// Same contract as src/components/ug/icons.tsx: `svg.ico`, colour from currentColor.
type IcoProps = { className?: string };

const svg =
  (children: React.ReactNode) =>
  ({ className }: IcoProps): JSX.Element => (
    <svg
      className={className ? `ico ${className}` : 'ico'}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {children}
    </svg>
  );

export const IcoDots = svg(<path d="M6 12h.01M12 12h.01M18 12h.01" />);
export const IcoLink = svg(
  <>
    <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
  </>
);
export const IcoFlag = svg(
  <path d="M6 21V4M6 4.5c4-2 7 2 12 0v9c-5 2-8-2-12 0" />
);
export const IcoBulb = svg(
  <>
    <path d="M9.5 18h5M10.5 21h3" />
    <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2v.2h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" />
  </>
);
export const IcoMail = svg(
  <>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
    <path d="M4.5 7.5l7.5 5.5 7.5-5.5" />
  </>
);
export const IcoChat = svg(
  <path d="M5 4.5h14a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-7.5L7 20.5V17H5a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2z" />
);
export const IcoCode = svg(
  <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4.5l-3 15" />
);
export const IcoBook = svg(
  <>
    <path d="M5 4.5h11a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2z" />
    <path d="M5 18a2 2 0 0 1 2-2h11" />
  </>
);
export const IcoPen = svg(
  <>
    <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3z" />
    <path d="M14.5 7.5l2 2" />
  </>
);
export const IcoUpRight = svg(<path d="M7 17L17 7M9 7h8v8" />);
export const IcoLock = svg(
  <>
    <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
  </>
);
export const IcoBack = svg(<path d="M9.5 16l-4-4 4-4M5.5 12h10" />);

/** The four-point star on Featured badges (`.ico-star`, its own viewBox). */
export function IcoStar(): JSX.Element {
  return (
    <svg className="ico-star" viewBox="-10 -10 20 20" aria-hidden="true">
      <path d="M0-7C.7-1.8 1.8-.7 7 0C1.8.7.7 1.8 0 7C-.7 1.8-1.8.7-7 0C-1.8-.7-.7-1.8 0-7Z" />
    </svg>
  );
}
