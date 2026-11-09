import * as React from 'react';
import Layout from '../components/layout';
import SEO from '../components/seo';
import AdminSettings from '../components/Settings/AdminSettings';
import Authentication from '../components/Settings/Authentication';
import General from '../components/Settings/General';
import Profile from '../components/Settings/Profile';
import UserData from '../components/Settings/UserData';
import TopNavigationBar from '../components/TopNavigationBar/TopNavigationBar';
import { AppPageHead } from '../components/ug/pages/AppPage';
import { useUserPermissions } from '../context/UserDataContext/UserPermissionsContext';

/*
1. General

- Dark Mode / Hide difficulty + tags / Show ignored problems & modules on dashboard

2. Profile

- Name
- Photo
- Email

3. Authentication

- Github / Google
- Login / Logout

4. User Data

- Import / Export
 */

const LABELS: Record<string, string> = {
  general: 'General',
  profile: 'Profile',
  auth: 'Sign-in methods',
  'user-data': 'User data',
  admin: 'Admin',
};

export default function SettingsPage(props) {
  const { isAdmin } = useUserPermissions();
  const tabs = [
    'general',
    'profile',
    'auth',
    'user-data',
    ...(isAdmin ? ['admin'] : []),
  ];
  const [tab, setTab] = React.useReducer((prev, next) => {
    location.replace('#' + next);
    return next;
  }, 'general');

  React.useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash == '') return;
      const hash = window.location.hash.slice(1);
      if (tabs.includes(hash)) {
        setTab(hash);
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // arrow keys move between tabs, as in a tablist
  const onTabKey = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const j =
      (i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
    setTab(tabs[j]);
    const el = document.getElementById(`set-tab-${tabs[j]}`);
    el?.focus();
  };

  return (
    <Layout>
      <SEO title="Settings" image={null} pathname={props.path} noIndex />
      <TopNavigationBar current="settings" />

      <main className="wrap ap-page">
        <AppPageHead
          crumbs={[{ label: 'Home', to: '/' }, { label: 'Settings' }]}
          k="Account"
          title="Settings"
          lede="If you're signed in, settings sync across devices."
          pose="panda-focus"
        />

        <div className="ap-settings">
          <div className="ap-tabs" role="tablist" aria-label="Settings">
            {tabs.map((t, i) => (
              <button
                key={t}
                id={`set-tab-${t}`}
                type="button"
                role="tab"
                aria-selected={tab === t}
                aria-controls="set-panel"
                tabIndex={tab === t ? 0 : -1}
                className={tab === t ? 'on' : undefined}
                onClick={() => setTab(t)}
                onKeyDown={e => onTabKey(e, i)}
              >
                {LABELS[t]}
              </button>
            ))}
          </div>

          <div
            className="card ap-panel"
            id="set-panel"
            role="tabpanel"
            aria-labelledby={`set-tab-${tab}`}
          >
            {tab === 'general' && <General />}
            {tab === 'profile' && <Profile />}
            {tab === 'auth' && <Authentication />}
            {tab === 'user-data' && <UserData />}
            {tab === 'admin' && <AdminSettings />}
          </div>
        </div>
      </main>
    </Layout>
  );
}
