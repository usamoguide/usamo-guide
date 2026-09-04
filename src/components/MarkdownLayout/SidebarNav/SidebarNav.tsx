import * as React from 'react';
import { useContext, useState } from 'react';
import MODULE_ORDERING, {
  Chapter,
  SECTION_LABELS,
} from '../../../../content/ordering';
import MarkdownLayoutContext from '../../../context/MarkdownLayoutContext';
import { MarkdownLayoutSidebarModuleLinkInfo } from '../../../models/module';
import { SolutionInfo } from '../../../models/solution';
import SectionsDropdown from '../../SectionsDropdown';
import Accordion from './Accordion';
import ItemLink from './ItemLink';

export interface NavLinkGroup {
  label: string;
  children: MarkdownLayoutSidebarModuleLinkInfo[];
}

export const SidebarNav = () => {
  const { markdownLayoutInfo, sidebarLinks, activeIDs } = useContext(
    MarkdownLayoutContext
  )!;

  let oriSection =
    markdownLayoutInfo instanceof SolutionInfo
      ? 'general'
      : markdownLayoutInfo.section;
  if (markdownLayoutInfo instanceof SolutionInfo) {
    for (const section of Object.keys(
      SECTION_LABELS
    ) as (keyof typeof SECTION_LABELS)[]) {
      MODULE_ORDERING[section].forEach((category: Chapter) => {
        category.items.forEach(moduleID => {
          if (activeIDs.includes(moduleID)) {
            oriSection = section;
          }
        });
      });
    }
  }

  const [activeSection, setActiveSection] = useState(oriSection);

  const links: NavLinkGroup[] = React.useMemo(() => {
    return MODULE_ORDERING[activeSection].map((category: Chapter) => ({
      label: category.name,
      // Avoid ever producing `undefined` children at runtime (SSG would crash).
      children: category.items.reduce<MarkdownLayoutSidebarModuleLinkInfo[]>(
        (acc, moduleID) => {
          const link = sidebarLinks.find(x => x.id === moduleID);
          if (link) acc.push(link);
          return acc;
        },
        []
      ),
    }));
  }, [activeSection, sidebarLinks]);

  return (
    <nav className="flex h-0 grow flex-col bg-[var(--bg-surface)] dark:bg-[var(--bg-surface)]">
      <div className="shrink-0 border-b border-[var(--border)] dark:border-[var(--border-strong)]">
        <div className="my-4 flex justify-center">
          <SectionsDropdown
            currentSection={activeSection}
            sidebarNav={true}
            onSelect={s => setActiveSection(s as any)}
          />
        </div>
      </div>
      <div className="h-0 flex-1 overflow-y-auto">
        {links.map(group => (
          <Accordion
            key={group.label}
            label={group.label}
            isActive={
              group.children.some(x => x?.id === markdownLayoutInfo?.id)
            }
          >
            {group.children.map(link => (
              <ItemLink key={link.id} link={link} />
            ))}
          </Accordion>
        ))}
      </div>
    </nav>
  );
};
