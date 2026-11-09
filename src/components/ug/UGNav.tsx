import { Link, navigate } from 'gatsby';
import * as React from 'react';
import { moduleIDToSectionMap, moduleIDToURLMap } from '../../../content/ordering';
import { useSignIn } from '../../context/SignInContext';
import { useLastViewedModule } from '../../context/UserDataContext/properties/simpleProperties';
import {
  useCurrentUser,
  useSignOutAction,
} from '../../context/UserDataContext/UserDataContext';
import Btn from './Btn';
import { initialsOf, useUGTheme } from './hooks';
import {
  IcoBook,
  IcoChev,
  IcoGear,
  IcoGrid,
  IcoMenu,
  IcoMoon,
  IcoSignOut,
  IcoSun,
  IcoUsers,
} from './icons';
import { UG_LINKS, UG_TRACKS } from './links';
import { Mark } from './MarkDefs';
import SettingsMenu from './SettingsMenu';

export type NavCurrent =
  | 'tracks'
  | 'problems'
  | 'start'
  | 'dashboard'
  | 'about'
  | 'contact'
  | 'settings'
  | 'groups'
  | null;

/** An internal path renders a Gatsby Link; anything else a plain anchor. */
function L({
  to,
  children,
  ...rest
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  'aria-current'?: 'page';
}) {
  if (/^(https?:|mailto:)/.test(to)) {
    return (
      <a href={to} target={to.startsWith('http') ? '_blank' : undefined} rel="noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} {...rest}>
      {children}
    </Link>
  );
}

// Olympiad4Everyone is a top-level tab (where the export has Contests), not a resource.
const O4E = (landing: boolean) => ({
  label: 'Olympiad4Everyone',
  to: landing ? '#o4e' : UG_LINKS.o4eSection,
});

const RESOURCES = (landing: boolean) => [
  { label: 'Discord', to: UG_LINKS.discord },
  { label: 'GitHub', to: UG_LINKS.github },
  { label: 'FAQ', to: landing ? '#faq' : UG_LINKS.faq },
  { label: 'Other resources', to: UG_LINKS.otherResources },
];

/** Where "Continue learning" and "My track" go for someone who has started. */
export function useContinueTarget(): { module: string | null; track: string } {
  const last = useLastViewedModule();
  const module = last && moduleIDToURLMap[last] ? moduleIDToURLMap[last] : null;
  const division = last ? moduleIDToSectionMap[last] : null;
  return { module, track: division ? `/${division}` : '/foundations' };
}

/**
 * The redesign's top bar. `variant="landing"` is the landing page's copy: the
 * logo scrolls to the top, there is no settings gear, and it carries the scroll
 * progress line. `wide` uses the wider container of the module and problem pages.
 */
export default function UGNav({
  variant = 'app',
  wide = false,
  current = null,
  onLandingAnchor,
}: {
  variant?: 'app' | 'landing';
  wide?: boolean;
  current?: NavCurrent;
  /** landing only: in-page anchor clicks (for smooth scrolling) */
  onLandingAnchor?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}): JSX.Element {
  const landing = variant === 'landing';
  const user = useCurrentUser();
  const signOut = useSignOutAction();
  const { signIn } = useSignIn();
  const { dark, toggle } = useUGTheme();
  const cont = useContinueTarget();
  const resources = RESOURCES(landing);
  const o4e = O4E(landing);
  const cur = (k: NavCurrent) => (current === k ? ('page' as const) : undefined);

  const doSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // No "Start learning" button in the bar (product decision; the export has
  // one). Signed-in readers with a module in progress still get "Continue".
  const startCta =
    user && cont.module ? (
      <Btn kind="p" size="sm" className="nav-start" to={cont.module} arrow>
        Continue learning
      </Btn>
    ) : null;

  const anchor = (to: string, label: string) =>
    landing && to.startsWith('#') ? (
      <a key={label} href={to} onClick={onLandingAnchor}>
        {label}
      </a>
    ) : (
      <L key={label} to={to}>
        {label}
      </L>
    );

  return (
    <header className="nav">
      <div className={`${wide ? 'wrap-w' : 'wrap'} nav-in`}>
        {landing ? (
          <a className="brand" href="#top" aria-label="USAMO Guide, back to top" onClick={onLandingAnchor}>
            <Mark />
            <span className="wm" aria-hidden="true">
              USAMO Guide
            </span>
          </a>
        ) : (
          <Link className="brand" to="/" aria-label="USAMO Guide, home">
            <Mark />
            <span className="wm" aria-hidden="true">
              USAMO Guide
            </span>
          </Link>
        )}
        <nav className="nav-links" aria-label="Main">
          <div className="nav-dd">
            <button className="nav-dd-t" type="button" aria-haspopup="true" aria-current={cur('tracks')}>
              Tracks
              <IcoChev className="chev" />
            </button>
            <div className="nav-menu">
              {UG_TRACKS.map(t => (
                <Link key={t.id} to={`/${t.id}`}>
                  {t.label}
                </Link>
              ))}
            </div>
          </div>
          <Link to={UG_LINKS.problems} aria-current={cur('problems')}>
            Problems
          </Link>
          {/* Olympiad4Everyone sits where the export has Contests (product decision) */}
          {anchor(o4e.to, o4e.label)}
          <div className="nav-dd">
            <button className="nav-dd-t" type="button" aria-haspopup="true">
              Resources
              <IcoChev className="chev" />
            </button>
            <div className="nav-menu">{resources.map(r => anchor(r.to, r.label))}</div>
          </div>
          <Link to={UG_LINKS.about} aria-current={cur('about')}>
            About
          </Link>
          <Link to={UG_LINKS.contact} aria-current={cur('contact')}>
            Contact Us
          </Link>
        </nav>
        <div className="nav-cta">
          <span className="nav-sep" aria-hidden="true" />
          {user ? (
            <details className="nav-user" data-dismiss="">
              <summary aria-label="Your account">
                <span className="av" aria-hidden="true">
                  {initialsOf(user.displayName, user.email)}
                </span>
              </summary>
              <div className="nu-pop">
                <p className="nu-name">
                  {user.displayName || 'Your account'}
                  {user.email ? <span>{user.email}</span> : null}
                </p>
                <Link to={UG_LINKS.dashboard} aria-current={cur('dashboard')}>
                  <IcoGrid />
                  Dashboard
                </Link>
                <Link to={cont.track}>
                  <IcoBook />
                  My track
                </Link>
                <Link to={UG_LINKS.groups} aria-current={cur('groups')}>
                  <IcoUsers />
                  Groups
                </Link>
                <Link to={UG_LINKS.settings} aria-current={cur('settings')}>
                  <IcoGear />
                  Account settings
                </Link>
                <a
                  href="/"
                  onClick={e => {
                    e.preventDefault();
                    doSignOut();
                  }}
                >
                  <IcoSignOut />
                  Sign out
                </a>
              </div>
            </details>
          ) : (
            <button className="nav-login" type="button" onClick={() => signIn()}>
              Login
            </button>
          )}
          {landing ? null : <SettingsMenu />}
          <button
            className="theme-tg"
            type="button"
            onClick={toggle}
            aria-label="Dark mode"
            aria-pressed={dark ? 'true' : 'false'}
          >
            <IcoMoon className="tg-moon" />
            <IcoSun className="tg-sun" />
          </button>
          {startCta}
          <details className="nav-mm" data-dismiss="">
            <summary aria-label="Menu">
              <IcoMenu />
            </summary>
            <div className="nav-sheet">
              <p className="nav-sheet-k">Tracks</p>
              {UG_TRACKS.map(t => (
                <Link key={t.id} to={`/${t.id}`}>
                  {t.label}
                </Link>
              ))}
              <hr />
              <Link to={UG_LINKS.problems}>Problems</Link>
              {anchor(o4e.to, o4e.label)}
              {user ? (
                <Link to={UG_LINKS.dashboard}>Dashboard</Link>
              ) : (
                <Link to={UG_LINKS.start}>Start learning</Link>
              )}
              <p className="nav-sheet-k">Resources</p>
              {resources.map(r => anchor(r.to, r.label))}
              <hr />
              <Link to={UG_LINKS.about}>About</Link>
              <Link to={UG_LINKS.contact}>Contact Us</Link>
              {user ? (
                <>
                  <Link to={UG_LINKS.settings}>Account settings</Link>
                  <a
                    href="/"
                    onClick={e => {
                      e.preventDefault();
                      doSignOut();
                    }}
                  >
                    Sign out
                  </a>
                </>
              ) : (
                <a
                  href="#login"
                  onClick={e => {
                    e.preventDefault();
                    signIn();
                  }}
                >
                  Login
                </a>
              )}
            </div>
          </details>
        </div>
      </div>
      {landing ? <div className="nav-prog" aria-hidden="true" /> : null}
    </header>
  );
}
