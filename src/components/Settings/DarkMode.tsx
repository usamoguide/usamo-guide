import * as React from 'react';
import {
  useSetThemeSetting,
  useThemeSetting,
} from '../../context/UserDataContext/properties/simpleProperties';
import RadioList from '../elements/RadioList';

export default function DarkMode() {
  const theme = useThemeSetting();
  const setTheme = useSetThemeSetting();

  return (
    <div>
      <div className="space-y-1">
        <h3 className="text-lg leading-6 font-medium text-[var(--text-primary)]">
          Theme
        </h3>
        <p className="text-sm text-[var(--text-muted)]">
          We don't support a seperate Light Mode; the interface is styled for dark mode
          only. "System" uses your OS prefs but results in dark theming.
        </p>
      </div>
      <div className="h-4" />
      <RadioList
        name="theme"
        options={['dark', 'system']}
        value={theme === 'light' ? 'dark' : theme}
        onChange={newValue => {
          if (newValue === 'light') {
            setTheme('dark');
          } else {
            setTheme(newValue);
          }
        }}
        labelMap={{ dark: 'Dark Mode', system: 'System' }}
        descriptionMap={{}}
      />
    </div>
  );
}
