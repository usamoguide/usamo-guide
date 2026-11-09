import React from 'react';
import toast from 'react-hot-toast';
import { useCurrentUser } from '../../context/UserDataContext/UserDataContext';
import { supabase } from '../../lib/supabaseClient';
import Btn from '../ug/Btn';
import { SettingsGroup } from './SettingRow';
import SignedOut from './SignedOut';

export default function Profile(): JSX.Element {
  const currentUser = useCurrentUser();

  const [name, setName] = React.useState(currentUser?.displayName);

  React.useEffect(() => {
    if (currentUser?.displayName) {
      setName(currentUser.displayName);
    } else {
      setName(null);
    }
  }, [currentUser?.displayName]);

  const handleSubmit = e => {
    if (!currentUser) throw new Error('User not logged in');
    e.preventDefault();
    supabase
      .from('profiles')
      .update({ display_name: name })
      .eq('id', currentUser.uid)
      .then(({ error }) => {
        if (error) {
          throw error;
        }
        return supabase.auth.updateUser({
          data: { full_name: name },
        });
      })
      .then(() => toast.success('Username updated'))
      .catch(err => {
        toast.error(err.message ?? 'Failed to update profile');
      });
  };

  return (
    <SettingsGroup title="Profile">
      {currentUser ? (
        <form className="ap-form" onSubmit={handleSubmit}>
          <div className="ap-field">
            <label htmlFor="display_name" className="ap-label">
              Display name
            </label>
            <input
              type="text"
              name="display_name"
              id="display_name"
              className="ap-in"
              autoComplete="nickname"
              value={name ?? ''}
              onChange={e => setName(e.target.value)}
            />
          </div>
          {currentUser.email ? (
            <div className="ap-field">
              <span className="ap-label">Email</span>
              <p className="ap-val">{currentUser.email}</p>
            </div>
          ) : null}
          <div>
            <Btn kind="p" size="sm" type="submit">
              Save
            </Btn>
          </div>
        </form>
      ) : (
        <SignedOut what="update your profile" />
      )}
    </SettingsGroup>
  );
}
