import { View } from 'react-native';
import { useRef, useState } from 'react';

import type { ContactSummary } from '../../types/contacts';
import MentionTextInput from '../MentionTextInput';
import { createReminder } from '@/db/repo/reminders';
import { notify } from '../../utils/alert';
import { startOfDay } from '../../utils/date';
import { useDB } from '@/db/dbProvider';

interface NewOutreachRowProps {
  /** The day the drawer is open on — the new outreach is dated to it, no field needed. */
  date: Date;
  contacts: ContactSummary[];
}

/**
 * The blank line that always sits at the bottom of a day's outreach.
 *
 * This is the whole "add" affordance: the day is already chosen by the cell the user
 * tapped, so a button that opens a modal to ask for a title and a date is two dialogs'
 * worth of ceremony around one sentence. The user types where the next item goes and
 * presses Enter. Same idea as the contact form's collections, where the trailing blank
 * row *is* the add control (CLAUDE.md §6).
 *
 * `AddOutreachModal` is still the path from the calendar header, where no day is implied.
 */
const NewOutreachRow = ({ date, contacts }: NewOutreachRowProps) => {
  const db = useDB();
  const [title, setTitle] = useState('');
  // Guards against the blur that follows Enter committing the same text twice.
  const savingRef = useRef(false);

  const commit = async () => {
    const trimmed = title.trim();
    if (!trimmed || savingRef.current) return;

    savingRef.current = true;
    // Cleared up front so the line is ready for the next one and the committed row
    // arrives from the observable rather than lingering here as a duplicate.
    setTitle('');
    try {
      await createReminder(db, { title: trimmed, date: startOfDay(date) });
    } catch (error) {
      console.error('Error creating outreach:', error);
      setTitle(trimmed);
      notify('Could not save', 'The outreach was not created. Please try again.');
    } finally {
      savingRef.current = false;
    }
  };

  return (
    <View className='w-full flex-row items-center gap-3 px-4 py-3'>
      {/* An inert twin of the row's checkbox: it keeps the text on the same left edge as
          every line above it, without offering to complete something that isn't there. */}
      <View className='h-6 w-6 rounded-full border-2 border-line' />

      <View className='min-w-0 flex-1'>
        <MentionTextInput
          value={title}
          onChangeText={setTitle}
          contacts={contacts}
          placeholder='Add outreach'
          accessibilityLabel='New outreach'
          onSubmit={() => void commit()}
          onBlur={() => void commit()}
        />
      </View>
    </View>
  );
};

export default NewOutreachRow;
