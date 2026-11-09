import { Link } from 'gatsby';
import * as React from 'react';
import { IcoExternal } from '../ug/icons';
import { IcoDots, IcoFlag, IcoLink } from '../ug/pages/pageIcons';

/**
 * The "more" menu next to the status, as on the export's practice rows:
 * copy a link to the problem, report an issue, open the original.
 */
export default function ProblemMoreMenu({
  name,
  originalUrl,
}: {
  name: string;
  originalUrl: string | null;
}): JSX.Element {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  return (
    <details className="prb-rm" data-dismiss="">
      <summary className="prb-rm-btn" aria-label={`More options for ${name}`}>
        <IcoDots />
      </summary>
      <div className="prb-rm-menu" role="menu">
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            try {
              void navigator.clipboard
                .writeText(window.location.href.split('#')[0])
                .then(() => setCopied(true));
            } catch (e) {
              // clipboard unavailable: nothing to do
            }
          }}
        >
          <IcoLink />
          {copied ? 'Link copied' : 'Copy link'}
        </button>
        <Link
          role="menuitem"
          to={`/contact-us?location=${encodeURIComponent(name)}`}
        >
          <IcoFlag />
          Report an issue
        </Link>
        {originalUrl ? (
          <a
            role="menuitem"
            href={originalUrl}
            target="_blank"
            rel="nofollow noopener noreferrer"
          >
            <IcoExternal />
            View the original
          </a>
        ) : null}
      </div>
    </details>
  );
}
