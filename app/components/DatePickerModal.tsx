import { Pressable, Text, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';

import Button from './Button';
import ChevronRightIcon from '../icons/ChevronRightIcon';
import IconButton from './IconButton';
import ModalShell from './ModalShell';
import { WEEKDAY_LABELS, mondayFirstOffset } from './calendar/weekdays';
import { colors } from '../theme';
import { isSameDay, startOfDay } from '../utils/date';

interface DatePickerModalProps {
  visible: boolean;
  /** The currently chosen date, or `undefined` for "none yet". */
  value?: Date;
  /** Latest selectable day, inclusive. Days past it are shown but not pressable. */
  maximumDate?: Date;
  onSelect: (date: Date) => void;
  /** Omitted when there is nothing to clear — the footer control hides with it. */
  onClear?: () => void;
  onRequestClose: () => void;
  title?: string;
}

const firstOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const shiftMonth = (date: Date, by: number) =>
  new Date(date.getFullYear(), date.getMonth() + by, 1);
const monthTitle = (date: Date) =>
  date.toLocaleString('en-US', { month: 'long', year: 'numeric' });

/**
 * The app's date picker: a month grid in a `ModalShell`, hand-rolled rather than the
 * platform one.
 *
 * A custom grid is what lets both platforms behave identically, keeps the picker inside
 * the design system (the selected day is the same `blue-light`/black pair as a primary
 * button), and — the reason it exists at all — lets "no date" be a real state. The native
 * pickers have no such state: they open on *some* day and report it, so a field backed by
 * one acquires a value just for being looked at. Here today is only ever *marked*, and
 * nothing is chosen until a day is pressed.
 *
 * Monday-first, sharing `weekdays.ts` with the calendar tab so the two can't disagree
 * about which column a date falls in.
 */
const DatePickerModal = ({
  visible,
  value,
  maximumDate,
  onSelect,
  onClear,
  onRequestClose,
  title = 'Pick a date',
}: DatePickerModalProps) => {
  const today = startOfDay(new Date());
  const max = maximumDate ?? today;
  // The month to open on: the chosen date's, or today's — pulled back to the cap's month
  // if the cap is in the past, so the grid never opens with nothing selectable.
  const anchorMonth = () => firstOfMonth(value ?? (today > max ? max : today));
  const [month, setMonth] = useState(anchorMonth);

  // Re-anchor each time it opens: the month left behind by a previous visit is not where
  // the next one should start.
  useEffect(() => {
    if (visible) setMonth(anchorMonth());
    // Every value `anchorMonth` reads is a fresh object each render, so only `visible`
    // may drive this — anything else would reset the month mid-browse.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const weeks = useMemo(() => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const offset = mondayFirstOffset(year, monthIndex);
    const dayCount = new Date(year, monthIndex + 1, 0).getDate();
    // Leading blanks pad the month to its first weekday; trailing blanks fill the last
    // row so every week is seven cells wide.
    const cells: (Date | null)[] = [
      ...Array.from({ length: offset }, () => null),
      ...Array.from({ length: dayCount }, (_, i) => new Date(year, monthIndex, i + 1)),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    return Array.from({ length: cells.length / 7 }, (_, row) =>
      cells.slice(row * 7, row * 7 + 7)
    );
  }, [month]);

  const nextDisabled = firstOfMonth(max) <= month;

  return (
    <ModalShell
      visible={visible}
      onRequestClose={onRequestClose}
      title={title}
      footer={
        <>
          {onClear && <Button label='Clear' variant='grey' onPress={onClear} />}
          <Button label='Close' variant='secondary' onPress={onRequestClose} />
        </>
      }
    >
      <View className='mt-5 gap-2'>
        <View className='flex-row items-center justify-between'>
          <IconButton
            accessibilityLabel='Previous month'
            onPress={() => setMonth(shiftMonth(month, -1))}
            icon={
              <View className='rotate-180'>
                <ChevronRightIcon size={20} color={colors.ink} />
              </View>
            }
          />
          <Text className='font-nunito text-[16px] text-ink'>{monthTitle(month)}</Text>
          {/* Held rather than hidden, so the header doesn't reflow at the cap. */}
          <View className={nextDisabled ? 'opacity-30' : ''}>
            <IconButton
              accessibilityLabel='Next month'
              onPress={() => !nextDisabled && setMonth(shiftMonth(month, 1))}
              icon={<ChevronRightIcon size={20} color={colors.ink} />}
            />
          </View>
        </View>

        <View className='flex-row'>
          {WEEKDAY_LABELS.map(label => (
            <Text
              key={label}
              className='font-nunito flex-1 text-center text-[11px] text-ink-subtle'
            >
              {label.slice(0, 2)}
            </Text>
          ))}
        </View>

        {weeks.map((week, index) => (
          <View key={index} className='flex-row'>
            {week.map((date, cell) => {
              if (!date) return <View key={cell} className='flex-1' />;

              const disabled = date > max;
              const selected = !!value && isSameDay(date, value);
              const isToday = isSameDay(date, today);

              return (
                <Pressable
                  key={cell}
                  accessibilityRole='button'
                  accessibilityState={{ selected, disabled }}
                  accessibilityLabel={date.toDateString()}
                  disabled={disabled}
                  onPress={() => onSelect(date)}
                  className={`h-10 flex-1 items-center justify-center rounded-full ${
                    selected
                      ? 'bg-blue-light'
                      : isToday
                        ? 'bg-blue-lighter'
                        : disabled
                          ? ''
                          : 'hover:bg-grey-light'
                  }`}
                >
                  <Text
                    className={`font-nunito text-[14px] ${
                      selected || isToday
                        ? 'text-black'
                        : disabled
                          ? 'text-ink-subtle'
                          : 'text-ink'
                    }`}
                  >
                    {date.getDate()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </ModalShell>
  );
};

export default DatePickerModal;
