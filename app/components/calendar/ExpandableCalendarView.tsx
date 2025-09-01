import React, { useCallback, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import {
  AgendaList,
  CalendarProvider,
  DateData,
  ExpandableCalendar,
  WeekCalendar,
} from 'react-native-calendars';

import useCalendarStore from '@/app/stores/calendarStore';

interface Props {
  weekView?: boolean;
  onDateChanged: (date: DateData, updateSource: any) => void;
}
const ExpandableCalendarScreen = ({ weekView, onDateChanged }: Props) => {
  const reminders = useCalendarStore(state => state.reminders);
  const setAgendaStartDate = useCalendarStore(state => state.setAgendaStartDate);
  const setAgendaEndDate = useCalendarStore(state => state.setAgendaEndDate);
  const agendaStartDate = useCalendarStore(state => state.agendaStartDate);
  const agendaEndDate = useCalendarStore(state => state.agendaEndDate);
  const selectedDate = useCalendarStore(state => state.selectedDate);
  //   const marked = useRef(getMarkedDates());

  const agendaItems = reminders.filter(reminder => {
    const reminderDate = new Date(reminder.date);
    return reminderDate >= agendaStartDate && reminderDate <= agendaEndDate;
  });

  // const onDateChanged = useCallback((date, updateSource) => {
  //   console.log('ExpandableCalendarScreen onDateChanged: ', date, updateSource);
  // }, []);

  // const onMonthChange = useCallback(({dateString}) => {
  //   console.log('ExpandableCalendarScreen onMonthChange: ', dateString);
  // }, []);

  const renderItem = useCallback(({ item }: { item: any }) => {
    return (
      <View>
        <Text>Reach out to {item.contactId}</Text>
      </View>
    );
  }, []);

  const calendarRef = useRef<{ toggleCalendarPosition: () => boolean }>(null);
  const rotation = useRef(new Animated.Value(0));

  const toggleCalendarExpansion = useCallback(() => {
    const isOpen = calendarRef.current?.toggleCalendarPosition();
    Animated.timing(rotation.current, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  }, []);

  //   const renderHeader = useCallback(
  //     (date?: XDate) => {
  //       const rotationInDegrees = rotation.current.interpolate({
  //         inputRange: [0, 1],
  //         outputRange: ['0deg', '-180deg'],
  //       });
  //       return (
  //         <TouchableOpacity style={styles.header} onPress={toggleCalendarExpansion}>
  //           <Text style={styles.headerTitle}>{date?.toString('MMMM yyyy')}</Text>
  //           <Animated.Image
  //             source={CHEVRON}
  //             style={{ transform: [{ rotate: '90deg' }, { rotate: rotationInDegrees }] }}
  //           />
  //         </TouchableOpacity>
  //       );
  //     },
  //     [toggleCalendarExpansion]
  //   );

  const onCalendarToggled = useCallback(
    (isOpen: boolean) => {
      rotation.current.setValue(isOpen ? 1 : 0);
    },
    [rotation]
  );

  const onDayPress = useCallback(
    (date: DateData) => {
      onDateChanged(date, 'dayPress');
    },

    [onDateChanged]
  );

  const getInitialDate = () => {
    return selectedDate.toISOString().split('T')[0];
  };

  return (
    <View style={{ flex: 1 }}>
      <CalendarProvider
        date={getInitialDate()}
        onDateChanged={(date, updateSource) =>
          onDateChanged(date as unknown as DateData, updateSource)
        }
        // onMonthChange={onMonthChange}
        showTodayButton
        // disabledOpacity={0.6}
        // todayBottomMargin={16}
        // disableAutoDaySelection={[ExpandableCalendar.navigationTypes.MONTH_SCROLL, ExpandableCalendar.navigationTypes.MONTH_ARROWS]}
      >
        {weekView ? (
          <WeekCalendar
            //   testID={testIDs.weekCalendar.CONTAINER}
            firstDay={1}
            //   markedDates={marked.current}
          />
        ) : (
          <ExpandableCalendar
            //   testID={testIDs.expandableCalendar.CONTAINER}
            //   renderHeader={renderHeader}
            ref={calendarRef}
            onCalendarToggled={onCalendarToggled}
            horizontal={false}
            onDayPress={onDayPress}
            // hideArrows
            // disablePan
            // hideKnob
            // initialPosition={ExpandableCalendar.positions.OPEN}
            // calendarStyle={styles.calendar}
            // headerStyle={styles.header} // for horizontal only
            // disableWeekScroll
            //   theme={theme.current}
            // disableAllTouchEventsForDisabledDays
            firstDay={1}
            //   markedDates={marked.current}
            //   leftArrowImageSource={leftArrowIcon}
            //   rightArrowImageSource={rightArrowIcon}
            // animateScroll
            // closeOnDayPress={false}
          />
        )}
        <View style={{ flex: 1 }}>
          <AgendaList
            sections={agendaItems.map(reminder => ({
              data: [reminder],
              title: reminder.date.toISOString(),
            }))}
            renderItem={renderItem}
            // scrollToNextEvent
            // sectionStyle={styles.section}
            // dayFormat={'yyyy-MM-d'}
          />
        </View>
      </CalendarProvider>
    </View>
  );
};

export default ExpandableCalendarScreen;
