import { Link } from 'gatsby';
import * as React from 'react';
import { UG_LINKS } from './links';
import { Mark } from './MarkDefs';

/** The compact footer of the app screens (the landing page has its own, larger one). */
export default function AppFooter({ wide = false }: { wide?: boolean }): JSX.Element {
  return (
    <footer className="afoot">
      <div className={`${wide ? 'wrap-w' : 'wrap'} afoot-in`}>
        <Link className="brand" to="/" aria-label="USAMO Guide, home">
          <Mark />
          <span className="wm" aria-hidden="true">
            USAMO Guide
          </span>
        </Link>
        <nav className="afoot-links" aria-label="Footer">
          <Link to="/foundations">Tracks</Link>
          <Link to={UG_LINKS.problems}>Problems</Link>
          <a href={UG_LINKS.contests} target="_blank" rel="noreferrer">
            Contests
          </a>
          <a href={UG_LINKS.discord} target="_blank" rel="noreferrer">
            Discord
          </a>
          <a href={UG_LINKS.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <Link to={UG_LINKS.contact}>Contact</Link>
        </nav>
        <p className="afoot-note">
          <span>© {new Date().getFullYear()} USAMO Guide</span>
          <span>Attribution required. Commercial use not allowed.</span>
          <span>Not an official MAA syllabus.</span>
          <span>
            <Link to={UG_LINKS.privacy}>Privacy</Link> · <Link to={UG_LINKS.terms}>Terms</Link>
          </span>
        </p>
      </div>
    </footer>
  );
}
