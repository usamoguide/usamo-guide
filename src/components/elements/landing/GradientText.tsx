import classNames from 'classnames';
import React from 'react';

export const GradientText = ({
  className,
  children,
}: {
  className?: string;
  children: string;
}): JSX.Element => (
  <span
    className={classNames(
      className,
      'box-decoration-clone text-purple-700 dark:text-purple-400'
    )}
  >
    {children}
  </span>
);
