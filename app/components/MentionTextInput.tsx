import { Text, TextInput, View } from 'react-native';
import type {
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  TextInputSelectionChangeEventData,
} from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { ContactSummary } from '../types/contacts';
import MentionMenu from '@/components/mentions/MentionMenu';
import {
  applyMention,
  caretAfterChange,
  findMentionQuery,
  matchMentionContacts,
  mentionLabel,
  splitMentions,
} from '../utils/mentions';
import { colors, fonts } from '../theme';
import { noFocusRing } from '../utils/inputStyle';

const FONT_SIZE = 15;
const LINE_HEIGHT = 20;

/** Grows with the text up to three lines, then scrolls. */
export const MENTION_INPUT_MAX_HEIGHT = 60;

interface MentionTextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  /** Everyone who can be tagged — from `useContactDirectory()`, one call per screen. */
  contacts: ContactSummary[];
  placeholder?: string;
  /** Enter with no tag popup open. Given one, Enter no longer inserts a newline. */
  onSubmit?: () => void;
  onBlur?: () => void;
  /** Strikes the text through, for a completed outreach. */
  struck?: boolean;
  /** Dims the text, for a completed outreach. */
  muted?: boolean;
  autoFocus?: boolean;
  accessibilityLabel?: string;
}

/**
 * A one-to-three-line text field that **tags contacts with `@`** and renders the tags it
 * recognises bold + underlined.
 *
 * ### Why there are two layers
 *
 * A `TextInput` cannot style a *range* of its own text: on web it is a `textarea`, which
 * has no rich text at all. So the box holds both a `Text` that draws the styled version
 * and the input itself, absolutely filling it:
 *
 * - The `Text` is the only thing in the layout flow, so **it sizes the box** — which is
 *   also how the field auto-grows without `onContentSizeChange` (unimplemented on web)
 *   or a DOM `scrollHeight` read. `maxHeight` caps it and the input scrolls past that.
 * - The input sits on top so every click, caret and selection goes straight to it, and it
 *   paints its own text only **while focused**; blurred, its text goes transparent and
 *   the styled layer below shows through.
 *
 * The visible trade-off: a tag is plain while you are typing in the field and turns bold
 * when you leave it. Making it live would mean a transparent-ink input, which also hides
 * the caret (browsers take `caret-color` from `color`).
 *
 * ### The popup
 *
 * Detection, matching and insertion are pure functions in `app/utils/mentions.ts`;
 * positioning is the platform split in `components/mentions/`.
 */
