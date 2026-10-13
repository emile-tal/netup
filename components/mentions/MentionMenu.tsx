import { View } from 'react-native';

import MentionList from './MentionList';
import { MENTION_MENU_GAP, type MentionMenuProps } from './menu';

/**
 * Native half of the `@` tag popup: positioned against its parent, which is the box the
 * text is being typed in.
 *
 * It ignores `anchor` — measured window coordinates are what the web half needs for a
 * portal, and an absolutely positioned child here is already in the right coordinate
 * space. See `MentionMenu.web.tsx` for the other half and CLAUDE.md §12 for why the pair
 * lives outside `app/`.
 *
 * **Untested on a device, and it can be clipped.** Nothing stops an ancestor with
 * `overflow: hidden` from cutting the popup off — on web the portal sidesteps that
 * entirely, and a native equivalent (a transparent `Modal`, or an overlay hoisted to the
 * screen root) is the fix if a device shows the problem. See CLAUDE.md §10.
 */
const MentionMenu = ({ anchor: _anchor, ...listProps }: MentionMenuProps) => {
  return (
    <View
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        marginTop: MENTION_MENU_GAP,
        zIndex: 50,
      }}
    >
      <MentionList {...listProps} />
    </View>
  );
};

export default MentionMenu;
