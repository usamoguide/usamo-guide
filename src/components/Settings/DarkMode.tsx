import * as React from 'react';
import { useUGTheme } from '../ug/hooks';
import SettingRow from './SettingRow';

/** Light or dark: the same switch as the moon/sun in the nav. */
export default function DarkMode(): JSX.Element {
  const { dark, toggle } = useUGTheme();
  return (
    <SettingRow
      title="Dark mode"
      description="Also on the moon button in the top bar."
      checked={dark}
      onChange={() => toggle()}
    />
  );
}
