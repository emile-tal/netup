/**
 * The nav's labels, keyed by the tab's top-level path segment. The tab layout reads them
 * for the nav, and a contact's back control reads them to name where it returns to — one
 * list, so the two can't disagree.
 */
export const TAB_TITLES = {
  contacts: 'Contacts',
  calendar: 'Calendar',
  network: '5-15-50',
  profile: 'Profile',
} as const;

/** The tab an in-app path belongs to, by its title. Anything unknown is the contacts tab. */
export function tabTitleForPath(path: string): string {
  const segment = path.split(/[/?#]/)[1] ?? '';
  return segment in TAB_TITLES
    ? TAB_TITLES[segment as keyof typeof TAB_TITLES]
    : TAB_TITLES.contacts;
}
