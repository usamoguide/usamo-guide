import { navigate } from 'gatsby';
import * as React from 'react';
import { useSignIn } from '../../../context/SignInContext';
import {
  useCurrentUser,
  useIsUserDataLoaded,
} from '../../../context/UserDataContext/UserDataContext';
import { useUserPermissions } from '../../../context/UserDataContext/UserPermissionsContext';
import { useGroupActions } from '../../../hooks/groups/useGroupActions';
import { useUserGroups } from '../../../hooks/groups/useUserGroups';
import Layout from '../../layout';
import SEO from '../../seo';
import TopNavigationBar from '../../TopNavigationBar/TopNavigationBar';
import Btn from '../../ug/Btn';
import AdminViewAllGroups from './AdminViewAllGroups';
import { GroupCard } from './GroupCard';

const GroupSelectPage = () => {
  const currentUser = useCurrentUser();
  const isLoaded = useIsUserDataLoaded();
  const groups = useUserGroups();
  const { createNewGroup } = useGroupActions();
  const permissions = useUserPermissions();
  const { signIn } = useSignIn();

  const showNotSignedInMessage = isLoaded && !currentUser?.uid;
  const showLoading = !showNotSignedInMessage && !groups.isSuccess;

  const handleCreateNewGroup = () => {
    createNewGroup().then(groupId => {
      navigate(`/groups/${groupId}/edit`);
    });
  };

  return (
    <Layout>
      <SEO title="My Groups" image={null} pathname={window.location.pathname} />
      <TopNavigationBar current="groups" />
      <main>
        <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="ap-gh1">My Groups</h1>
            {!showLoading && !showNotSignedInMessage ? (
              <Btn kind="p" size="sm" onClick={handleCreateNewGroup}>
                Create new group
              </Btn>
            ) : null}
          </div>
          <hr className="mt-6 mb-8 dark:border-[var(--border)]" />
          {showNotSignedInMessage && (
            <div className="ap-note">
              <p>Please sign in to access Groups.</p>
              <Btn kind="p" size="sm" onClick={() => signIn()}>
                Log in
              </Btn>
            </div>
          )}

          {showLoading && (
            <div>
              <p className="text-2xl font-medium">Loading...</p>
            </div>
          )}
          {groups.isSuccess &&
            (groups.data && groups.data.length > 0 ? (
              groups.data.map(
                group => group && <GroupCard key={group.id} group={group} />
              )
            ) : (
              <div>
                <p>
                  You aren't in any groups yet. To join a group, ask for a join
                  link from your club officer or class instructor.
                </p>
              </div>
            ))}

          {permissions.isAdmin && (
            <>
              <div className="h-12"></div>
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold md:text-3xl">
                  All Groups (Admin Only)
                </h1>
              </div>
              <hr className="mt-6 mb-8 dark:border-[var(--border)]" />
              <AdminViewAllGroups />
            </>
          )}
        </div>
      </main>
    </Layout>
  );
};

export default GroupSelectPage;
