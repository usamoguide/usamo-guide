import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { XIcon } from '@heroicons/react/solid';
import React from 'react';
import { getOAuthRedirectTo } from '../lib/oauthRedirect';
import { supabase } from '../lib/supabaseClient';
import { LoadingSpinner } from './elements/LoadingSpinner';

export interface ContentAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionLabel?: string;
  mode?: 'auth' | 'development';
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
}

export const ContentAccessModal: React.FC<ContentAccessModalProps> = ({
  isOpen,
  onClose,
  sectionLabel,
  mode = 'auth',
  primaryActionLabel = 'Close',
  onPrimaryAction,
}) => {
  const [isSigningIn, setIsSigningIn] = React.useState(false);
  const [error, setError] = React.useState<any>(null);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSigningUp, setIsSigningUp] = React.useState(false);

  const handleSignInWithGoogle = () => {
    setIsSigningIn(true);
    setError(null);
    supabase.auth
      .signInWithOAuth({
        provider: 'google',
        options: { redirectTo: getOAuthRedirectTo() },
      })
      .then(({ error }) => {
        if (error) {
          setError(error);
        } else {
          onClose();
        }
      })
      .finally(() => setIsSigningIn(false));
  };

  const handleSignInWithGithub = () => {
    setIsSigningIn(true);
    setError(null);
    supabase.auth
      .signInWithOAuth({
        provider: 'github',
        options: { redirectTo: getOAuthRedirectTo() },
      })
      .then(({ error }) => {
        if (error) {
          setError(error);
        } else {
          onClose();
        }
      })
      .finally(() => setIsSigningIn(false));
  };

  const handleEmailSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error);
    } else {
      onClose();
    }
    setIsSigningIn(false);
  };

  const handleEmailSignUp = async () => {
    setIsSigningIn(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setError(error);
    } else {
      onClose();
    }
    setIsSigningIn(false);
  };

  React.useEffect(() => {
    if (isOpen) setError(null);
  }, [isOpen]);

  return (
    <Dialog className="relative z-30" open={isOpen} onClose={() => onClose()}>
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-[rgba(10,8,24,0.85)] backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-30 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-xl bg-[#120F24] px-4 pt-5 pb-4 text-left transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
              <button
                type="button"
                onClick={() => onClose()}
                className="rounded-md bg-transparent text-[rgba(240,194,255,0.50)] transition-colors hover:text-[#F0C2FF] focus:ring-2 focus:ring-[#70428A] focus:ring-offset-2 focus:ring-offset-[#120F24] focus:outline-hidden"
              >
                <span className="sr-only">Close</span>
                <XIcon aria-hidden="true" className="size-6" />
              </button>
            </div>

            <div>
              <div>
                <DialogTitle
                  as="h3"
                  className="text-lg leading-6 font-medium text-[#F4EDEA]"
                >
                  {mode === 'development'
                    ? 'Under Development'
                    : 'Sign up to access this content for FREE'}
                </DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-[rgba(244,237,234,0.65)]">
                    {mode === 'development'
                      ? sectionLabel
                        ? `The ${sectionLabel} content you are seeing right now is filler and still under development.`
                        : 'This content is filler and still under development.'
                      : sectionLabel
                        ? `This ${sectionLabel} content is available for free members. Create your account or sign in to continue.`
                        : 'This content is available for free members. Create your account or sign in to continue.'}
                  </p>
                </div>
              </div>
            </div>
            {mode === 'development' ? (
              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full px-6 py-2.5 font-mono text-sm leading-tight font-bold focus:outline-hidden"
                  style={{
                    border: '1px solid rgba(240, 194, 255, 0.34)',
                    background: '#6D3B9F',
                    color: '#F4EDEA',
                  }}
                  onClick={() =>
                    onPrimaryAction ? onPrimaryAction() : onClose()
                  }
                >
                  {primaryActionLabel}
                </button>
              </div>
            ) : (
              <div className="mt-5 sm:mt-6">
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg border border-[rgba(240,194,255,0.25)] bg-[rgba(112,66,138,0.20)] px-4 py-2 pl-3 text-sm font-medium text-[#F4EDEA] transition-colors hover:bg-[rgba(112,66,138,0.35)] disabled:opacity-50"
                    onClick={handleSignInWithGoogle}
                    disabled={isSigningIn}
                  >
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      width="18px"
                      height="18px"
                      viewBox="0 0 48 48"
                    >
                      <g>
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                        />
                        <path
                          fill="#4285F4"
                          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                        />
                        <path
                          fill="#34A853"
                          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                        />
                        <path fill="none" d="M0 0h48v48H0z" />
                      </g>
                    </svg>
                    <span className="ml-3">Continue With Google</span>
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg border border-[rgba(240,194,255,0.25)] bg-[rgba(112,66,138,0.20)] px-4 py-2 pl-3 text-sm font-medium text-[#F4EDEA] transition-colors hover:bg-[rgba(112,66,138,0.35)] disabled:opacity-50"
                    onClick={handleSignInWithGithub}
                    disabled={isSigningIn}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 120 120"
                      version="1.1"
                      className="h-5 w-5 text-[#F0C2FF]"
                    >
                      <g
                        stroke="none"
                        strokeWidth="1"
                        fill="none"
                        fillRule="evenodd"
                      >
                        <g transform="translate(-332.000000, -120.000000)">
                          <g transform="translate(332.000000, 120.000000)">
                            <path
                              d="M0,60 C0,71.0416667 2.6875,81.0625 8.0625,90.0625 C13.4375,99.3541667 20.7291667,106.666667 29.9375,112 C39.1458333,117.333333 49.1666667,120 60,120 C70.875,120 80.9375,117.333333 90.1875,112 C99.4375,106.625 106.71875,99.3229167 112.03125,90.09375 C117.34375,80.8645833 120,70.8333333 120,60 C120,49 117.333333,38.9375 112,29.8125 C106.625,20.5625 99.3229167,13.28125 90.09375,7.96875 C80.8645833,2.65625 70.8333333,0 60,0 C48.9583333,0 38.9375,2.6875 29.9375,8.0625 C20.6458333,13.4375 13.3333333,20.7291667 8,29.9375 C2.66666667,39.1458333 0,49.1666667 0,60 Z M10,60 C10,53.3333333 11.3125,46.8958333 13.9375,40.6875 C16.5625,34.4791667 20.1458333,29.125 24.6875,24.625 C29.2291667,20.0833333 34.5833333,16.5104167 40.75,13.90625 C46.9166667,11.3020833 53.3333333,10 60,10 C66.6666667,10 73.1041667,11.3020833 79.3125,13.90625 C85.5208333,16.5104167 90.8958333,20.0833333 95.4375,24.625 C99.9375,29.125 103.489583,34.4791667 106.09375,40.6875 C108.697917,46.8958333 110,53.3333333 110,60 C110,67.1666667 108.53125,74 105.59375,80.5 C102.65625,87 98.53125,92.6145833 93.21875,97.34375 C87.90625,102.072917 81.8333333,105.5 75,107.625 L75,90 C75,85.625 73.2083333,82.2083333 69.625,79.75 C78.4166667,78.9583333 84.84375,76.7291667 88.90625,73.0625 C92.96875,69.3958333 95,63.5833333 95,55.625 C95,49.4583333 93.1041667,44.2708333 89.3125,40.0625 C90.0625,37.8125 90.4375,35.6458333 90.4375,33.5625 C90.4375,30.4791667 89.7291667,27.6458333 88.3125,25.0625 C85.5208333,25.0625 83.0208333,25.5208333 80.8125,26.4375 C78.6041667,27.3541667 75.8958333,28.9375 72.6875,31.1875 C68.8125,30.3125 64.8125,29.875 60.6875,29.875 C55.9791667,29.875 51.5833333,30.3541667 47.5,31.3125 C44.375,29.0208333 41.6770833,27.40625 39.40625,26.46875 C37.1354167,25.53125 34.5625,25.0625 31.6875,25.0625 C30.3125,27.6875 29.625,30.5208333 29.625,33.5625 C29.625,35.7291667 29.9791667,37.9166667 30.6875,40.125 C26.8958333,44.2083333 25,49.375 25,55.625 C25,63.5833333 27.0208333,69.375 31.0625,73 C35.1041667,76.625 41.5833333,78.8541667 50.5,79.6875 C48.125,81.2708333 46.4791667,83.5833333 45.5625,86.625 C43.5208333,87.3333333 41.3958333,87.6875 39.1875,87.6875 C37.5208333,87.6875 36.0833333,87.3125 34.875,86.5625 L33.84375,85.90625 L32.875,85.0625 L32.0625,84.28125 L31.25,83.3125 L30.59375,82.4375 L29.84375,81.4375 C27.2291667,77.9791667 24.8958333,76.6875 22.1875,76.6875 C20.7291667,76.6875 20,77 20,77.625 C20,77.875 20.3541667,78.2916667 21.0625,78.875 L23.1875,80.75 L24.875,82.25 C26.0833333,83.75 27,85.3958333 27.625,87.1875 C29.9583333,92.3958333 33.9583333,95 39.625,95 C40.5416667,95 42.3333333,94.7916667 45,94.375 L45,107.625 C38.1666667,105.5 32.09375,102.072917 26.78125,97.34375 C21.46875,92.6145833 17.34375,87 14.40625,80.5 C11.46875,74 10,67.1666667 10,60 Z"
                              fill="currentColor"
                            />
                            <path d="M0,0 L120,0 L120,120 L0,120 L0,0 Z" />
                          </g>
                        </g>
                      </g>
                    </svg>
                    <span className="ml-3">Continue With GitHub</span>
                  </button>
                  {isSigningIn && <LoadingSpinner />}
                </div>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[rgba(244,237,234,0.78)]">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="mt-1 w-full rounded-md border border-[rgba(240,194,255,0.25)] bg-[rgba(10,8,24,0.60)] px-3 py-2 text-sm text-[#F4EDEA] placeholder-[rgba(244,237,234,0.35)] focus:border-[#70428A] focus:ring-1 focus:ring-[#70428A] focus:outline-none"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[rgba(244,237,234,0.78)]">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="mt-1 w-full rounded-md border border-[rgba(240,194,255,0.25)] bg-[rgba(10,8,24,0.60)] px-3 py-2 text-sm text-[#F4EDEA] placeholder-[rgba(244,237,234,0.35)] focus:border-[#70428A] focus:ring-1 focus:ring-[#70428A] focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-full px-5 py-2 font-mono text-sm leading-tight font-bold focus:outline-hidden disabled:opacity-50"
                      style={{
                        border: '1px solid rgba(240, 194, 255, 0.34)',
                        background: '#6D3B9F',
                        color: '#F4EDEA',
                      }}
                      disabled={isSigningIn || !email || !password}
                      onClick={handleEmailSignIn}
                    >
                      Sign In With Email
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-full px-5 py-2 font-mono text-sm leading-tight font-bold focus:outline-hidden disabled:opacity-50"
                      style={{
                        border: '1px solid rgba(240, 194, 255, 0.34)',
                        background: '#EFE3FF',
                        color: '#2C1842',
                      }}
                      disabled={isSigningIn || !email || !password}
                      onClick={() => {
                        setIsSigningUp(true);
                        handleEmailSignUp().finally(() =>
                          setIsSigningUp(false)
                        );
                      }}
                    >
                      {isSigningUp ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="mt-3">
                    <p className="text-red-400">
                      Error: {error.message ?? error.code}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};
