import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import * as React from 'react';
import { useDarkMode } from '../../../context/DarkModeContext';
import { IcoClose } from '../icons';
import { poseSize } from './AppPage';

/**
 * A dialog in the redesign's language. Dialogs render in a portal outside the
 * page's `.ug` root, so the dialog itself carries `ug ugv-app` and the current
 * theme: the tokens, buttons and form styles all apply inside it.
 * Styled by `.ugm-*` in src/styles/ug/fix-app.css.
 */
export default function UGDialog({
  isOpen,
  onClose,
  k,
  title,
  lede,
  pose,
  size,
  className,
  backdropClassName,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  /** small uppercase label over the title */
  k?: React.ReactNode;
  title?: React.ReactNode;
  lede?: React.ReactNode;
  /** a mascot pose peeking over the top edge, e.g. "panda-wave" */
  pose?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  backdropClassName?: string;
  children?: React.ReactNode;
}): JSX.Element {
  const dark = useDarkMode();
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="ug ugv-app ugm"
      data-theme={dark ? 'dark' : 'light'}
    >
      <DialogBackdrop
        transition
        className={['ugm-bd', backdropClassName || '']
          .filter(Boolean)
          .join(' ')}
      />
      <div className="ugm-wrap">
        <div className="ugm-center">
          <DialogPanel
            transition
            className={[
              'ugm-panel',
              size ? `ugm-${size}` : '',
              pose ? 'has-pose' : '',
              className || '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {pose ? (
              <img
                className="ugm-fox"
                src={`/ug/img/${pose}.webp`}
                alt=""
                width={poseSize(pose)[0]}
                height={poseSize(pose)[1]}
              />
            ) : null}
            <button
              type="button"
              className="ugm-x"
              onClick={onClose}
              aria-label="Close"
            >
              <IcoClose />
            </button>
            {k || title || lede ? (
              <div className="ugm-head">
                {k ? <p className="k-label">{k}</p> : null}
                {title ? (
                  <DialogTitle as="h2" className="ugm-t">
                    {title}
                  </DialogTitle>
                ) : null}
                {lede ? <p className="ugm-lede">{lede}</p> : null}
              </div>
            ) : null}
            {children}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
