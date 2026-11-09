import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import debounce from 'lodash/debounce';
import * as React from 'react';
import { createContext, ReactNode, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabaseClient';
import { ModuleProgress } from '../../models/module';
import { ProblemProgress } from '../../models/problem';
import { ResourceProgress } from '../../models/resource';
import runMigration from './migration';
import { Theme } from './properties/simpleProperties';
import { UserPermissionsContextProvider } from './UserPermissionsContext';

export type AppUser = {
  id: string;
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providerData: { providerId: string }[];
  getIdToken: () => Promise<string>;
};

type UserProfileRow = {
  display_name: string | null;
  avatar_url: string | null;
  is_admin: boolean | null;
  can_moderate: boolean | null;
  can_create_groups: boolean | null;
};

const mapProviderData = (user: SupabaseUser): { providerId: string }[] => {
  return (user.identities ?? []).map(identity => ({
    providerId: identity.provider,
  }));
};

const buildAppUser = (
  session: Session | null,
  profile: UserProfileRow | null
): AppUser | null => {
  if (!session?.user) return null;
  const user = session.user;
  const displayName =
    profile?.display_name ?? user.user_metadata?.full_name ?? null;
  const photoURL = profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null;
  return {
    id: user.id,
    uid: user.id,
    email: user.email ?? null,
    displayName,
    photoURL,
    providerData: mapProviderData(user),
    getIdToken: async () => session.access_token ?? '',
  };
};

// What's actually stored in local storage / database
export type UserData = {
  consecutiveVisits: number;
  /** show tags on problems table */
  showTags: boolean;
  /** hide difficulty on problems table */
  hideDifficulty: boolean;
  /** hide modules in problems list (problems search page) */
  hideModules: boolean;
  /** show ignored modules in dashboard */
  showIgnored: boolean;
  /** used for contest tables (legacy) */
  divisionTableQuery: {
    division: string;
    season: string;
  };
  lastViewedModule: string;
  lastVisitDate: number; // timestamp
  numPageviews: number;
  // mapping timestamp to pageviews
  pageviewsPerDay: Record<number, number>;
  theme: Theme;
  // mapping module ID to progress
  userProgressOnModules: Record<string, ModuleProgress>;
  userProgressOnModulesActivity: {
    timestamp: number;
    moduleID: string;
    moduleProgress: ModuleProgress;
  }[];
  userProgressOnProblems: Record<string, ProblemProgress>;
  userProgressOnProblemsActivity: {
    timestamp: number;
    problemID: string;
    problemProgress: ProblemProgress;
  }[];
  userProgressOnResources: Record<string, ResourceProgress>;
  problemTaggingStats: {
    problemsTagged: number;
    taggedProblemIds: string[];
  };
  problemDifficultyStats: {
    problemsRated: number;
    ratedProblemIds: string[];
  };
};

// What's exposed in the context
type UserDataContextAPI = {
  userData: UserData | null;
  currentUser: AppUser | null;
  forceCurrentUserRerender: () => void;
  isLoaded: boolean;
  /**
   * See properties/hooks.ts for documentation on how this function works.
   */
  updateUserData: (
    updateFunc: (prevUserData: UserData) => {
      localStorageUpdate: Partial<UserData>;
      remoteUpdate: Partial<UserData>;
    }
  ) => void;
  importUserData: (data: Partial<UserData>) => boolean;
  signOut: () => Promise<void>;
};

export const assignDefaultsToUserData = (data: object): UserData => {
  const { lang: _lang, ...rest } = data as { lang?: unknown };
  return {
    consecutiveVisits: 1,
    showTags: true,
    hideDifficulty: false,
    hideModules: false,
    showIgnored: false,
    divisionTableQuery: {
      division: '',
      season: '',
    },
    lastViewedModule: '',
    lastVisitDate: new Date().getTime(),
    numPageviews: 0,
    pageviewsPerDay: {},
    theme: 'system',
    userProgressOnModules: {},
    userProgressOnModulesActivity: [],
    userProgressOnProblems: {},
    userProgressOnProblemsActivity: [],
    userProgressOnResources: {},
    problemTaggingStats: {
      problemsTagged: 0,
      taggedProblemIds: [],
    },
    problemDifficultyStats: {
      problemsRated: 0,
      ratedProblemIds: [],
    },
    ...rest,
  };
};

// localstorage key for theme. We need this to set light / dark theme the moment the page loads.
export const themeKey = 'guide:userData:theme';

const LOCAL_STORAGE_KEY = 'guide:userData:v100';

// Todo figure out why we even need defaults
const UserDataContext = createContext<UserDataContextAPI>({
  userData: assignDefaultsToUserData({}),
  updateUserData: _ => {},
  signOut: () => Promise.resolve(),
  currentUser: null,
  forceCurrentUserRerender: () => {},
  importUserData: _ => false,
  isLoaded: true,
});

const loadLocalUserData = () => {
  let localStorageData: Partial<UserData>;
  try {
    localStorageData = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEY) ?? '{}'
    );
  } catch (e) {
    localStorageData = {};
  }

  const actualUserData = assignDefaultsToUserData(localStorageData);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(actualUserData));
  return actualUserData;
};

