import * as React from 'react';
import {
  useHideDifficultySetting,
  useHideModulesSetting,
  useSetHideDifficultySetting,
  useSetHideModulesSetting,
  useSetShowIgnoredSetting,
  useSetShowTagsSetting,
  useShowIgnoredSetting,
  useShowTagsSetting,
} from '../../context/UserDataContext/properties/simpleProperties';
import DarkMode from './DarkMode';
import SettingRow, { SettingsGroup } from './SettingRow';

export default function General(): JSX.Element {
  // todo: I think we should actually just use one massive useUserSettings() hook lol
  const showIgnored = useShowIgnoredSetting();
  const setShowIgnored = useSetShowIgnoredSetting();
  const showTags = useShowTagsSetting();
  const setShowTags = useSetShowTagsSetting();
  const hideDifficulty = useHideDifficultySetting();
  const setHideDifficulty = useSetHideDifficultySetting();
  const hideModules = useHideModulesSetting();
  const setHideModules = useSetHideModulesSetting();
  const [isLongPolling, setIsLongPolling] = React.useState<boolean>(false);
  /**
   * For people behind proxies or with terrible internet - behold the power of long polling!
   */
  React.useEffect(() => {
    if (localStorage.getItem('USAMO_GUIDE_LONG_POLLING') === 'true') {
      setIsLongPolling(true);
    } else {
      setIsLongPolling(false);
    }
  }, []);

  React.useEffect(() => {
    if (isLongPolling) {
      localStorage.setItem('USAMO_GUIDE_LONG_POLLING', 'true');
    } else {
      localStorage.setItem('USAMO_GUIDE_LONG_POLLING', 'false');
    }
  }, [isLongPolling]);

  return (
    <>
      <SettingsGroup
        title="Display"
        description="How the guide looks and what problem lists show."
      >
        <div className="ap-rows">
          <DarkMode />
          <SettingRow
            title="Show tags"
            description="In problem lists and search."
            checked={showTags}
            onChange={b => setShowTags(b)}
          />
          <SettingRow
            title="Hide difficulty"
            description="In problem lists and search."
            checked={hideDifficulty}
            onChange={b => setHideDifficulty(b)}
          />
          <SettingRow
            title="Hide modules"
            description="In problem search."
            checked={hideModules}
            onChange={b => setHideModules(b)}
          />
          <SettingRow
            title="Show ignored problems and modules"
            description="On the dashboard."
            checked={showIgnored}
            onChange={b => setShowIgnored(b)}
          />
        </div>
      </SettingsGroup>
      <SettingsGroup title="Connection">
        <div className="ap-rows">
          <SettingRow
            title="Use long polling"
            description={
              <>
                <b>Turn this on only if you can't connect to Supabase</b>{' '}
                (nothing loads). Close and reopen the tab after switching.
              </>
            }
            checked={isLongPolling}
            onChange={b => setIsLongPolling(b)}
          />
        </div>
      </SettingsGroup>
    </>
  );
}
