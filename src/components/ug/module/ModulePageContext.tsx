import * as React from 'react';

/** What the lesson's components need to know about the module they're in. */
export type ModulePageInfo = {
  id: string;
  title: string;
};

const ModulePageContext = React.createContext<ModulePageInfo | null>(null);

export const ModulePageProvider = ModulePageContext.Provider;

export function useModulePage(): ModulePageInfo | null {
  return React.useContext(ModulePageContext);
}
