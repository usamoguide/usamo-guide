import * as React from 'react';
import Announcement from '../ug/Announcement';
import UGNav, { NavCurrent } from '../ug/UGNav';

/**
 * The site's top bar: the Discord announcement plus the redesign nav.
 * Kept under its old name and props so every older screen picks up the
 * redesign; new screens can use UGNav and Announcement directly.
 * (`transparent`, `linkLogoToIndex`, `redirectToDashboard` and
 * `animateEntrance` belonged to the old bar and no longer change anything.)
 */
export default function TopNavigationBar({
  currentSection = null,
  hidePromoBar = false,
  current = null,
  wide = false,
}: {
  transparent?: boolean;
  linkLogoToIndex?: boolean;
  currentSection?: string | null;
  hidePromoBar?: boolean;
  redirectToDashboard?: boolean;
  animateEntrance?: boolean;
  /** which nav item is the current page */
  current?: NavCurrent;
  /** the wider container used by the module and problem pages */
  wide?: boolean;
}): JSX.Element {
  return (
    <>
      {hidePromoBar ? null : <Announcement />}
      <UGNav current={current ?? (currentSection ? 'tracks' : null)} wide={wide} />
    </>
  );
}
