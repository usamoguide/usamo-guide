import React from 'react';
import AuthForm from './ug/pages/AuthForm';
import UGDialog from './ug/pages/UGDialog';

export interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <UGDialog
      isOpen={isOpen}
      onClose={onClose}
      k="Welcome"
      title="Sign in"
      lede="Signing in allows you to sync your data with our servers (highly recommended). If this is your first time signing in, you will have the option to upload your local data to the server."
      pose="panda-wave"
    >
      <AuthForm isOpen={isOpen} onDone={onClose} />
    </UGDialog>
  );
};
