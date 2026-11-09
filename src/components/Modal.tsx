import React from 'react';
import UGDialog from './ug/pages/UGDialog';

export type ModalProps = {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  /** extra classes for the backdrop (the redesign's backdrop is the default) */
  bg?: string;
};

/** A plain dialog in the redesign's style; the content is up to the caller. */
export default function Modal({ children, isOpen, onClose, bg }: ModalProps) {
  return (
    <UGDialog
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      className="ugm-plain"
      backdropClassName={bg && bg !== 'bg-black/25' ? bg : undefined}
    >
      {children}
    </UGDialog>
  );
}
