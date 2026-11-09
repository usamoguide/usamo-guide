import * as React from 'react';

// Stroke icons from the redesign export. They inherit color and are sized by `.ico`.
type IcoProps = { className?: string };

const svg = (children: React.ReactNode) => {
  const Ico = ({ className }: IcoProps): JSX.Element => (
    <svg
      className={className ? `ico ${className}` : 'ico'}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
  return Ico;
};

export const IcoArrow = svg(<path d="M5 12h14M13 6l6 6-6 6" />);
export const IcoArrowLeft = svg(<path d="M19 12H5M11 6l-6 6 6 6" />);
export const IcoChev = svg(<path d="M6 9.5l6 6 6-6" />);
export const IcoChevRight = svg(<path d="M9.5 6l6 6-6 6" />);
export const IcoChevLeft = svg(<path d="M14.5 6l-6 6 6 6" />);
export const IcoCheck = svg(<path d="M5 12.5l4.5 4.5L19 7.5" />);
export const IcoClose = svg(<path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />);
export const IcoMenu = svg(<path d="M4 7h16M4 12h16M4 17h16" />);
export const IcoMoon = svg(
  <path d="M20 14.6A8.2 8.2 0 0 1 9.4 4a8.2 8.2 0 1 0 10.6 10.6z" />
);
export const IcoSun = svg(
  <>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" />
  </>
);
export const IcoGear = svg(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </>
);
export const IcoGrid = svg(
  <>
    <rect x="4" y="4" width="7" height="7" rx="2" />
    <rect x="13" y="4" width="7" height="7" rx="2" />
    <rect x="4" y="13" width="7" height="7" rx="2" />
    <rect x="13" y="13" width="7" height="7" rx="2" />
  </>
);
export const IcoBook = svg(
  <>
    <path d="M5 4.5h11a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2z" />
    <path d="M5 18a2 2 0 0 1 2-2h11" />
  </>
);
export const IcoSignOut = svg(
  <>
    <path d="M14 4.5h3.5a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H14" />
    <path d="M9.5 16l-4-4 4-4M5.5 12h10" />
  </>
);
export const IcoSearch = svg(
  <>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4.2-4.2" />
  </>
);
export const IcoExternal = svg(
  <path d="M14 5h5v5M19 5l-8 8M17 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h4" />
);
export const IcoUsers = svg(
  <>
    <circle cx="9" cy="8.5" r="3.5" />
    <path d="M2.5 19.5c.8-3.3 3.4-5 6.5-5s5.7 1.7 6.5 5" />
    <path d="M15.5 5.2a3.5 3.5 0 0 1 0 6.6M18 14.8c1.8.7 3 2.2 3.5 4.7" />
  </>
);
