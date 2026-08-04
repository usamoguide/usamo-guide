import classNames from 'classnames';
import React from 'react';

export const GlowingText = ({
  className,
  children,
}: {
  className: string;
  extraGlow?: boolean;
  children: string;
}): JSX.Element => (
  <div className="group relative">
    <h1 className={classNames(className, 'relative z-10')}>{children}</h1>
  </div>
);
