import React from 'react';
import Btn from './ug/Btn';
import AuthForm from './ug/pages/AuthForm';
import UGDialog from './ug/pages/UGDialog';

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
  if (mode === 'development') {
    return (
      <UGDialog
        isOpen={isOpen}
        onClose={onClose}
        k={sectionLabel || 'Coming soon'}
        title="Under development"
        lede={
          sectionLabel
            ? `The ${sectionLabel} content you are seeing right now is filler and still under development.`
            : 'This content is filler and still under development.'
        }
        pose="panda-stuck"
        size="sm"
      >
        <div className="ugm-acts">
          <Btn
            kind="p"
            size="sm"
            onClick={() => (onPrimaryAction ? onPrimaryAction() : onClose())}
          >
            {primaryActionLabel}
          </Btn>
        </div>
      </UGDialog>
    );
  }

  return (
    <UGDialog
      isOpen={isOpen}
      onClose={onClose}
      k="Free for members"
      title="Sign up to access this content for free"
      lede={
        sectionLabel
          ? `This ${sectionLabel} content is available for free members. Create your account or sign in to continue.`
          : 'This content is available for free members. Create your account or sign in to continue.'
      }
      pose="panda-read"
    >
      <AuthForm isOpen={isOpen} onDone={onClose} />
    </UGDialog>
  );
};
