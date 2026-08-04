import { navigate } from 'gatsby';
import * as React from 'react';
import UnderlinedTabs from '../components/elements/UnderlinedTabs';
import Layout from '../components/layout';
import SEO from '../components/seo';
import AdminSettings from '../components/Settings/AdminSettings';
import Authentication from '../components/Settings/Authentication';
import DarkMode from '../components/Settings/DarkMode';
import General from '../components/Settings/General';
import Profile from '../components/Settings/Profile';
import UserData from '../components/Settings/UserData';
import TopNavigationBar from '../components/TopNavigationBar/TopNavigationBar';
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
    return () => window.removeEventListener('hashChange', handleHashChange);
  }, []);

  return (
    <Layout>
      <SEO title="Settings" image={null} pathname={props.path} noIndex />

      <div
        data-page-tone="dark"
        className="min-h-screen"
        style={{ background: 'var(--bg-page)' }}
      >
        <TopNavigationBar />

        <main className="min-h-screen">
          <div className="relative mx-auto max-w-xl md:px-8 xl:px-0">
            <button
              className="mx-4 mt-8 inline-flex items-center rounded-lg border border-[rgba(240,194,255,0.25)] bg-[rgba(112,66,138,0.20)] px-4 py-2 text-sm font-medium text-[#F4EDEA] transition-colors hover:bg-[rgba(112,66,138,0.35)] sm:mx-6 md:mx-0"
              onClick={() => navigate(-1)}
            >
              <svg
                className="mr-2 -ml-1 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back
            </button>
            <div className="pt-4 pb-16 sm:pt-6">
              <div className="px-4 sm:px-6 md:px-0">
                <h1 className="text-3xl font-extrabold text-[#F4EDEA]">
                  Settings
                </h1>
                <p className="mt-2 text-[rgba(244,237,234,0.65)]">
                  If you're signed in, settings sync across devices.
                </p>
              </div>
              <div className="px-4 sm:px-6 md:px-0">
                <div className="py-6">
                  <UnderlinedTabs
                    options={tabs}
                    labelMap={{
                      general: 'General',
                      profile: 'Profile',
                      auth: 'Sign In Methods',
                      'user-data': 'User Data',
                      admin: 'Admin Settings',
                    }}
                    value={tab}
                    onChange={x => setTab(x)}
                  />

                  <div className="h-10" />

                  <div className="space-y-10">
                    {tab === 'general' && (
                      <>
                        <DarkMode />
                        <General />
                      </>
                    )}
                    {tab === 'profile' && (
                      <>
                        <Profile />
                      </>
                    )}
                    {tab === 'auth' && (
                      <>
                        <Authentication />
                      </>
                    )}
                    {tab === 'user-data' && (
                      <>
                        <UserData />
                      </>
                    )}
                    {tab === 'admin' && (
                      <>
                        <AdminSettings />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
