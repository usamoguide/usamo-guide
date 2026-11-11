import * as React from 'react';
import { HeroNavbar } from '../Index/AetherFlowHero';

type TopNavigationBarProps = {
  transparent?: boolean;
  linkLogoToIndex?: boolean;
  currentSection?: string | null;
  hidePromoBar?: boolean;
  redirectToDashboard?: boolean;
};

export default function TopNavigationBar(
  props: TopNavigationBarProps
): JSX.Element {
  void props;
  return <HeroNavbar />;
}
