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
                'sections-dropdown-trigger group inline-flex h-full items-center gap-1 bg-transparent text-[18px] font-normal transition-colors focus:outline-hidden',
                open || sidebarNav
                  ? 'text-[#F5F0ED]'
                  : 'text-[#F5F0ED]/80 hover:text-[#F5F0ED]',
                !sidebarNav && 'focus:text-[#F5F0ED]'
              )}
            >
              <span>
                {currentSection ? SECTION_LABELS[currentSection] : 'Tracks'}
              </span>
              <ChevronDownIcon
                className={`${
                  open ? 'rotate-180 text-[#F5F0ED]' : 'text-[#F5F0ED]/60'
                } h-4 w-4 transition duration-150 ease-out group-hover:text-[#F5F0ED] group-focus:text-[#F5F0ED]`}
                aria-hidden="true"
              />
            </MenuButton>
            <MenuItems
              transition
              anchor="top start"
              className={`sections-dropdown-panel absolute left-0 z-[100] max-w-[calc(100vw-1rem)] min-w-[220px] rounded-xl bg-[#1D171D] p-2 shadow-[0_16px_36px_rgba(0,0,0,0.28)] ring-1 ring-white/5 focus:outline-none ${
                sidebarNav ? 'mt-2' : 'mt-3'
              } transition data-[closed]:-translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-150 data-[leave]:duration-100`}
              style={{ zIndex: 9999 }}
            >
              <div className="sections-dropdown-list py-1">
                {SECTIONS.map(section => {
                  const className = `sections-dropdown-item relative block w-full rounded-lg px-5 py-2.5 text-left font-['Phantom_Sans'] text-[18px] leading-normal whitespace-nowrap text-[#F4EDEA] transition-[background-color,color,padding-left,box-shadow] duration-200 hover:bg-white/10 hover:pl-[26px] hover:text-[#FF3764] hover:shadow-[0_4px_12px_rgba(236,55,80,0.12)] focus:outline-hidden data-[active]:bg-white/10 data-[active]:text-[#F4EDEA] data-[disabled]:text-[#F4EDEA]/45 ${section === currentSection ? 'sections-dropdown-item-current' : ''}`;
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
