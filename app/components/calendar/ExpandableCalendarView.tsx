import {
  AgendaList,
  CalendarProvider,
  ExpandableCalendar,
  WeekCalendar,
} from 'react-native-calendars';
import { Animated, Easing, Text, View } from 'react-native';
import React, { useCallback, useRef } from 'react';

import { myRemindersData } from '@/app/placeholderData';

interface Props {
  weekView?: boolean;
}
const ExpandableCalendarScreen = (props: Props) => {
  const reminders = myRemindersData;
  const { weekView } = props;
  //   const marked = useRef(getMarkedDates());
  //   const theme = useRef(getTheme());
  const todayBtnTheme = useRef({
    todayButtonTextColor: 'red',
  });

  const mockAgendaItems = reminders.map(reminder => ({
    data: [{ title: `Reach out to ${reminder.contactId}` }],
    title: reminder.date.toISOString(),
  }));

  // const onDateChanged = useCallback((date, updateSource) => {
  //   console.log('ExpandableCalendarScreen onDateChanged: ', date, updateSource);
  // }, []);

  // const onMonthChange = useCallback(({dateString}) => {
  //   console.log('ExpandableCalendarScreen onMonthChange: ', dateString);
  // }, []);

  const getInitialDate = () => {
    if (reminders.length > 0) {
      return reminders[0].date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    }
    return new Date().toISOString().split('T')[0]; // Fallback to today
  };

  const renderItem = useCallback(({ item }: { item: any }) => {
    return (
      <View>
        <Text>{item.hour}</Text>
        <View>
          <Text>{item.title}</Text>
          {item.description && <Text>{item.description}</Text>}
        </View>
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

  return (
    <View style={{ flex: 1 }}>
      <CalendarProvider
        date={getInitialDate()}
        // onDateChanged={onDateChanged}
        // onMonthChange={onMonthChange}
        showTodayButton
        // disabledOpacity={0.6}
        theme={todayBtnTheme.current}
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
            sections={mockAgendaItems}
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
