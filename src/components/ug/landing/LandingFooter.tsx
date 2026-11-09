import { Link } from 'gatsby';
import * as React from 'react';
import { UG_LINKS } from '../links';
import { Mark } from '../MarkDefs';
import { CONTACT_EMAIL } from './Faq';
import { MAA_URL } from './Ladder';
import { css, Ext } from './util';

/**
 * Applications to run a USAMO Guide chapter (like the one in Bangladesh). Not in
 * the export; kept from the previous landing page, where it was the only link.
 */
const START_A_CHAPTER_FORM =
  'https://docs.google.com/forms/d/e/1FAIpQLSc4QUgTlgaRC0Ljuns4-AIeuh51CMLK4G4BdbwzUCKVyyL46A/viewform?usp=dialog';

/** The landing page's own footer, with the giant wordmark the panda peeks out of. */
export default function LandingFooter({
  onAnchor,
}: {
  onAnchor: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}): JSX.Element {
  return (
    <footer className="foot">
      <div className="wrap foot-grid">
        <div className="foot-brand rv">
          <a
            className="brand"
            href="#top"
            aria-label="USAMO Guide, back to top"
            onClick={onAnchor}
          >
            <Mark />
            <span className="wm" aria-hidden="true">
              USAMO Guide
            </span>
          </a>
          <p>
            Written by USA(J)MO medalists. Free for everyone and fully open
            source.
          </p>
        </div>
        <nav
          className="foot-col rv"
          style={css({ '--d': '60ms' })}
          aria-label="Learn"
        >
          <p className="foot-k lbl">Learn</p>
          <Link to={UG_LINKS.start}>Start learning</Link>
          <a href="#path" onClick={onAnchor}>
            The Path
          </a>
          <a href="#faq" onClick={onAnchor}>
            FAQ
          </a>
        </nav>
        <nav
          className="foot-col rv"
          style={css({ '--d': '120ms' })}
          aria-label="Community"
        >
          <p className="foot-k lbl">Community</p>
          <Ext href={UG_LINKS.discord}>Discord</Ext>
          <Ext href={UG_LINKS.github}>GitHub</Ext>
          <a href="#community" onClick={onAnchor}>
            Contribute
          </a>
          <Ext href={UG_LINKS.o4e}>Olympiad4Everyone</Ext>
          <Ext href={START_A_CHAPTER_FORM}>Start a chapter</Ext>
        </nav>
        <div className="foot-col rv" style={css({ '--d': '180ms' })}>
          <p className="foot-k lbl">Contact</p>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          <Ext href={MAA_URL}>MAA competitions</Ext>
        </div>
      </div>
      <div className="wrap foot-bar lbl">
        <span>© {new Date().getFullYear()} USAMO Guide</span>
        <span>Attribution required. Commercial use not allowed.</span>
        <span>Not an official MAA syllabus.</span>
        <span>
          <Link to={UG_LINKS.privacy}>Privacy</Link> ·{' '}
          <Link to={UG_LINKS.terms}>Terms</Link>
        </span>
      </div>
      <div className="foot-mark" aria-hidden="true">
        USAMO Guid
        <span className="fm-e">
          e<span className="foot-bubble">bye! go solve something</span>
          <img
            className="foot-fox"
            src="/ug/img/panda-wave.webp"
            alt=""
            width="450"
            height="464"
          />
        </span>
      </div>
    </footer>
  );
}
