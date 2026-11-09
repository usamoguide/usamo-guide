import * as React from 'react';
import { ModuleProgress } from '../../../models/module';
import { closeMenu } from '../hooks';
import { IcoChev } from '../icons';
import { MODULE_STATUS, moduleStatusIndex } from './track';

/**
 * The module status pill (`.stm`): the current status with a menu of every
 * status. `up` opens the menu upwards (the copy at the end of the module).
 */
export default function ModuleStatusMenu({
  status,
  onChange,
  up = false,
}: {
  status: ModuleProgress;
  onChange: (next: ModuleProgress) => void;
  up?: boolean;
}): JSX.Element {
  const k = moduleStatusIndex(status);
  const label = MODULE_STATUS[k].label;
  return (
    <details className={up ? 'stm up' : 'stm'} data-dismiss="">
      <summary className="stm-btn" aria-label={`Module status: ${label}`}>
        <span className={`stm-dot s${k}`} aria-hidden="true" />
        <span>{label}</span>
        <IcoChev />
      </summary>
      <div className="stm-menu" role="menu" aria-label="Module status">
        {MODULE_STATUS.map((o, j) => (
          <button
            key={o.value}
            className={j === k ? 'stm-opt on' : 'stm-opt'}
            type="button"
            role="menuitemradio"
            aria-checked={j === k ? 'true' : 'false'}
            onClick={e => {
              closeMenu(e);
              onChange(o.value);
            }}
          >
            <span className={`stm-dot s${j}`} aria-hidden="true" />
            {o.label}
          </button>
        ))}
      </div>
    </details>
  );
}
