import { Pressable, ScrollView, Text, View } from 'react-native';
import { useEffect, useRef } from 'react';

import {
  MENTION_ITEM_HEIGHT,
  MENTION_MENU_MAX_HEIGHT,
  MENTION_MENU_WIDTH,
  type MentionMenuProps,
} from './menu';
import { colors } from '@/app/theme';
import { fullName } from '@/app/utils/string';

/**
 * The popup's contents: the matching contacts, one highlighted. Both halves of the
 * platform split render this, so only the *positioning* differs between web and native.
 */
const MentionList = ({
  contacts,
  activeIndex,
  onSelect,
  onHover,
}: Omit<MentionMenuProps, 'anchor'>) => {
  const scrollRef = useRef<ScrollView>(null);

  // Keyboard navigation has to be able to reach past the eighth row.
  useEffect(() => {
    const top = Math.max(
      0,
      (activeIndex + 1) * MENTION_ITEM_HEIGHT - MENTION_MENU_MAX_HEIGHT
    );
    scrollRef.current?.scrollTo({ y: top, animated: false });
  }, [activeIndex]);

  return (
    <View
      className='overflow-hidden rounded-xl border border-line-strong bg-surface'
      style={{
        width: MENTION_MENU_WIDTH,
        maxHeight: MENTION_MENU_MAX_HEIGHT,
        // The grid and the day drawer both draw hairlines, so the popup needs real depth
        // to read as floating over them. `shadow*` rather than `boxShadow`:
        // react-native-web maps these onto one, and they are typed on native.
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 8,
      }}
    >
      <ScrollView ref={scrollRef} keyboardShouldPersistTaps='always'>
        {contacts.map((contact, index) => {
          const name = fullName(contact.firstName, contact.lastName);
          const secondary = [contact.jobTitle, contact.company].filter(Boolean).join(' · ');

          return (
            <Pressable
              key={contact.id}
              accessibilityRole='button'
              accessibilityLabel={`Tag ${name}`}
              onPress={() => onSelect(contact)}
              onHoverIn={() => onHover(index)}
              style={{ height: MENTION_ITEM_HEIGHT }}
              className={`justify-center px-3 ${
                index === activeIndex ? 'bg-blue-lighter' : 'bg-surface'
              }`}
            >
              <Text
                numberOfLines={1}
                className={`font-nunito text-[14px] ${
                  index === activeIndex ? 'text-blue-darker' : 'text-ink'
                }`}
              >
                {name}
              </Text>
              {secondary.length > 0 && (
                <Text
                  numberOfLines={1}
                  className='font-nunito text-[11px] text-ink-subtle'
                >
                  {secondary}
                </Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default MentionList;
