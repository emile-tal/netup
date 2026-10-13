import { Fragment, useState } from 'react';
import { Text, View } from 'react-native';

import AddItemButton from '../profile/AddItemButton';
import AddOutreachModal from './AddOutreachModal';
import OutreachRow from './OutreachRow';
import { formatRelativeDate, toDayKey } from '../../utils/date';
import useCalendarStore from '../../stores/calendarStore';

interface DayDrawerProps {
  /** The selected day. `MonthView` renders this inside that day's week row. */
  date: Date;
}

/**
 * The selected day's outreach, unfolded **inside the month grid** directly beneath the
 * week row it belongs to.
 *
 * This is where outreach is actually worked on — checked off, renamed, deleted, added —
 * and it sits in the grid rather than in a panel below it so the date you are working on
 * never leaves your eye. It replaced a fixed banner under the calendar, which pushed the
 * grid up and left the day you tapped two hundred pixels away from its own list.
 *
 * It spans the full grid width and carries the grid's own right/bottom hairlines, so the
 * frame closes around it as if it were a week row.
 */
const DayDrawer = ({ date }: DayDrawerProps) => {
  // Selects the map itself, not a derived array: a selector building a new array per call
  // would hand zustand a fresh reference on every render (see CLAUDE.md §11).
  const outreachByDay = useCalendarStore(state => state.outreachByDay);
  const outreach = outreachByDay[toDayKey(date)] ?? [];
  const [addVisible, setAddVisible] = useState(false);

  return (
    <View className='w-full border-b border-r border-line bg-surface-muted px-2 py-2'>
      <Text className='font-nunito px-2 pb-1 text-[12px] uppercase tracking-wider text-ink-subtle'>
        {formatRelativeDate(date)}
      </Text>
      <View className='overflow-hidden rounded-xl border border-line bg-surface'>
        {outreach.length === 0 ? (
          <Text className='font-nunito px-4 py-3 text-[14px] text-ink-subtle'>
            Nothing scheduled
          </Text>
        ) : (
          outreach.map((item, index) => (
            <Fragment key={item.id}>
              {index > 0 && <View className='ml-12 h-[1px] bg-line' />}
              <OutreachRow item={item} />
            </Fragment>
          ))
        )}
        <AddItemButton label='Add outreach' onPress={() => setAddVisible(true)} />
      </View>
      <AddOutreachModal
        visible={addVisible}
        onRequestClose={() => setAddVisible(false)}
      />
    </View>
  );
};

export default DayDrawer;
