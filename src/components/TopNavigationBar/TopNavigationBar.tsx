import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import {
  BookmarkIcon,
  ChartBarIcon,
  ChatAltIcon,
  ChevronDownIcon,
  CogIcon,
  ExternalLinkIcon,
  InformationCircleIcon,
  LoginIcon,
  LogoutIcon,
  PresentationChartLineIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/solid';
import classNames from 'classnames';
import { Link } from 'gatsby';
import * as React from 'react';
import { useState } from 'react';
import { useSignIn } from '../../context/SignInContext';
import {
  useCurrentUser,
  useIsUserDataLoaded,
  useSignOutAction,
} from '../../context/UserDataContext/UserDataContext';
import { LoadingSpinner } from '../elements/LoadingSpinner';
import Logo from '../Logo';
import SectionsDropdown from '../SectionsDropdown';
import Banner from './Banner';
import { UserAvatarMenu } from './UserAvatarMenu';

export default function TopNavigationBar({
  transparent = false,
  linkLogoToIndex = false,
  currentSection = null,
  hidePromoBar = false,
  redirectToDashboard = false,
  /** Staggered entrance for the nav items. Only the landing page uses it. */
  animateEntrance = false,
}) {
  const currentUser = useCurrentUser();
  const contestsUrl = 'https://contests.usamoguide.com/';
  const signOut = useSignOutAction();
  const isLoaded = useIsUserDataLoaded();
  const { signIn } = useSignIn();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const resources = [
    {
      name: 'Other Useful Resources',
      description: 'Topic-by-topic external resources curated by USAMO Guide.',
      href: '/other-useful-resources',
      icon: PresentationChartLineIcon,
      iconSrc: '/images/otherresourcesicon.jpg',
    },
    {
      name: 'USAMO Contests',
      description:
        'Live contests, archives, and contest-specific features on our contests platform.',
      href: contestsUrl,
      icon: ChartBarIcon,
      iconSrc: '/images/Contestsicon.jpg',
    },
    {
      name: 'Past AMC/AIME',
      description: 'Official problem archives and scoring details.',
      href: 'https://artofproblemsolving.com/wiki/index.php/AMC_Problems_and_Solutions',
      icon: ChartBarIcon,
      iconSrc: '/images/wikicon.jpg',
    },
  ];

  const solutions = [
    {
      name: 'Foundations (AMC 8)',
      href: '/foundations',
      icon: BookmarkIcon,
      key: 'foundations',
    },
    {
      name: 'Intermediate (AMC 10-12)',
      href: '/intermediate',
      icon: BookmarkIcon,
      key: 'intermediate',
    },
    {
      name: 'Advanced (AIME)',
      href: '/advanced',
      icon: BookmarkIcon,
      key: 'advanced',
    },
    {
      name: 'Olympiad (USA(J)MO)',
      href: '/usamo',
      icon: BookmarkIcon,
      key: 'usamo',
    },
  ];
  return (
    <>
      {!hidePromoBar && (
        <>
          <Banner
            text="Join the USAMO Guide Discord Server. Regular updates are posted there!"
            action="Let me Join!"
            link="https://discord.gg/WZge4DWUuy"
          />
        </>
      )}

      <nav
        className={classNames(
          //!transparent && 'nav-surface',
          'relative z-50',
          !hidePromoBar && 'nav-with-banner'
        )}
      >
        <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
          <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="flex px-2 lg:px-0">
              <Link
                to={linkLogoToIndex ? '/' : '/dashboard'}
                state={{ redirect: redirectToDashboard }}
                className={classNames(
                  'nav-logo-pill flex shrink-0 items-center',
                  animateEntrance && 'nav-item-enter'
                )}
              >
                <div className="h-7 sm:h-8">
                  <Logo />
                </div>
              </Link>
            </div>

            <div className="hidden justify-center lg:flex">
              <div
                className={classNames(
                  'nav-capsule',
                  animateEntrance && 'nav-enter'
                )}
                style={
                  animateEntrance
                    ? ({ '--nav-enter-base': '110ms' } as React.CSSProperties)
                    : undefined
                }
              >
                <SectionsDropdown currentSection={currentSection} />
                <Link
                  to="/problems/"
                  getProps={({ isCurrent }) => ({
                    className: 'nav-capsule-link',
                    'aria-current': isCurrent ? 'page' : undefined,
                  })}
                >
                  Problems
                </Link>
                <a
                  href={contestsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="nav-capsule-link"
                >
                  Contests
                </a>
                <Popover className="h-full">
                  <PopoverButton className="nav-capsule-link group inline-flex items-center gap-1">
                    <span>Resources</span>
                    <ChevronDownIcon
                      className="h-4 w-4 opacity-70"
                      aria-hidden="true"
                    />
                  </PopoverButton>
                  <PopoverPanel
                    transition
                    className="absolute left-1/2 z-[120] -mt-2 hidden w-screen max-w-md -translate-x-1/2 transform px-2 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[enter]:ease-out data-[leave]:duration-150 data-[leave]:ease-in sm:px-0 md:block lg:max-w-3xl"
                  >
                    <div className="nav-dropdown-panel overflow-hidden">
                      <div className="relative grid gap-6 px-5 py-6 sm:gap-8 sm:p-8 lg:grid-cols-2">
                        {resources.map(item => {
                          const isInternal = item.href.startsWith('/');

                          const body = (
                            <>
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center text-white sm:h-12 sm:w-12">
                                {item.iconSrc ? (
                                  <img
                                    src={item.iconSrc}
                                    alt=""
                                    aria-hidden="true"
                                    className="h-full w-full object-contain"
                                  />
                                ) : (
                                  <item.icon
                                    className="h-6 w-6"
                                    aria-hidden="true"
                                  />
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="dark:text-dark-high-emphasis flex text-base font-medium text-gray-900">
                                  {item.name}
                                  {!isInternal && (
                                    <span className="mt-0.5 ml-2 h-5 w-5 text-gray-400">
                                      <ExternalLinkIcon />
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                  {item.description}
                                </p>
                              </div>
                            </>
                          );

                          if (isInternal) {
                            return (
                              <Link
                                key={item.name}
                                to={item.href}
                                className="-m-3 flex items-start rounded-lg p-3 transition duration-150 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                {body}
                              </Link>
                            );
                          }

                          return (
                            <a
                              key={item.name}
                              href={item.href}
                              target="_blank"
                              rel="noreferrer"
                              className="-m-3 flex items-start rounded-lg p-3 transition duration-150 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              {body}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </PopoverPanel>
                </Popover>
                <Link to="/about" className="nav-capsule-link">
                  About
                </Link>
                <Link to="/contact-us" className="nav-capsule-link">
                  Contact Us
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-end gap-1">
              <div className="flex items-center lg:hidden">
                {/* Mobile menu button */}
                <button
                  className="mobile-menu-button-container inline-flex items-center justify-center p-2"
                  aria-label="Main menu"
                  aria-expanded="false"
                  onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                >
                  {/* Icon when menu is closed. */}
                  {/* Menu open: "hidden", Menu closed: "block" */}
                  <svg
                    className={`${isMobileNavOpen ? 'hidden' : 'block'} h-6 w-6`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                  {/* Icon when menu is open. */}
                  {/* Menu open: "block", Menu closed: "hidden" */}
                  <svg
                    className={`${isMobileNavOpen ? 'block' : 'hidden'} h-6 w-6`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div
                className={classNames(
                  'hidden lg:flex lg:items-center',
                  animateEntrance && 'nav-enter'
                )}
                style={
                  animateEntrance
                    ? ({ '--nav-enter-base': '770ms' } as React.CSSProperties)
                    : undefined
                }
              >
                {currentUser ? (
                  <UserAvatarMenu
                    currentUser={currentUser}
                    onSignOut={() => signOut()}
                  />
                ) : !isLoaded ? (
                  <div className="p-2.5">
                    <LoadingSpinner className="h-4 w-4" />
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => signIn()}
                      className="btn btn-sm btn-primary"
                    >
                      Log in
                    </button>

                    {/* Settings button */}
                    <Link
                      to="/settings"
                      className="nav-capsule-link ml-1 inline-flex p-1.5"
                      aria-label="Settings"
                    >
                      <svg
                        className="h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        {/*
        Mobile menu, toggle classes based on menu state.

        Menu open: "block", Menu closed: "hidden
      */}
        <div className={`${isMobileNavOpen ? 'block' : 'hidden'} lg:hidden`}>
          <div className="grid grid-cols-1 divide-y divide-gray-300 pb-6 dark:divide-gray-800">
            <div className="px-4 py-5">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {solutions.map(item => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="group -m-3 flex items-center rounded-md p-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <item.icon
                      className="h-6 w-6 shrink-0 text-gray-600 dark:group-hover:text-gray-400"
                      aria-hidden="true"
                    />
                    <span className="ml-3 text-base font-medium text-gray-700 dark:text-gray-300">
                      {item.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="px-4 py-5">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <Link
                  to="/groups/"
                  className="group -m-3 flex items-center rounded-md p-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <UserGroupIcon
                    className="h-6 w-6 shrink-0 text-gray-600 dark:group-hover:text-gray-400"
                    aria-hidden="true"
                  />
                  <span className="ml-3 text-base font-medium text-gray-700 dark:text-gray-300">
                    Groups
                  </span>
                </Link>
                {resources.map(item => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group -m-3 flex items-center rounded-md p-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {item.iconSrc ? (
                      <img
                        src={item.iconSrc}
                        alt=""
                        aria-hidden="true"
                        className="h-6 w-6 shrink-0 object-contain"
                      />
                    ) : (
                      <item.icon
                        className="h-6 w-6 shrink-0 text-gray-600 dark:group-hover:text-gray-400"
                        aria-hidden="true"
                      />
                    )}
                    <span className="ml-3 text-base font-medium text-gray-700 dark:text-gray-300">
                      {item.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
            <div className="px-4 pt-5">
              <nav className="grid gap-y-8">
                <Link
                  key="Problems"
                  to="/problems"
                  className="group -m-3 flex items-center rounded-md p-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <QuestionMarkCircleIcon
                    className="h-6 w-6 shrink-0 text-gray-600 dark:group-hover:text-gray-400"
                    aria-hidden="true"
                  />
                  <span className="ml-3 text-base font-medium text-gray-700 dark:text-gray-300">
                    Problems
                  </span>
                </Link>
                <a
                  href={contestsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group -m-3 flex items-center rounded-md p-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChartBarIcon
                    className="h-6 w-6 shrink-0 text-gray-600 dark:group-hover:text-gray-400"
                    aria-hidden="true"
                  />
                  <span className="ml-3 text-base font-medium text-gray-700 dark:text-gray-300">
                    Contests
                  </span>
                </a>
                <Link
                  to="/contact-us"
                  className="group -m-3 flex items-center rounded-md p-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChatAltIcon
                    className="float-left h-6 w-6 text-gray-600 dark:group-hover:text-gray-400"
                    aria-hidden="true"
                  />
                  <span className="ml-3 text-base font-medium text-gray-700 dark:text-gray-300">
                    Contact Us
                  </span>
                </Link>
                <Link
                  to="/about"
                  className="group -m-3 flex items-center rounded-md p-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <InformationCircleIcon
                    className="float-left h-6 w-6 text-gray-600 dark:group-hover:text-gray-400"
                    aria-hidden="true"
                  />
                  <span className="ml-3 text-base font-medium text-gray-700 dark:text-gray-300">
                    About
                  </span>
                </Link>
                <Link
                  key="Settings"
                  to="/settings"
                  className="group -m-3 flex items-center rounded-md p-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <CogIcon
                    className="h-6 w-6 shrink-0 text-gray-600 dark:group-hover:text-gray-400"
                    aria-hidden="true"
                  />
                  <span className="ml-3 text-base font-medium text-gray-700 dark:text-gray-300">
                    Settings
                  </span>
                </Link>
                {currentUser ? (
                  <a
                    className="group -m-3 flex items-center rounded-md p-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => signOut()}
                  >
                    <LogoutIcon
                      className="float-left h-6 w-6 text-gray-600 dark:group-hover:text-gray-400"
                      aria-hidden="true"
                    />
                    <span className="ml-3 text-base font-medium text-gray-700 dark:text-gray-300">
                      Sign Out
                    </span>
                  </a>
                ) : (
                  <a
                    className="group -m-3 flex cursor-pointer items-center rounded-md p-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => signIn()}
                  >
                    <LoginIcon
                      className="float-left h-6 w-6 text-gray-600 dark:group-hover:text-gray-400"
                      aria-hidden="true"
                    />
                    <span className="ml-3 text-base font-medium text-gray-700 dark:text-gray-300">
                      Sign In
                    </span>
                  </a>
                )}
              </nav>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
