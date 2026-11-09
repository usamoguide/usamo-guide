import { Link } from 'gatsby';
import React from 'react';
import { GroupData } from '../../../models/groups/groups';

export const GroupCard = ({ group }: { group: GroupData }): JSX.Element => {
  return (
    <Link
      to={`/groups/${group.id}/`}
      className="mb-4 block rounded-lg bg-[var(--card-bg)] px-3 py-2 transition sm:px-5 sm:py-4 hover:opacity-90"
    >
      <div className="font-medium sm:text-lg">{group.name}</div>
      <div className="text-xs text-gray-700 sm:text-sm dark:text-[var(--text-secondary)]">
        {group.description}
      </div>
    </Link>
  );
};
