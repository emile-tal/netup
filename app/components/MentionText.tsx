import { Text } from 'react-native';
import { useMemo } from 'react';

import { mentionSegments, parseMentions } from '../utils/mentions';

interface MentionTextProps {
  /** A stored title, tags and all (`@[Sarah Smith](id)`). */
  value: string;
  className?: string;
  numberOfLines?: number;
}

/**
 * A title read-only, with each tag drawn as the contact's name in bold — no `@`, no id.
 * The outer `Text` carries the caller's size and colour, so a tag inherits both and
 * differs only in weight.
 *
 * Editable titles go through `MentionTextInput` instead, which cannot use bold (see its
 * doc): a read-only line has no caret to keep in register.
 */
const MentionText = ({ value, className, numberOfLines }: MentionTextProps) => {
  const segments = useMemo(() => mentionSegments(parseMentions(value)), [value]);

  return (
    <Text numberOfLines={numberOfLines} className={className}>
      {segments.map((segment, index) =>
        segment.contactId ? (
          <Text key={index} className='font-nunito-bold'>
            {segment.text}
          </Text>
        ) : (
          <Text key={index}>{segment.text}</Text>
        )
      )}
    </Text>
  );
};

export default MentionText;
