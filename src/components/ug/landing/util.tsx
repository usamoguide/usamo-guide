import * as React from 'react';

/** Inline CSS custom properties, as the export writes them: css({ '--d': '120ms' }). */
export function css(
  vars: Record<string, string | number>
): React.CSSProperties {
  return vars as React.CSSProperties;
}

/** 'on' for the active index, 'past' for the ones before it (the ladder). */
export const rung = (i: number, at: number): string =>
  i === at ? 'on' : at > i ? 'past' : '';

/** 'on' only for the active index (the scene, the lesson rail). */
export const onIf = (i: number, at: number): string => (i === at ? 'on' : '');

/** Join class names, dropping empty ones. */
export const cx = (...names: (string | false | null | undefined)[]): string =>
  names.filter(Boolean).join(' ');

/** An outside link: opens in a new tab. */
export function Ext({
  href,
  className,
  style,
  children,
}: {
  href: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}): JSX.Element {
  const newTab = /^https?:/.test(href);
  return (
    <a
      className={className}
      style={style}
      href={href}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noreferrer' : undefined}
    >
      {children}
    </a>
  );
}

// Stroke icons the landing page uses that the shared set doesn't have.
// Same shape as src/components/ug/icons.tsx: svg.ico, sized by CSS.
function ico(children: React.ReactNode) {
  const Icon = ({ className }: { className?: string }): JSX.Element => (
    <svg
      className={className ? `ico ${className}` : 'ico'}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
  return Icon;
}

export const IcoChat = ico(
  <>
    <path d="M5 4.5h14a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-7.5L7 20.5V17H5a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2z" />
    <path d="M8.5 10.75h.01M12 10.75h.01M15.5 10.75h.01" />
  </>
);
export const IcoOut = ico(<path d="M7 17L17 7M9 7h8v8" />);
export const IcoCode = ico(
  <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4.5l-3 15" />
);
export const IcoMail = ico(
  <>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="M4 7.5l8 5.5 8-5.5" />
  </>
);
