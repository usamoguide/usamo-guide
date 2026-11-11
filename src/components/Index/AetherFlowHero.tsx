import { Link } from 'gatsby';
import * as React from 'react';
import { useSignIn } from '../../context/SignInContext';
import {
  useCurrentUser,
  useIsUserDataLoaded,
  useSignOutAction,
} from '../../context/UserDataContext/UserDataContext';
import { LoadingSpinner } from '../elements/LoadingSpinner';
import Banner from '../TopNavigationBar/Banner';
import { UserAvatarMenu } from '../TopNavigationBar/UserAvatarMenu';
import LearnContestMathHero from './LearnContestMath';

type HeroNavItem = { label: string; href: string };

const heroNavDropdowns: Record<string, HeroNavItem[]> = {
  Tracks: [
    { label: 'Foundations', href: '/foundations' },
    { label: 'Intermediate', href: '/intermediate' },
    { label: 'Advanced', href: '/advanced' },
    { label: 'Olympiad', href: '/usamo' },
  ],
  Resources: [
    { label: 'Other Useful Resources', href: '/other-useful-resources' },
    { label: 'USAMO Contests', href: 'https://contests.usamoguide.com/' },
    {
      label: 'Past AMC/AIME',
      href: 'https://artofproblemsolving.com/wiki/index.php/AMC_Problems_and_Solutions',
    },
  ],
};

const heroNavLinks = [
  { label: 'Problems', href: '/problems' },
  { label: 'Contests', href: 'https://contests.usamoguide.com/' },
  { label: 'Philosophy', href: '/philosophy' },
  { label: 'Contact Us', href: '/contact-us' },
];

