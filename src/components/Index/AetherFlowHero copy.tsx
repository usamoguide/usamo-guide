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
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(5, 3, 7, 0.18) 0%, rgba(5, 3, 7, 0.08) 42%, rgba(5, 3, 7, 0.72) 100%), url('/images/bg6.png')",
          backgroundSize: 'cover, cover',
          backgroundPosition: 'center, center bottom',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="relative z-10 flex min-h-[80svh] flex-col items-center justify-center px-6 pt-12 pb-16 text-center">
        <div className="relative inline-block max-w-6xl">
          <h1
            className="text-[clamp(4.5rem,13vw,11rem)] leading-[0.82] font-black tracking-[-0.06em] text-balance text-[#F4EDEA]"
            style={{ fontFamily: 'var(--font-family)' }}
          >
            USAMO
            <br />
            <span className="text-[#FF3764]">Guide</span>
          </h1>
          <img
            src="/images/Titlemascot.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -top-9 -right-9 hidden w-16 rotate-[14deg] min-[640px]:block md:-top-12 md:-right-14 md:w-24 lg:-top-16 lg:-right-20 lg:w-32"
          />
        </div>

        <p className="mt-8 max-w-3xl font-mono text-base leading-relaxed font-semibold text-balance text-[#F4EDEA]/90 md:text-xl">
          USAMO Guide is the world's largest nonprofit movement of teenagers
          making Olympiad Math Free and Accessible.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="purple-motion-effect inline-flex items-center justify-center border border-[#FF3764] bg-[#FF3764] px-6 py-3 font-mono text-base leading-tight font-bold text-[#050307] transition-transform hover:-translate-y-1 md:px-8 md:py-3"
            style={
              {
                boxShadow: 'none',
                '--pme-color': '#050307',
                '--pme-hover-color': '#050307',
                '--pme-wipe-bg': '#F4EDEA',
              } as React.CSSProperties
            }
          >
            Start learning →
          </Link>
          <Link
            to="/foundations"
            className="purple-motion-effect inline-flex items-center justify-center border border-[#F4EDEA]/60 bg-[#050307]/35 px-6 py-3 font-mono text-base leading-tight font-bold text-[#F4EDEA] backdrop-blur-sm transition-transform hover:-translate-y-1 md:px-8 md:py-3"
            style={
              {
                boxShadow: 'none',
                '--pme-color': '#F4EDEA',
                '--pme-hover-color': '#050307',
                '--pme-wipe-bg': '#F4EDEA',
              } as React.CSSProperties
            }
          >
            Explore the roadmap
          </Link>
        </div>
      </div>

      <div className="absolute right-0 bottom-0 left-0 z-10 flex items-end justify-between px-6 pb-8 md:px-10 lg:px-14">
        <p className="max-w-[13rem] -rotate-2 font-mono text-[11px] leading-relaxed font-bold tracking-[0.16em] text-[#F4EDEA]/85 uppercase">
          Written by
          <br />
          USA(J)MO medalists
        </p>
        <a
          href="https://github.com/usamoguide/usamo-guide"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex cursor-pointer items-center gap-2 border border-[#F4EDEA]/40 bg-[#050307]/35 px-3 py-2 font-mono text-[10px] font-bold tracking-[0.18em] text-[#F4EDEA] uppercase backdrop-blur-sm transition-colors hover:bg-[#F4EDEA] hover:text-[#050307]"
        >
          <svg
            viewBox="0 0 16 16"
            className="h-4 w-4 flex-shrink-0 fill-current"
            aria-hidden="true"
          >
            <path
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
              0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
              -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
              .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
              -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27
              .68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12
              .51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48
              0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
            />
          </svg>
          <span>Open source</span>
        </a>
      </div>
      <style>{`
        .hero-navbar {
          transition: background 300ms ease, border-color 300ms ease, backdrop-filter 300ms ease;
        }
        .hero-nav-typography {
          font-family: 'Phantom Sans', system-ui, sans-serif;
          font-size: 18px;
          font-weight: 400;
          line-height: normal;
          letter-spacing: normal;
          color: rgba(244, 237, 234, 0.78);
          background-color: transparent;
        }
        .hero-nav-cta {
          --red: #ff3764;
          --paper: #f4edea;
          color: #17171d;
          background-color: var(--paper);
          transition:
            background-color 180ms ease,
            color 180ms ease;
        }
        .hero-nav-cta:hover {
          background-color: var(--red);
          color: var(--paper);
        }
        .hero-nav-cta:active {
          transform: scale(0.98);
        }
        .hero-nav-auth {
          transition: color 180ms ease;
        }
        .hero-nav-auth:hover {
          color: #ff3764;
        }
        .hero-nav-arrow {
          opacity: 0.8;
          transition: transform 160ms ease, opacity 160ms ease;
        }
        .hero-nav-link:hover .hero-nav-arrow,
        .hero-nav-link:focus-visible .hero-nav-arrow {
          opacity: 1;
          transform: translateY(1px);
        }
        .hero-dropdown {
          animation: heroDropdownIn 180ms cubic-bezier(0.23, 1, 0.32, 1);
        }
        .hero-mobile-overlay {
          transition: opacity 240ms cubic-bezier(0.23, 1, 0.32, 1), transform 240ms cubic-bezier(0.23, 1, 0.32, 1), visibility 0ms linear 240ms;
        }
        .hero-mobile-overlay.visible {
          transition: opacity 240ms cubic-bezier(0.23, 1, 0.32, 1), transform 240ms cubic-bezier(0.23, 1, 0.32, 1), visibility 0ms linear 0ms;
        }
        .hero-mobile-item {
          opacity: 0;
          transform: translate3d(0, 12px, 0);
          transition: transform 240ms cubic-bezier(0.23, 1, 0.32, 1), opacity 180ms ease-out;
        }
        .hero-mobile-overlay.visible .hero-mobile-item {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }
        .hero-mobile-overlay.visible .hero-mobile-item:nth-child(1) { transition-delay: 40ms; }
        .hero-mobile-overlay.visible .hero-mobile-item:nth-child(2) { transition-delay: 65ms; }
        .hero-mobile-overlay.visible .hero-mobile-item:nth-child(3) { transition-delay: 90ms; }
        .hero-mobile-overlay.visible .hero-mobile-item:nth-child(4) { transition-delay: 115ms; }
        .hero-mobile-overlay.visible .hero-mobile-item:nth-child(5) { transition-delay: 140ms; }
        @keyframes heroDropdownIn {
          from { opacity: 0; transform: translate3d(-50%, 6px, 0); }
          to { opacity: 1; transform: translate3d(-50%, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-nav-arrow,
          .hero-dropdown,
          .hero-mobile-overlay,
          .hero-mobile-item {
            animation: none;
            transition: none;
          }
          .hero-mobile-item {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
