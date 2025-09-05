// DateTimeWheel.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import Wheel from './Wheel';

type Props = {
  value?: Date; // default = now
  onChange: (d: Date) => void; // emits a JS Date in device tz (see note below)
  minYear?: number;
  maxYear?: number;
};

const DateWheel = ({
  value = new Date(),
  onChange,
  minYear = 1920,
  maxYear = 2050,
}: Props) => {
  // break the incoming date into parts
  const [year, setYear] = useState(value.getFullYear());
  const [month, setMonth] = useState(value.getMonth()); // 0-11
  const [day, setDay] = useState(value.getDate()); // 1-31

  const daysInMonth = useMemo(
    () => new Date(year, month + 1, 0).getDate(),
    [year, month]
  );

  useEffect(() => {
    if (day > daysInMonth) setDay(daysInMonth);
  }, [daysInMonth, day]);

  useEffect(() => {
    const next = new Date(year, month, day);
    onChange(next);
  }, [year, month, day, onChange]);

  const years = useMemo(
    () => Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i),
    [minYear, maxYear]
  );
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);
  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth]
  );

  return (
    <View className='flex-row gap-4 items-center'>
      <Wheel
        data={days}
        getLabel={d => String(d)}
        selectedIndex={day - 1}
        onChange={i => setDay(i + 1)}
        containerClassName='flex-[1] min-w-[70px]'
      />
      <Wheel
        data={months}
        getLabel={m =>
          new Date(2000, m as number, 1).toLocaleString(undefined, { month: 'short' })
        }
        selectedIndex={month}
        onChange={i => setMonth(i)}
        containerClassName='flex-[1] min-w-[70px]'
      />
      <Wheel
        data={years}
        getLabel={y => String(y)}
        selectedIndex={years.indexOf(year)}
        onChange={i => setYear(years[i])}
        containerClassName='flex-[1.2] min-w-[90px]'
      />
    </View>
  );
};

const styles = StyleSheet.create({
  col: { flex: 1, minWidth: 70 },
  colWide: { flex: 1.2, minWidth: 90 },
});

export default DateWheel;
