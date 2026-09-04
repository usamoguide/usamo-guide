import * as React from 'react';
import { useSignIn } from '../../context/SignInContext';
import { useLastVisitInfo } from '../../context/UserDataContext/properties/lastVisit';
import {
  useCurrentUser,
  useIsUserDataLoaded,
} from '../../context/UserDataContext/UserDataContext';

export default function NotSignedInWarning() {
  const { signIn } = useSignIn();
  const currentUser = useCurrentUser();
  const isLoaded = useIsUserDataLoaded();
  const { numPageviews } = useLastVisitInfo();

  if (isLoaded && !currentUser && numPageviews > 1) {
    return (
      <>
        {/* States the situation and offers the action. No illustration, no
            exclamation mark — the reader is mid-study and does not need to be
            appealed to, only told what signing in would get them. */}
        <div
          className="flex flex-col gap-4 rounded-lg border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
          style={{
            background: 'var(--bg-surface-alt)',
            borderColor: 'var(--border)',
          }}
        >
          <div>
            <h3
              className="text-base font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              You're not signed in
            </h3>
            <p
              className="mt-1 text-sm leading-6"
              style={{ color: 'var(--text-secondary)' }}
            >
              Track progress, unlock problem sets, and sync across devices.
            </p>
          </div>
          <button
            type="button"
            onClick={() => signIn()}
            className="btn btn-primary shrink-0 self-start sm:self-auto"
          >
            Sign in
          </button>
        </div>

        <div className="h-8" />
      </>
    );
  }
  return null;
}
