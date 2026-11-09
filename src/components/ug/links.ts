// Real destinations for the placeholder links in the redesign export
// (#discord, #github, #contests, ...). Use these everywhere instead of hardcoding.
export const UG_LINKS = {
  discord: 'https://discord.gg/WZge4DWUuy',
  github: 'https://github.com/usamoguide/usamo-guide',
  githubIssues: 'https://github.com/usamoguide/usamo-guide/issues',
  contests: 'https://contests.usamoguide.com/',
  o4e: 'https://www.olympiad4everyone.com/',
  aopsArchive:
    'https://artofproblemsolving.com/wiki/index.php/AMC_Problems_and_Solutions',
  about: '/about',
  contact: '/contact-us',
  problems: '/problems',
  start: '/start',
  dashboard: '/dashboard',
  settings: '/settings',
  groups: '/groups',
  otherResources: '/other-useful-resources',
  faq: '/#faq',
  o4eSection: '/#o4e',
  privacy: '/privacy-policy',
  terms: '/terms-of-service',
} as const;

export type TrackID = 'foundations' | 'intermediate' | 'advanced' | 'usamo';

/** The four tracks, in order, as the nav and the track tabs name them. */
export const UG_TRACKS: {
  id: TrackID;
  name: string;
  exam: string;
  /** "Foundations (AMC 8)" */
  label: string;
}[] = [
  { id: 'foundations', name: 'Foundations', exam: 'AMC 8', label: 'Foundations (AMC 8)' },
  {
    id: 'intermediate',
    name: 'Intermediate',
    exam: 'AMC 10/12',
    label: 'Intermediate (AMC 10/12)',
  },
  { id: 'advanced', name: 'Advanced', exam: 'AIME', label: 'Advanced (AIME)' },
  { id: 'usamo', name: 'Olympiad', exam: 'USA(J)MO', label: 'Olympiad (USA(J)MO)' },
];

export function isExternal(href: string): boolean {
  return /^(https?:|mailto:)/.test(href);
}
