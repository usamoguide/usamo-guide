import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import clsx from 'clsx';
import { Link } from 'gatsby';
import * as React from 'react';
import { SECTIONS, SECTION_LABELS } from '../../content/ordering';
import { ClientOnly } from './ClientOnly';

export default function SectionsDropdown({
  currentSection = null as string | null,
  sidebarNav = false,
  onSelect = null as ((section: string) => void) | null,
}): JSX.Element {
  return (
    <ClientOnly>
      <Menu as="div">
        {({ open }) => (
          <div className="relative h-full">
            <MenuButton
              className={clsx(
                'group inline-flex items-center gap-1',
                sidebarNav ? 'text-base font-medium' : 'nav-capsule-link'
              )}
            >
              <span>
                {currentSection ? SECTION_LABELS[currentSection] : 'Tracks'}
              </span>
              <ChevronDownIcon
                className="h-4 w-4 opacity-70"
                aria-hidden="true"
              />
            </MenuButton>
            <MenuItems
              transition
              anchor="top start"
              className={`nav-dropdown-panel absolute left-0 z-[100] -ml-4 w-72 max-w-[calc(100vw-1rem)] focus:outline-none ${
                sidebarNav ? 'mt-2' : '-mt-2'
              } transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[enter]:ease-out data-[leave]:duration-150 data-[leave]:ease-in`}
              style={{ zIndex: 9999 }}
            >
              <div className="py-1">
                {SECTIONS.map(section => {
                  const className =
                    'w-full text-left block px-4 py-2 text-base font-medium leading-6 whitespace-normal break-words focus:outline-hidden text-gray-700 dark:text-gray-100 data-[active]:bg-gray-100 data-[active]:text-gray-900 dark:data-[active]:bg-gray-700 dark:data-[active]:text-gray-100 data-[disabled]:text-gray-400 dark:data-[disabled]:text-dark-med-emphasis relative';
                  const children = (
                    <>
                      {SECTION_LABELS[section]}
                      {section === currentSection && (
                        <span className="dark:text-dark-med-emphasis absolute inset-y-0 right-0 flex items-center pr-4 text-gray-300">
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </>
                  );
                  return (
                    <MenuItem
                      key={section}
                      disabled={section === currentSection}
                    >
                      {section === currentSection ? (
                        <span className={className}>{children}</span>
                      ) : onSelect ? (
                        <button
                          className={className}
                          onClick={() => onSelect(section)}
                        >
                          {children}
                        </button>
                      ) : (
                        <Link className={className} to={`/${section}/`}>
                          {children}
                        </Link>
                      )}
                    </MenuItem>
                  );
                })}
              </div>
            </MenuItems>
          </div>
        )}
      </Menu>
    </ClientOnly>
  );
}
