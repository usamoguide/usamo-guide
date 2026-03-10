import * as React from 'react';
import { useSignIn } from '../context/SignInContext';
import {
  useCurrentUser,
  useIsUserDataLoaded,
} from '../context/UserDataContext/UserDataContext';

type SignInGateProps = {
  children: React.ReactNode;
  title?: string;
  message?: string;
  loadingMessage?: string;
  mainClassName?: string;
  cardClassName?: string;
};

const SignInGate = ({
  children,
  title = 'Sign in to continue',
  message = 'Please sign in to access this area.',
  loadingMessage = 'Loading account...',
  mainClassName = 'ui-page min-h-screen px-6 py-12',
  cardClassName = 'ui-card mx-auto max-w-3xl p-8 text-center',
}: SignInGateProps): JSX.Element => {
  const { signIn } = useSignIn();
  const currentUser = useCurrentUser();
  const isLoaded = useIsUserDataLoaded();

  if (!isLoaded) {
    return (
      <main className={mainClassName}>
        <div className={cardClassName}>{loadingMessage}</div>
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main className={mainClassName}>
        <div className={cardClassName}>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm ui-text-secondary">{message}</p>
          <button className="ui-button ui-button-primary mt-5" onClick={() => signIn()}>
            Sign in
          </button>
        </div>
      </main>
    );
  }

  return <>{children}</>;
};

export default SignInGate;
