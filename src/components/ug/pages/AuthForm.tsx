import { Eye, EyeOff } from 'lucide-react';
import * as React from 'react';
import { signInWithOAuthProvider } from '../../../lib/authActions';
import { supabase } from '../../../lib/supabaseClient';
import { LoadingSpinner } from '../../elements/LoadingSpinner';
import Btn from '../Btn';
import { GitHubMark, GoogleMark } from './ProviderMarks';

/**
 * Sign in with Google, GitHub or an email and password (or create an account),
 * shared by the sign-in dialog and the members-only content dialog.
 */
export default function AuthForm({
  isOpen,
  onDone,
}: {
  /** clears the error each time the dialog opens */
  isOpen: boolean;
  /** called after a successful sign-in or sign-up */
  onDone: () => void;
}): JSX.Element {
  const [isSigningIn, setIsSigningIn] = React.useState(false);
  const [error, setError] = React.useState<any>(null);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSigningUp, setIsSigningUp] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const withProvider = (provider: 'google' | 'github') => {
    setIsSigningIn(true);
    setError(null);
    signInWithOAuthProvider(provider)
      .then(({ error }) => {
        if (error) {
          setError(error);
        } else {
          onDone();
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
      onDone();
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
      onDone();
    }
    setIsSigningIn(false);
  };

  React.useEffect(() => {
    if (isOpen) setError(null);
  }, [isOpen]);

  return (
    <div className="ugm-auth">
      <div className="ugm-provs">
        <button
          type="button"
          className="ugm-prov"
          onClick={() => withProvider('google')}
          disabled={isSigningIn}
        >
          <GoogleMark className="ugm-prov-ic" />
          Continue with Google
        </button>
        <button
          type="button"
          className="ugm-prov"
          onClick={() => withProvider('github')}
          disabled={isSigningIn}
        >
          <GitHubMark className="ugm-prov-ic" />
          Continue with GitHub
        </button>
      </div>

      <div className="ugm-or" role="separator">
        <span>or use your email</span>
      </div>

      <form
        className="ugm-form"
        onSubmit={e => {
          e.preventDefault();
          if (email && password && !isSigningIn) void handleEmailSignIn();
        }}
      >
        <div className="ap-field">
          <label className="ap-label" htmlFor="ugm-email">
            Email
          </label>
          <input
            id="ugm-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="ap-in"
            placeholder="Eg: mathnerdforlife@gmail.com"
          />
        </div>
        <div className="ap-field">
          <label className="ap-label" htmlFor="ugm-password">
            Password
          </label>
          <div className="ugm-pw">
            <input
              id="ugm-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="ap-in"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="ugm-eye"
              onClick={() => setShowPassword(prev => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </div>
        <div className="ugm-acts">
          <Btn
            kind="p"
            size="sm"
            type="submit"
            disabled={isSigningIn || !email || !password}
          >
            Sign in with email
          </Btn>
          <Btn
            kind="s"
            size="sm"
            disabled={isSigningIn || !email || !password}
            onClick={() => {
              setIsSigningUp(true);
              handleEmailSignUp().finally(() => setIsSigningUp(false));
            }}
          >
            {isSigningUp ? 'Creating account…' : 'Create account'}
          </Btn>
          {isSigningIn ? <LoadingSpinner className="ugm-spin" /> : null}
        </div>
      </form>

      {error ? (
        <p className="ap-err ugm-err" role="alert">
          Error: {error.message ?? error.code}
        </p>
      ) : null}
    </div>
  );
}