export const UserDataProvider = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [userData, setUserData] = React.useReducer(
    (prevState: UserData, updates: Partial<UserData>): UserData => {
      if (updates.theme && prevState.theme !== updates.theme) {
        localStorage.setItem(themeKey, JSON.stringify(updates.theme));
      }
      return { ...prevState, ...updates };
    },
    null,
    () => {
      // These initial values are what's used during the initial SSG render
      return assignDefaultsToUserData({});
    }
  );
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const numPendingRemoteWritesRef = useRef(0);

  // Show a message warning the user their data isn't saved
  // if they try to exit the page before sync finishes writing
  React.useEffect(() => {
    function beforeUnloadListener(this: Window, ev: BeforeUnloadEvent) {
      if (numPendingRemoteWritesRef.current !== 0) {
        ev.preventDefault();
        return (ev.returnValue = '');
      }
    }
    addEventListener('beforeunload', beforeUnloadListener, { capture: true });
    return () => {
      removeEventListener('beforeunload', beforeUnloadListener, {
        capture: true,
      });
    };
  }, []);

  // Add debouncing to prevent excessive updates
  const debouncedSetUserData = useMemo(
    () => debounce(data => setUserData(data), 100),
    []
  );

  // Initialize from localstorage
  React.useEffect(() => {
    runMigration();
    const initialData = loadLocalUserData();
    debouncedSetUserData(initialData);
    // todo: does this actually run before isLoaded is set to true?
  }, []);

  // Listen for auth state changes
  React.useEffect(() => {
    let alive = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!alive) return;
        setSession(data.session ?? null);
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error(err);
      });

    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);

  // Sync user profile + user data when session changes
  React.useEffect(() => {
    let alive = true;

    const loadUserData = async () => {
      if (!session?.user) {
        setProfile(null);
        setCurrentUser(null);
        setIsLoaded(true);
        return;
      }

      setIsLoaded(false);
      const userId = session.user.id;

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(
          'display_name, avatar_url, is_admin, can_moderate, can_create_groups'
        )
        .eq('id', userId)
        .maybeSingle();

      if (!alive) return;

      if (profileError) {
        // eslint-disable-next-line no-console
        console.error(profileError);
      }

      if (!profileData) {
        const createdProfile = {
          id: userId,
          display_name:
            session.user.user_metadata?.full_name ?? session.user.email ?? '',
          avatar_url: session.user.user_metadata?.avatar_url ?? null,
        };
        await supabase.from('profiles').upsert(createdProfile);
        setProfile({
          display_name: createdProfile.display_name,
          avatar_url: createdProfile.avatar_url,
          is_admin: false,
          can_moderate: false,
          can_create_groups: false,
        });
      }
      if (profileData) {
        setProfile(profileData ?? null);
      }

      const { data: userDataRow, error: userDataError } = await supabase
        .from('user_data')
        .select('data')
        .eq('user_id', userId)
        .maybeSingle();

      if (!alive) return;

      if (userDataError && userDataError.code !== 'PGRST116') {
        toast.error(userDataError.message);
      }

      if (!userDataRow?.data) {
        const localData = loadLocalUserData();
        await supabase.from('user_data').upsert({
          user_id: userId,
          data: localData,
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localData));
        debouncedSetUserData(localData);
      } else {
        const newUserData = assignDefaultsToUserData(userDataRow.data);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUserData));
        debouncedSetUserData(newUserData);
      }
      setIsLoaded(true);
    };

    loadUserData();

    return () => {
      alive = false;
    };
  }, [session?.user?.id]);

  React.useEffect(() => {
    setCurrentUser(buildAppUser(session, profile));
  }, [session, profile]);

  // Realtime updates for user data
  React.useEffect(() => {
    if (!session?.user) return;
    const userId = session.user.id;
    const channel = supabase
      .channel(`user_data_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_data',
          filter: `user_id=eq.${userId}`,
        },
        payload => {
          const newData = (payload.new as { data?: UserData } | null)?.data;
          if (!newData) return;
          const merged = assignDefaultsToUserData(newData);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
          debouncedSetUserData(merged);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  const userDataAPI: UserDataContextAPI = {
    userData,

    currentUser,

    /**
     * Forces anything that depends on currentUser to rerender.
     * This is kept for compatibility with existing UI flows.
     */
    forceCurrentUserRerender: () => {
      supabase.auth
        .getSession()
        .then(({ data }) => setSession(data.session ?? null));
    },

    isLoaded,

    updateUserData: React.useCallback(
      updateFunc => {
        if (!isLoaded) {
          throw new Error(
            'updateUserData() can only be called after user data has been loaded.'
          );
        }

        const latestUserData = JSON.parse(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          localStorage.getItem(LOCAL_STORAGE_KEY)!
        ) as UserData;

        const changes = updateFunc(latestUserData);
        const mergedUserData = {
          ...latestUserData,
          ...changes.localStorageUpdate,
          ...changes.remoteUpdate,
        };

        if (currentUser) {
          numPendingRemoteWritesRef.current++;
          localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify(mergedUserData)
          );
          debouncedSetUserData(mergedUserData);
          void (async () => {
            try {
              const { error } = await supabase
                .from('user_data')
                .update({ data: mergedUserData })
                .eq('user_id', currentUser.uid);

              if (error) {
                throw error;
              }
            } catch (err) {
              console.error('Failed to sync to server', changes);
              console.error(err);
              const message =
                err instanceof Error ? err.message : 'Unknown error';
              toast.error(
                'Failed to sync to server: ' +
                  message +
                  '. Please submit an error report on GitHub with developer console messages.',
                {
                  duration: Infinity,
                }
              );
            } finally {
              numPendingRemoteWritesRef.current--;
            }
          })();
        } else {
          localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify(mergedUserData)
          );
          debouncedSetUserData(mergedUserData);
        }
      },
      [isLoaded, currentUser, setUserData]
    ),

    signOut: (): Promise<void> => {
      return supabase.auth.signOut().then(() => {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        const localData = loadLocalUserData();
        debouncedSetUserData(localData);
      });
    },

    importUserData: (data: Partial<UserData>): boolean => {
      if (
        confirm(
          'Import user data (beta)? All existing data will be lost. Make sure to back up your data before proceeding.'
        )
      ) {
        const updatedData = assignDefaultsToUserData(data);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedData));
        debouncedSetUserData(updatedData);
        if (currentUser) {
          supabase
            .from('user_data')
            .upsert({ user_id: currentUser.uid, data: updatedData })
            .catch(err => {
              console.error(err);
              alert(
                'importUserData: Error setting user data. Check console for details.'
              );
            });
        }
        return true;
      }
      return false;
    },
  };

  return (
    <UserDataContext.Provider value={userDataAPI}>
      <UserPermissionsContextProvider>
        {children}
      </UserPermissionsContextProvider>
    </UserDataContext.Provider>
  );
};

export const useUserData = (): UserData => {
  const userData = React.useContext(UserDataContext).userData;
  if (!userData) {
    throw new Error("userData was null, but it shouldn't be");
  }
  return userData;
};

export const useUpdateUserData = () => {
  return React.useContext(UserDataContext).updateUserData;
};

export const useCurrentUser = () => {
  return React.useContext(UserDataContext).currentUser;
};

export const useIsUserDataLoaded = () => {
  return React.useContext(UserDataContext).isLoaded;
};

export const useForceCurrentUserRerender = () => {
  return React.useContext(UserDataContext).forceCurrentUserRerender;
};

export const useSignOutAction = () => {
  return React.useContext(UserDataContext).signOut;
};

export const useImportUserDataAction = () => {
  return React.useContext(UserDataContext).importUserData;
};