const MentionTextInput = ({
  value,
  onChangeText,
  contacts,
  placeholder,
  onSubmit,
  onBlur,
  struck,
  muted,
  autoFocus,
  accessibilityLabel,
}: MentionTextInputProps) => {
  const boxRef = useRef<View>(null);
  const [focused, setFocused] = useState(false);
  const [caret, setCaret] = useState(value.length);
  const [activeIndex, setActiveIndex] = useState(0);
  // The `@` the user pressed Escape on, so the popup stays shut for that tag only.
  const [dismissedStart, setDismissedStart] = useState<number | null>(null);
  const [anchor, setAnchor] = useState<{ x: number; y: number; height: number } | null>(
    null
  );
  // One-shot: the caret is only driven programmatically right after inserting a tag.
  const [pendingSelection, setPendingSelection] = useState<{
    start: number;
    end: number;
  } | null>(null);

  const labels = useMemo(() => contacts.map(mentionLabel), [contacts]);
  const segments = useMemo(() => splitMentions(value, labels), [value, labels]);

  const mention = focused ? findMentionQuery(value, caret) : null;
  const matches = useMemo(
    () => (mention ? matchMentionContacts(contacts, mention.query) : []),
    [contacts, mention?.query] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const menuOpen =
    !!mention && mention.start !== dismissedStart && matches.length > 0;

  // Back to the top whenever the query changes, so the default highlight is the best
  // match rather than wherever the arrow keys were left.
  useEffect(() => setActiveIndex(0), [mention?.start, mention?.query]);

  // Re-measured as the text (and so the box) grows, which keeps the popup on its anchor.
  useEffect(() => {
    if (!menuOpen) return;
    boxRef.current?.measureInWindow((x, y, _width, height) =>
      setAnchor({ x, y, height })
    );
  }, [menuOpen, value]);

  // Driving the caret is a one-render affair: left in place, the prop would pin the caret
  // where the tag was inserted and the user could not click past it.
  useEffect(() => {
    if (pendingSelection) setPendingSelection(null);
  }, [pendingSelection]);

  const handleChangeText = (next: string) => {
    setCaret(caretAfterChange(value, next));
    onChangeText(next);
  };

  const handleSelectionChange = (
    event: NativeSyntheticEvent<TextInputSelectionChangeEventData>
  ) => {
    // Fires on native, and on web only when a range is selected — `caretAfterChange` is
    // what keeps the caret honest while typing (see `app/utils/mentions.ts`).
    setCaret(event.nativeEvent.selection.start);
  };

  const insert = (contact: ContactSummary) => {
    if (!mention) return;
    const next = applyMention(value, mention, contact);
    onChangeText(next.text);
    setCaret(next.caret);
    setPendingSelection({ start: next.caret, end: next.caret });
    setDismissedStart(null);
  };

  const handleKeyPress = (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    // On web this is the React keydown event (so `key` sits on the event itself and
    // `preventDefault` works); on native only `nativeEvent.key` is there.
    const webEvent = event as unknown as { key?: string; preventDefault?: () => void };
    const key = webEvent.key ?? event.nativeEvent?.key;
    const prevent = () => webEvent.preventDefault?.();

    if (menuOpen && mention) {
      if (key === 'ArrowDown') {
        prevent();
        setActiveIndex(index => (index + 1) % matches.length);
        return;
      }
      if (key === 'ArrowUp') {
        prevent();
        setActiveIndex(index => (index - 1 + matches.length) % matches.length);
        return;
      }
      if (key === 'Enter' || key === 'Tab') {
        prevent();
        insert(matches[activeIndex] ?? matches[0]);
        return;
      }
      if (key === 'Escape') {
        prevent();
        setDismissedStart(mention.start);
        return;
      }
      // A space can't be part of a query, so the spacebar closes the popup on its own.
      // Moving the caret does not report itself on web, so treat it as a dismissal
      // rather than leave the popup matching text the caret has left.
      if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'Home' || key === 'End') {
        setDismissedStart(mention.start);
        return;
      }
    }

    if (key === 'Enter' && onSubmit) {
      prevent();
      onSubmit();
    }
  };

  const decoration = struck ? ('line-through' as const) : ('none' as const);

  return (
    // `w-full`, not `flex-1`: the caller decides how the field sits in its row, and the
    // popup is positioned against this box on native.
    <View className='w-full'>
      <View
        ref={boxRef}
        style={{
          minHeight: LINE_HEIGHT,
          maxHeight: MENTION_INPUT_MAX_HEIGHT,
          overflow: 'hidden',
        }}
      >
        <Text
          // Not `aria-hidden`: blurred, this *is* the text. It keeps its space while
          // focused because the box is sized from it.
          style={{
            opacity: focused ? 0 : 1,
            fontSize: FONT_SIZE,
            lineHeight: LINE_HEIGHT,
            textDecorationLine: decoration,
          }}
          className={`font-nunito ${muted ? 'text-ink-subtle' : 'text-ink'}`}
        >
          {segments.map((segment, index) =>
            segment.mention ? (
              <Text key={index} className='font-nunito-bold underline'>
                {segment.text}
              </Text>
            ) : (
              <Text key={index}>{segment.text}</Text>
            )
          )}
        </Text>

        <TextInput
          value={value}
          onChangeText={handleChangeText}
          onSelectionChange={handleSelectionChange}
          onKeyPress={handleKeyPress}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setDismissedStart(null);
            onBlur?.();
          }}
          selection={pendingSelection ?? undefined}
          placeholder={placeholder}
          placeholderTextColor={colors.inkSubtle}
          accessibilityLabel={accessibilityLabel}
          autoFocus={autoFocus}
          multiline
          // Enter is the submit key when there is something to submit, so RN-web must not
          // also fire its own submit/blur handling for it.
          blurOnSubmit={false}
          style={[
            noFocusRing,
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              padding: 0,
              fontFamily: fonts.regular,
              fontSize: FONT_SIZE,
              lineHeight: LINE_HEIGHT,
              textAlignVertical: 'top',
              textDecorationLine: decoration,
              // Transparent while blurred so the styled layer below is what you read.
              color: focused ? (muted ? colors.inkSubtle : colors.ink) : 'transparent',
            },
          ]}
        />
      </View>

      {menuOpen && anchor && (
        <MentionMenu
          contacts={matches}
          activeIndex={activeIndex}
          anchor={anchor}
          onSelect={insert}
          onHover={setActiveIndex}
        />
      )}
    </View>
  );
};

export default MentionTextInput;
