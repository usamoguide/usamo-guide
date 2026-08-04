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
        <div
          className="overflow-hidden rounded-2xl"
          style={{
            background: 'rgba(242, 216, 244, 0.9)',
          }}
        >
          <div className="px-4 py-5 sm:p-6">
            <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6 lg:justify-between">
              <div className="max-w-2xl text-center lg:text-left">
                <h3
                  className="text-lg leading-6 font-medium"
                  style={{ color: '#120F24' }}
                >
                  You're not signed in!
                </h3>
                <div
                  className="mt-2 text-sm leading-6"
                  style={{ color: 'rgba(18, 15, 36, 0.8)' }}
                >
                  <p>
                    Track progress, unlock problem sets, and sync across
                    devices.
                  </p>
                </div>
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => signIn()}
                    className="purple-motion-effect inline-flex items-center justify-center rounded-full px-6 py-2.5 font-mono text-sm leading-tight font-bold focus:outline-hidden"
                    style={
                      {
                        border: '1px solid rgba(240, 194, 255, 0.34)',
                        background: '#6D3B9F',
                        boxShadow: 'none',
                        '--pme-color': '#F4EDEA',
                        '--pme-hover-color': '#201C36',
                        '--pme-wipe-bg': '#F0C2FF',
                      } as React.CSSProperties
                    }
                  >
                    Save Progress
                  </button>
                </div>
              </div>
              <img
                src="/images/cryingmascot.png"
                alt="Crying mascot"
                className="h-20 w-auto shrink-0 object-contain sm:h-24"
              />
            </div>
          </div>
        </div>

        <div className="h-8" />
      </>
    );
  }
  return null;
}
