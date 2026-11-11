import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Link } from 'gatsby';
import React from 'react';
import type { AppUser } from '../../context/UserDataContext/UserDataContext';

export interface UserAvatarMenuProps {
  currentUser: AppUser;
  onSignOut: () => void;
}

export const UserAvatarMenu: React.FC<UserAvatarMenuProps> = props => {
  return (
    <Menu as="div" className="user-avatar-menu relative inline-block text-left">
      {() => (
        <>
          <div>
            <MenuButton className="user-avatar-trigger flex rounded-full border-2 border-transparent text-sm transition focus:border-blue-500 focus:outline-hidden dark:focus:border-white">
              <span className="sr-only">Open user menu</span>
              <img
                className="h-8 w-8 rounded-full"
                src={props.currentUser.photoURL ?? undefined}
                alt="User photo URL"
              />
            </MenuButton>
          </div>

          {/* Remove <Transition> and use transition prop on MenuItems */}
          <MenuItems
            transition
            className="user-avatar-panel absolute right-0 z-30 mt-2 w-56 origin-top-right rounded-md bg-white ring-1 ring-black/5 focus:outline-hidden data-[closed]:opacity-0 dark:bg-gray-800"
          >
            <div className="py-1">
              <MenuItem>
                {({ focus }) => (
                  <span
                    className={`user-avatar-item block w-full px-4 py-2 text-left text-sm leading-5 focus:outline-hidden ${focus ? 'user-avatar-item-focused' : ''}`}
                  >
                    <Link to="/settings" className="block w-full text-inherit">
                      Settings
                    </Link>
                  </span>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <button
                    onClick={() => {
                      props.onSignOut();
                    }}
                    role="menuitem"
                    className={`user-avatar-item block w-full px-4 py-2 text-left text-sm leading-5 focus:outline-hidden ${focus ? 'user-avatar-item-focused' : ''}`}
                  >
                    Sign out
                  </button>
                )}
              </MenuItem>
            </div>
          </MenuItems>
        </>
      )}
    </Menu>
  );
};
