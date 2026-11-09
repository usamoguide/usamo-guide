import * as React from 'react';
import { useSignIn } from '../../context/SignInContext';
import Btn from '../ug/Btn';

/** What a settings tab shows when you need an account for it. */
export default function SignedOut({ what }: { what: string }): JSX.Element {
  const { signIn } = useSignIn();
  return (
    <div className="ap-note">
      <p>You need to be logged in to {what}.</p>
      <Btn kind="p" size="sm" onClick={() => signIn()}>
        Log in
      </Btn>
    </div>
  );
}
