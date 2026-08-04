import React from 'react';

export const GlowingRing = ({
  children,
}: {
  children: JSX.Element;
}): JSX.Element => <div className="group relative">{children}</div>;
