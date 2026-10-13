import { Fragment } from 'react';
import { View } from 'react-native';

import NewOutreachRow from './NewOutreachRow';
import OutreachRow from './OutreachRow';
import { toDayKey } from '../../utils/date';
import useCalendarStore from '../../stores/calendarStore';
import { useContactDirectory } from '../../hooks/useContactDirectory';

interface DayDrawerProps {
  /** The selected day. `MonthView` renders this inside that day's week row. */
  date: Date;
}

/**
 * The selected day's outreach, unfolded **inside the month grid** directly beneath the
 * week row it belongs to.
 *
 * This is where outreach is actually worked on — checked off, renamed, added, deleted —
 * and it sits in the grid rather than in a panel below it so the date you are working on
 * never leaves your eye. It replaced a fixed banner under the calendar, which pushed the
 * grid up and left the day you tapped two hundred pixels away from its own list.
 *
 * The day is **not** written out again at the top: the drawer is attached to the cell the
 * user just pressed, which is highlighted, so a date heading restates what the position
 * already says. Tapping that cell again closes the drawer (`DayCell`).
 *
 * It spans the full grid width and carries the grid's own right/bottom hairlines, so the
 * frame closes around it as if it were a week row.
 */
const DayDrawer = ({ date }: DayDrawerProps) => {
  // Selects the map itself, not a derived array: a selector building a new array per call
  // would hand zustand a fresh reference on every render (see CLAUDE.md §11).
  const outreachByDay = useCalendarStore(state => state.outreachByDay);
  const outreach = outreachByDay[toDayKey(date)] ?? [];
  // One subscription for the whole calendar: exactly one drawer exists across the month
  // list (CLAUDE.md §20), so this hook runs once no matter how far the user has scrolled.
  const contacts = useContactDirectory();

  return (
    <View className='w-full border-b border-r border-line bg-surface-muted p-2'>
      <View className='rounded-xl border border-line bg-surface'>
        {outreach.map((item, index) => (
          <Fragment key={item.id}>
            {index > 0 && <View className='ml-12 h-[1px] bg-line' />}
            <OutreachRow item={item} contacts={contacts} />
          </Fragment>
        ))}
        {/* Always last, and never conditional: an empty day is just this line on its own,
            which is a better empty state than the words "nothing scheduled" — it says
            what to do instead of what isn't there. */}
        {outreach.length > 0 && <View className='ml-12 h-[1px] bg-line' />}
        <NewOutreachRow date={date} contacts={contacts} />
      </View>
    </View>
  );
};

export default DayDrawer;
