import { Text, TextInput, View } from 'react-native';
import type {
  NativeSyntheticEvent,
  TextInputChangeEventData,
  TextInputKeyPressEventData,
  TextInputScrollEventData,
  TextInputSelectionChangeEventData,
} from 'react-native';
import { type Ref, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

import type { ContactSummary } from '../types/contacts';
import MentionMenu from '@/components/mentions/MentionMenu';
import {
  type MentionDraft,
  applyMentionEdit,
  findMentionQuery,
  insertMention,
  matchMentionContacts,
  mentionSegments,
  mentionTagAt,
  parseMentions,
  serializeMentions,
} from '../utils/mentions';
import { colors, fonts } from '../theme';
import { mirroredInput, noFocusRing } from '../utils/inputStyle';
import { type Href, usePathname, useRouter } from 'expo-router';
import { isPointOverAny } from '../utils/hitTest';

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
  /**
   * Tapping a tag opens its contact (default). Off where leaving would lose work — a
   * modal's unsaved form — so there a tag is just text that deletes as one.
   */
  linkTags?: boolean;
  ref?: Ref<TextInput>;
}

/**
 * A one-to-three-line text field that **tags contacts with `@`**.
 *
 * Picking a contact from the popup replaces the typed `@sar` with "Sarah Smith" as a
 * **tag**: drawn on a blue wash, with no `@` on screen, and atomic — Backspace or Delete
 * anywhere in it removes the whole name, and tapping it opens that contact instead of
 * placing a caret. The stored title reads `@[Sarah Smith](id)` (CLAUDE.md §21); the field
 * edits a `MentionDraft` and serialises back on every change (`app/utils/mentions.ts`).
 *
 * ### Why there are two layers
 *
 * A `TextInput` cannot style a *range* of its own text: on web it is a `textarea`, which
 * has no rich text at all. So the box holds both a `Text` that draws the styled version
 * and the input itself, absolutely filling it, with **transparent ink and a visible
 * caret**. Every click, caret and selection goes to the input; every glyph you read is the
 * `Text`. That only lines up because both layers use the same face, size and line height —
 * which is why a tag is marked with a wash and not bold: a wider glyph would push every
 * caret position after it out of register.
 *
 * - The `Text` is the only thing in the layout flow, so **it sizes the box** — which is
 *   how the field auto-grows without `onContentSizeChange` (unimplemented on web). It
 *   ends in a zero-width space, because a trailing newline adds no line to a `Text` and
 *   the box would lag one line behind the input after every Enter.
 * - Past `MENTION_INPUT_MAX_HEIGHT` the input scrolls, and the `Text` is shifted by the
 *   same offset so the two stay in register.
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
  linkTags = true,
  ref,
}: MentionTextInputProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const boxRef = useRef<View>(null);
  const inputRef = useRef<TextInput>(null);
  useImperativeHandle(ref, () => inputRef.current as TextInput, []);
  // The tag spans of the styled layer, for the hover hit-test (web).
  const tagNodesRef = useRef<unknown[]>([]);
  const [overTag, setOverTag] = useState(false);
  // Native reports a tap as press-in, then the caret it placed; this joins the two.
  const tappedRef = useRef(false);
  const [focused, setFocused] = useState(false);
  const [caret, setCaret] = useState(value.length);
  const [scrollY, setScrollY] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  // The `@` the user pressed Escape on, so the popup stays shut for that tag only.
  const [dismissedStart, setDismissedStart] = useState<number | null>(null);
  const [anchor, setAnchor] = useState<{ x: number; y: number; height: number } | null>(
    null
  );
  // One-shot: the caret is only driven programmatically right after the field's text was
  // replaced underneath it (a tag inserted or deleted whole).
  const [pendingSelection, setPendingSelection] = useState<{
    start: number;
    end: number;
  } | null>(null);

  // The draft is the field's own state; `source` is the stored title it serialises to.
  // It is re-derived from `value` only when the title changes from outside (a pull, a
  // rename, the trailing row clearing itself), so our own echo never resets the field.
  const [draft, setDraft] = useState(() => ({ ...parseMentions(value), source: value }));
  let current = draft;
  if (value !== draft.source) {
    current = { ...parseMentions(value), source: value };
    setDraft(current);
  }
  const text = current.text;

  const mention = focused ? findMentionQuery(text, caret) : null;
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
  }, [menuOpen, text]);

  // Driving the caret is a one-render affair: left in place, the prop would pin the caret
  // where it was put and the user could not click past it.
  useEffect(() => {
    if (pendingSelection) setPendingSelection(null);
  }, [pendingSelection]);

  const commit = (next: MentionDraft, nextCaret: number, moveCaret: boolean) => {
    const stored = serializeMentions(next);
    setDraft({ ...next, source: stored });
    setCaret(nextCaret);
    if (moveCaret) setPendingSelection({ start: nextCaret, end: nextCaret });
    onChangeText(stored);
  };

  const handleChange = (event: NativeSyntheticEvent<TextInputChangeEventData>) => {
    // Web hands over the textarea itself, whose caret is exact; native gets the diff's
    // best guess and corrects it from `onSelectionChange`.
    const target = (event as unknown as { target?: { selectionStart?: unknown } }).target;
    const reported =
      typeof target?.selectionStart === 'number' ? target.selectionStart : undefined;
    const edit = applyMentionEdit(current, event.nativeEvent.text, reported);
    tappedRef.current = false;
    commit(edit.draft, edit.caret, edit.rewritten);
  };

  /** Opens the contact whose tag holds a collapsed caret at `start`. */
  const openTagAt = (start: number, end: number) => {
    if (!linkTags || start !== end) return false;
    const tag = mentionTagAt(current.tags, start);
    // A tag can outlive its contact; with nowhere to go, the tap just places the caret.
    if (!tag || !contacts.some(contact => contact.id === tag.contactId)) return false;
    inputRef.current?.blur();
    // `returnTo` sends the profile's back arrow here rather than to the contacts list,
    // which is all a back inside the contacts tab's own stack can reach (CLAUDE.md §13).
    router.push({
      pathname: '/contacts/[id]',
      params: { id: tag.contactId, returnTo: pathname },
    } as Href);
    return true;
  };

  const handleSelectionChange = (
    event: NativeSyntheticEvent<TextInputSelectionChangeEventData>
  ) => {
    // Fires on native, and on web only when a range is selected — `handleChange` is
    // what keeps the caret honest while typing there.
    const { start, end } = event.nativeEvent.selection;
    setCaret(start);
    if (tappedRef.current) {
      tappedRef.current = false;
      openTagAt(start, end);
    }
  };

  // Web only: a click has already placed the textarea's caret by the time it fires.
  // (On native `onClick` is never called; `onPressIn` + `onSelectionChange` do the job.)
  const handleClick = (event: { target?: { selectionStart?: number; selectionEnd?: number } }) => {
    const { selectionStart, selectionEnd } = event.target ?? {};
    if (typeof selectionStart !== 'number' || typeof selectionEnd !== 'number') return;
    setCaret(selectionStart);
    openTagAt(selectionStart, selectionEnd);
  };

  // Web only: the input sits on top of the tags, so hovering one is a geometry question.
  const handleMouseMove = (event: { clientX: number; clientY: number }) => {
    if (!linkTags) return;
    const nodes = tagNodesRef.current.filter(Boolean);
    const over = nodes.length > 0 && isPointOverAny(nodes, event.clientX, event.clientY);
    if (over !== overTag) setOverTag(over);
  };

  const handleScroll = (event: NativeSyntheticEvent<TextInputScrollEventData>) => {
    // Native normalises the offset; react-native-web forwards the raw DOM event.
    const native = event.nativeEvent as Partial<TextInputScrollEventData> | undefined;
    const dom = (event as unknown as { target?: { scrollTop?: number } }).target;
    setScrollY(native?.contentOffset?.y ?? dom?.scrollTop ?? 0);
  };

  const insert = (contact: ContactSummary) => {
    if (!mention) return;
    const next = insertMention(current, mention, contact);
    commit(next.draft, next.caret, true);
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

  // Prose and tag runs, then a zero-width space so a trailing newline still claims its
  // line (see the component doc).
  const runs = [...mentionSegments(current), { text: '\u200B' }];

  const webOnly = {
    onClick: handleClick,
    onMouseMove: handleMouseMove,
    onMouseLeave: () => setOverTag(false),
  } as object;
  tagNodesRef.current = [];

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
          // Not `aria-hidden`: blurred, this is what a screen reader's virtual cursor
          // lands on. It keeps its space because the box is sized from it.
          style={{
            fontSize: FONT_SIZE,
            lineHeight: LINE_HEIGHT,
            textDecorationLine: struck ? 'line-through' : 'none',
            transform: [{ translateY: -scrollY }],
          }}
          className={`font-nunito ${muted ? 'text-ink-subtle' : 'text-ink'}`}
        >
          {runs.map((run, index) =>
            run.contactId ? (
              <Text
                key={index}
                ref={node => {
                  tagNodesRef.current.push(node);
                }}
                className={`rounded bg-blue-lighter ${
                  muted ? 'text-ink-subtle' : 'text-blue-darker'
                }`}
              >
                {run.text}
              </Text>
            ) : (
              <Text key={index}>{run.text}</Text>
            )
          )}
        </Text>

        <TextInput
          ref={inputRef}
          value={text}
          onChange={handleChange}
          onSelectionChange={handleSelectionChange}
          onKeyPress={handleKeyPress}
          onScroll={handleScroll}
          onPressIn={() => {
            tappedRef.current = true;
          }}
          {...webOnly}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setDismissedStart(null);
            tappedRef.current = false;
            onBlur?.();
          }}
          selection={pendingSelection ?? undefined}
          placeholder={placeholder}
          placeholderTextColor={colors.inkSubtle}
          cursorColor={colors.ink}
          accessibilityLabel={accessibilityLabel}
          autoFocus={autoFocus}
          multiline
          // Enter is the submit key when there is something to submit, so RN-web must not
          // also fire its own submit/blur handling for it.
          blurOnSubmit={false}
          style={[
            noFocusRing,
            mirroredInput,
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
              // Always transparent: the styled layer below is what you read.
              color: 'transparent',
              // Over a tag the click opens the contact, so it reads as a link, not text.
              cursor: overTag ? 'pointer' : 'auto',
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
