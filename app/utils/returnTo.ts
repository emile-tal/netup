import type { Href } from 'expo-router';

/**
 * The `returnTo` route param: where a contact's back arrow should go when the profile was
 * opened from outside the contacts tab (a tag in the calendar). The contacts stack lives
 * inside its own tab (CLAUDE.md §13), so a plain `back()` there can only reach the list.
 *
 * Only an in-app path is honoured — the param is part of the URL on web, so anything else
 * in it is ignored rather than navigated to.
 */
export function readReturnTo(value: string | string[] | undefined): Href | undefined {
  const path = Array.isArray(value) ? value[0] : value;
  if (!path || !path.startsWith('/') || path.startsWith('//')) return undefined;
  return path as Href;
}
