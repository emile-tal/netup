/**
 * Shared plumbing for the `@` tag popup — the same role `board.ts` plays for the 5-15-50
 * board: everything both halves of the platform split agree on.
 *
 * `MentionMenu.tsx` / `MentionMenu.web.tsx` live here, outside `app/`, because the web
 * half portals through `react-dom` and expo-router bundles every file under `app/` on
 * every platform regardless of its suffix (CLAUDE.md §12).
 */

import type { ContactSummary } from '@/app/types/contacts';

/** One row's height, so the list can scroll the highlighted row into view. */
export const MENTION_ITEM_HEIGHT = 40;

/** Taller than this and the list scrolls. */
export const MENTION_MENU_MAX_HEIGHT = 200;

export const MENTION_MENU_WIDTH = 240;

/** Distance between the text being typed and the popup. */
export const MENTION_MENU_GAP = 4;

export interface MentionMenuProps {
  /** Already filtered and ranked by `matchMentionContacts`; never empty. */
  contacts: ContactSummary[];
  /** The highlighted row — row 0 by default, moved with the arrow keys. */
  activeIndex: number;
  /**
   * The box the text is being typed in, in viewport coordinates, from `measureInWindow`.
   * The **web** half positions its portal with it; the native half ignores it and anchors
   * to its parent, which is that same box.
   */
  anchor: { x: number; y: number; height: number };
  onSelect: (contact: ContactSummary) => void;
  /** Pointer hover moves the highlight, so mouse and keyboard agree on what is selected. */
  onHover: (index: number) => void;
}

/** Estimated height, used by the web half to decide whether to flip above the anchor. */
export function mentionMenuHeight(count: number): number {
  return Math.min(count * MENTION_ITEM_HEIGHT, MENTION_MENU_MAX_HEIGHT);
}
