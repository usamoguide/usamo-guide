import React from 'react';
import toast from 'react-hot-toast';
import {
  UserPermissionInformation,
  UserPermissions,
} from '../../context/UserDataContext/UserPermissionsContext';
import { supabase } from '../../lib/supabaseClient';
import Switch from '../elements/Switch';

export default function AdminSettings() {
  const [email, setEmail] = React.useState('');
  const [searching, setSearching] = React.useState(false);

  // the type is actually auth.getUsersResult...
  const [userData, setUserData] = React.useState<any>(null);
  const [userPermissions, setUserPermissions] = React.useState<
    { [key in UserPermissions]: boolean } | null
  >(null);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const editUserPermissions = updates => {
    setUserPermissions({
      ...(userPermissions || {}),
      ...updates,
    });
  };

  const handleSearch = async e => {
    e?.preventDefault();

    setSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'admin-get-user',
        {
          body: { email },
        }
      );
      if (error) throw error;
      if (!data || data.users.length === 0) {
        toast.error('The user with email ' + email + ' could not be found.');
      } else {
        console.log('Got user: ', data.users[0]);
        setUserData(data.users[0]);
        setUserPermissions(data.users[0].customClaims);
      }
    } catch (e) {
      toast.error(e.message);
    }

    setSearching(false);
  };

  const handleUpdateUserPermissions = async e => {
    e.preventDefault();

    if (!userData.customClaims?.isAdmin && userPermissions?.isAdmin) {
      if (
        !confirm(
          'Are you sure you want to grant this user admin permissions? This will give the user complete control over the database!'
        )
      ) {
        return;
      }
    }

    setIsUpdating(true);

    try {
      const { error } = await supabase.functions.invoke(
        'admin-set-user-permissions',
        {
          body: {
            target: userData.uid,
            claims: userPermissions,
          },
        }
      );
      if (error) throw error;
      toast(
        'Updated user permissions! The target user may have to sign out and sign back in to complete the changes.',
        {
          duration: 6000,
        }
      );
      handleSearch(null);
    } catch (e) {
      toast.error(e.message);
    }

    setIsUpdating(false);
  };

  return (
    <div>
      <div className="space-y-1">
        <h3 className="ap-set-h2">User Search</h3>
      </div>
      <div className="h-4" />
      <div>
        <form className="space-y-6" onSubmit={handleSearch}>
          <div>
            <label htmlFor="search_email" className="ap-label">
              User Email
            </label>
            <div className="ap-inrow">
              <div className="ap-grow">
                <input
                  type="email"
                  name="search_email"
                  id="search_email"
                  className="ap-in"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                className="tbtn ap-tbtn"
                type="submit"
                disabled={searching}
              >
                <svg
                  className="ico"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span>{searching ? 'Searching...' : 'Search'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {userData && (
        <>
          <div className="h-8" />

          <div>
            <div className="mb-4 flex items-center">
              <div className="mr-4 shrink-0">
                <img src={userData.photoURL} className="ap-avatar" />
              </div>
              <div>
                <h4 className="text-lg font-bold">{userData.displayName}</h4>
                <p>{userData.email}</p>
              </div>
            </div>
            <div className="mb-3">
              <div className="ap-label">Account Disabled?</div>
              <p className="ap-val">{userData.disabled ? 'Yes' : 'No'}</p>
            </div>
            <div className="mb-3">
              <div className="ap-label">User ID</div>
              <p className="ap-val">{userData.uid}</p>
            </div>
            <div className="mb-3">
              <div className="ap-label">
                This information has also been logged to the console.
              </div>
            </div>
          </div>
          <div className="h-4" />
          <h4 className="ap-set-h2">User Permissions</h4>
          <form onSubmit={handleUpdateUserPermissions}>
            <div>
              <ul className="ap-perms">
                {Object.keys(UserPermissionInformation).map(key => (
                  <li
                    className="flex items-center justify-between py-4"
                    key={key}
                  >
                    <div className="flex flex-col">
                      <p className="ap-perm-t">
                        {UserPermissionInformation[key].label}
                      </p>
                      <span className="ap-perm-d">
                        {UserPermissionInformation[key].description}
                      </span>
                    </div>
                    <Switch
                      checked={userPermissions?.[key] || false}
                      onChange={b => editUserPermissions({ [key]: b })}
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div className="h-1" />

            <div className="flex">
              <button
                type="submit"
                className="tbtn ap-tbtn"
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Update User Permissions'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