function HeroNavLink({
  href,
  children,
  ...props
}: {
  href: string;
  children: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href.startsWith('/')) {
    return (
      <Link to={href} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" {...props}>
      {children}
    </a>
  );
}

export function HeroNavbar(): JSX.Element {
  const currentUser = useCurrentUser();
  const isUserDataLoaded = useIsUserDataLoaded();
  const signOut = useSignOutAction();
  const { signIn } = useSignIn();
  const [menuState, setMenuState] = React.useState<
    'closed' | 'opening' | 'open' | 'closing'
  >('closed');
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const openFrame = React.useRef<number | null>(null);
  const isOpen = menuState === 'opening' || menuState === 'open';
  const isMounted = menuState !== 'closed';

  const clearMenuTimers = React.useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (openFrame.current) cancelAnimationFrame(openFrame.current);
    closeTimer.current = null;
    openFrame.current = null;
  }, []);

  const openMenu = React.useCallback(() => {
    clearMenuTimers();
    if (isOpen) return;
    setMenuState('opening');
    openFrame.current = requestAnimationFrame(() => {
      setMenuState('open');
      openFrame.current = null;
    });
  }, [clearMenuTimers, isOpen]);

  const closeMenu = React.useCallback(() => {
    clearMenuTimers();
    if (menuState === 'closed' || menuState === 'closing') return;
    setMenuState('closing');
    closeTimer.current = setTimeout(() => {
      setMenuState('closed');
      closeTimer.current = null;
    }, 240);
  }, [clearMenuTimers, menuState]);

  React.useEffect(() => {
    if (!isMounted) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeMenu, isMounted]);

  React.useEffect(
    () => () => {
      clearMenuTimers();
    },
    [clearMenuTimers]
  );

  const navLinkClass =
    'hero-nav-link hero-nav-typography text-[#F4EDEA] no-underline transition-opacity duration-150';

  return (
    <>
      <Banner
        text="Join the USAMO Guide Discord Server. Regular updates are posted there!"
        action="Let me Join!"
        link="https://discord.gg/WZge4DWUuy"
      />
      <nav className="hero-navbar relative z-[1100] flex h-20 items-center justify-between px-8 lg:px-[clamp(16px,4vw,55px)]">
        <Link
          to="/"
          className="flex items-center no-underline"
          aria-label="USAMO Guide home"
        >
          <div className="h-12">
            <img
              src="/images/Test_logo.png"
              alt="USAMO Guide"
              className="h-12 w-12 object-contain"
            />
          </div>
          <span className="ml-2 bg-transparent text-[20px] leading-normal font-bold tracking-tight whitespace-nowrap text-[#F4EDEA]">
            USAMO Guide
          </span>
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {Object.entries(heroNavDropdowns).map(([label, items]) => (
            <div
              key={label}
              className="relative"
              onMouseEnter={() => {
                if (closeTimer.current) clearTimeout(closeTimer.current);
                setOpenDropdown(label);
              }}
              onMouseLeave={() => {
                closeTimer.current = setTimeout(
                  () => setOpenDropdown(null),
                  120
                );
              }}
              onFocus={() => setOpenDropdown(label)}
              onBlur={event => {
                if (
                  !event.currentTarget.contains(event.relatedTarget as Node)
                ) {
                  setOpenDropdown(null);
                }
              }}
            >
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={openDropdown === label}
                className={`${navLinkClass} flex items-center gap-1.5 border-0 bg-transparent p-0 hover:opacity-60`}
              >
                {label}
                <svg
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  aria-hidden="true"
                  className="hero-nav-arrow"
                >
                  <path
                    d="M1 1.5L6 6.5L11 1.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {openDropdown === label && (
                <div className="hero-dropdown absolute top-[calc(100%+8px)] left-1/2 z-[100] min-w-[220px] -translate-x-1/2 rounded-xl bg-[#1D171D] p-2 shadow-[0_16px_36px_rgba(0,0,0,0.28)]">
                  {items.map(item => (
                    <HeroNavLink
                      key={item.label}
                      href={item.href}
                      className="hero-dropdown-link hero-nav-typography block rounded-lg px-5 py-2.5 text-[#F4EDEA] no-underline transition-[background-color,color,padding-left,box-shadow] duration-200 hover:bg-white/10 hover:pl-[26px] hover:text-[#FF3764] hover:shadow-[0_4px_12px_rgba(236,55,80,0.12)]"
                    >
                      {item.label}
                    </HeroNavLink>
                  ))}
                </div>
              )}
            </div>
          ))}

          {heroNavLinks.map(item => (
            <HeroNavLink
              key={item.label}
              href={item.href}
              className={`${navLinkClass} hover:opacity-60`}
            >
              {item.label}
            </HeroNavLink>
          ))}

          {!isUserDataLoaded ? (
            <LoadingSpinner className="ml-3 h-5 w-5" />
          ) : currentUser ? (
            <div className="ml-3">
              <UserAvatarMenu
                currentUser={currentUser}
                onSignOut={() => signOut()}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={signIn}
              className="hero-nav-auth ml-1 border-0 bg-transparent px-2 py-1 text-sm font-medium text-[#F4EDEA]/85"
            >
              Login
            </button>
          )}
          <a
            href="https://discord.gg/WZge4DWUuy"
            target="_blank"
            rel="noreferrer"
            className="hero-nav-cta hero-nav-typography inline-flex h-11 shrink-0 items-center justify-center rounded-full px-5 whitespace-nowrap no-underline"
          >
            Join the community
          </a>
        </div>

        <button
          type="button"
          className="hero-menu-button flex h-10 w-10 flex-col items-center justify-center gap-[5px] border-0 bg-transparent lg:hidden"
          aria-label={isOpen ? 'Close menu' : 'Main menu'}
          aria-expanded={isOpen}
          aria-controls="hero-mobile-navigation"
          onClick={() => (isOpen ? closeMenu() : openMenu())}
        >
          {[0, 1, 2].map(line => (
            <span
              key={line}
              className={`block h-[3px] w-[26px] rounded-sm bg-[#F4EDEA] transition-[transform,opacity] duration-[220ms] ${
                line === 0 && isOpen
                  ? 'translate-y-2 rotate-45'
                  : line === 1 && isOpen
                    ? 'scale-x-0 opacity-0'
                    : line === 2 && isOpen
                      ? '-translate-y-2 -rotate-45'
                      : ''
              }`}
            />
          ))}
        </button>
      </nav>

      {isMounted && (
        <div
          id="hero-mobile-navigation"
          className={`hero-mobile-overlay fixed inset-0 z-[1090] overflow-y-auto bg-[#1D171D]/[0.98] text-[#F4EDEA] backdrop-blur-[14px] lg:hidden ${
            isOpen
              ? 'visible translate-y-0 opacity-100'
              : 'pointer-events-none invisible -translate-y-[14px] opacity-0'
          }`}
          aria-hidden={!isOpen}
        >
          <div className="flex min-h-full w-full flex-col px-8 pt-[104px] pb-6">
            <nav
              className="flex flex-1 flex-col gap-[14px]"
              aria-label="Mobile navigation"
            >
              {Object.entries(heroNavDropdowns).map(([label, items]) => (
                <div key={label} className="hero-mobile-item">
                  <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-[#F4EDEA]/45 uppercase">
                    {label}
                  </p>
                  <div className="grid gap-1">
                    {items.map(item => (
                      <HeroNavLink
                        key={item.label}
                        href={item.href}
                        className="hero-nav-typography rounded-lg px-3 py-2.5 text-[#F4EDEA]/90 no-underline transition-colors hover:bg-white/10 hover:text-[#FF3764]"
                        onClick={closeMenu}
                      >
                        {item.label}
                      </HeroNavLink>
                    ))}
                  </div>
                </div>
              ))}
              {heroNavLinks.map(item => (
                <HeroNavLink
                  key={item.label}
                  href={item.href}
                  className="hero-nav-typography rounded-lg px-3 py-2.5 text-[#F4EDEA]/90 no-underline transition-colors hover:bg-white/10 hover:text-[#FF3764]"
                  onClick={closeMenu}
                >
                  {item.label}
                </HeroNavLink>
              ))}
              <a
                href="https://discord.gg/WZge4DWUuy"
                target="_blank"
                rel="noreferrer"
                className="hero-nav-cta hero-nav-typography mt-4 inline-flex shrink-0 items-center justify-center rounded-full px-6 py-2.5 text-center no-underline"
              >
                Join the community
              </a>
              {currentUser ? (
                <button
                  type="button"
                  className="hero-mobile-item hero-nav-typography rounded-lg px-3 py-2.5 text-left text-[#F4EDEA]/90 transition-colors hover:bg-white/10 hover:text-[#FF3764]"
                  onClick={() => {
                    signOut();
                    closeMenu();
                  }}
                >
                  Sign out
                </button>
              ) : (
                <button
                  type="button"
                  className="hero-mobile-item hero-nav-typography rounded-lg px-3 py-2.5 text-left text-[#F4EDEA]/90 transition-colors hover:bg-white/10 hover:text-[#FF3764]"
                  onClick={() => {
                    signIn();
                    closeMenu();
                  }}
                >
                  Login
                </button>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export default function AetherFlowHero(): JSX.Element {
  return (
    <div
      data-page-tone="dark"
      className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-[#050307] text-[#F4EDEA]"
    >
      <HeroNavbar />
      <LearnContestMathHero />
    </div>
  );
}
