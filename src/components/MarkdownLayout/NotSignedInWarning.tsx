import * as React from 'react';
import { useSignIn } from '../../context/SignInContext';
import { useLastVisitInfo } from '../../context/UserDataContext/properties/lastVisit';
import {
  useCurrentUser,
  useIsUserDataLoaded,
} from '../../context/UserDataContext/UserDataContext';
import Btn from '../ug/Btn';

/**
 * The sign-in nudge partway through a lesson, for a returning visitor who
 * isn't signed in. Styled as the redesign's card (`.md-gate`, fix-module.css).
 */
export default function NotSignedInWarning(): JSX.Element | null {
  const { signIn } = useSignIn();
  const currentUser = useCurrentUser();
  const isLoaded = useIsUserDataLoaded();
  const { numPageviews } = useLastVisitInfo();

  if (isLoaded && !currentUser && numPageviews > 1) {
    return (
      <div className="md-gate">
        <img
          className="md-gate-pose"
          src="/ug/img/panda-wave.webp"
          alt=""
          width={450}
          height={464}
        />
        <div className="md-gate-t">
          <h3>You&apos;re not signed in</h3>
          <p>
            Sign in to save your progress, unlock problem sets and sync across
            devices.
          </p>
        </div>
        <Btn kind="p" size="sm" onClick={() => signIn()}>
          Save progress
        </Btn>
      </div>
    );
  }
  return null;
}
