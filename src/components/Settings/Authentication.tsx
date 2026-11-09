import * as React from 'react';
import { useCurrentUser } from '../../context/UserDataContext/UserDataContext';
import { IcoCheck } from '../ug/icons';
import { GitHubMark, GoogleMark } from '../ug/pages/ProviderMarks';
import { SettingsGroup } from './SettingRow';
import SignedOut from './SignedOut';

function Provider({
  name,
  mark,
  linked,
}: {
  name: string;
  mark: React.ReactNode;
  linked: boolean;
}): JSX.Element {
  return (
    <li className="ap-prov">
      {mark}
      <span className="ap-prov-n">{name}</span>
      {linked ? (
        <span className="ap-pill on">
          <IcoCheck />
          Linked
        </span>
      ) : (
        <span className="ap-pill">Not linked</span>
      )}
    </li>
  );
}

export default function Authentication() {
  const currentUser = useCurrentUser();

  let linkedWithGoogle = false;
  let linkedWithGithub = false;

  if (currentUser) {
    linkedWithGoogle = !!currentUser.providerData.find(
      provider => provider.providerId === 'google.com'
    );
    linkedWithGithub = !!currentUser.providerData.find(
      provider => provider.providerId === 'github.com'
    );
  }

  return (
    <SettingsGroup
      title="Linked providers"
      description="The accounts you can use to sign in."
    >
      {currentUser ? (
        <ul className="ap-provs">
          <Provider
            name="Google"
            mark={<GoogleMark />}
            linked={linkedWithGoogle}
          />
          <Provider
            name="GitHub"
            mark={<GitHubMark />}
            linked={linkedWithGithub}
          />
        </ul>
      ) : (
        <SignedOut what="see your sign-in methods" />
      )}
    </SettingsGroup>
  );
}
