import { createPortal } from 'react-dom';

import MentionList from './MentionList';
import {
  MENTION_MENU_GAP,
  MENTION_MENU_WIDTH,
  type MentionMenuProps,
  mentionMenuHeight,
} from './menu';

/** Keeps the popup off the very edge of the window. */
const VIEWPORT_MARGIN = 8;

/**
 * Web half of the `@` tag popup.
 *
 * **It is portalled to `document.body`, and it has to be.** The popup is
 * `position: fixed`, and react-native-web gives its `ScrollView` a `transform` — which
 * makes that scroll container the containing block for any fixed descendant, re-anchoring
 * the popup to the container's corner instead of the viewport's. The 5-15-50 board's drag
 * overlay hit exactly this (CLAUDE.md §12). The portal also escapes the day drawer's
 * `overflow: hidden`, which would otherwise clip the popup off the bottom row.
 *
 * The inner surface is still react-native-web (`MentionList`), so NativeWind's tokens
 * apply; only the positioning box is a raw `div`.
 */
const MentionMenu = ({ anchor, ...listProps }: MentionMenuProps) => {
  if (typeof document === 'undefined') return null;

  const height = mentionMenuHeight(listProps.contacts.length);
  const below = anchor.y + anchor.height + MENTION_MENU_GAP;
  // Flip above the text when there isn't room beneath it, rather than running off-screen.
  const flip = below + height + VIEWPORT_MARGIN > window.innerHeight;
  const top = flip
    ? Math.max(VIEWPORT_MARGIN, anchor.y - MENTION_MENU_GAP - height)
    : below;
  const left = Math.max(
    VIEWPORT_MARGIN,
    Math.min(anchor.x, window.innerWidth - MENTION_MENU_WIDTH - VIEWPORT_MARGIN)
  );

  return createPortal(
    <div
      style={{ position: 'fixed', top, left, zIndex: 1000 }}
      // Keeps the field focused when a row is clicked. Without it the mousedown blurs the
      // input, and a blur is what commits the draft line at the bottom of a day — so
      // picking a contact with the mouse would save the half-typed "@sar" instead.
      onMouseDown={event => event.preventDefault()}
    >
      <MentionList {...listProps} />
    </div>,
    document.body
  );
};

export default MentionMenu;
