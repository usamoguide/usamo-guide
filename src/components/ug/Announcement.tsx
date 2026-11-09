import * as React from 'react';
import { IcoArrow, IcoClose } from './icons';
import { UG_LINKS } from './links';

const KEY = 'ug-ann-off';

/** The Discord announcement above the nav. Dismissing it is remembered on this device. */
export default function Announcement(): JSX.Element | null {
  const [off, setOff] = React.useState(false);
  React.useEffect(() => {
    try {
      if (window.localStorage.getItem(KEY) === '1') setOff(true);
    } catch (e) {
      // storage blocked: keep showing it
    }
  }, []);
  if (off) return null;
  return (
    <div className="ann" role="region" aria-label="Announcement">
      <div className="wrap ann-in">
        <p>Join the USAMO Guide Discord. Updates are posted there first.</p>
        <a className="ann-a" href={UG_LINKS.discord} target="_blank" rel="noreferrer">
          Join the server
          <IcoArrow />
        </a>
        <button
          className="ann-x"
          type="button"
          aria-label="Dismiss announcement"
          onClick={() => {
            setOff(true);
            try {
              window.localStorage.setItem(KEY, '1');
            } catch (e) {
              // ignore
            }
          }}
        >
          <IcoClose />
        </button>
      </div>
    </div>
  );
}
