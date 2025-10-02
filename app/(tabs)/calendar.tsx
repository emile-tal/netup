import { SafeAreaView } from 'react-native';
import InfiniteListCalendar from '../components/calendar/InfiniteListCalendar';

const CalendarPage = () => {
  // const [year, setYear] = useState(new Date().getFullYear());
  // const [month, setMonth] = useState(new Date().getMonth());

  // const maxYear = 2050;
  // const minYear = 2000;

  // const years = useMemo(
  //   () => Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i),
  //   [minYear, maxYear]
  // );
  // const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);

  // const getItemLayout = (data: any, index: number) => ({});

  return (
    <SafeAreaView>
      <InfiniteListCalendar />
      {/* <View className='px-4'>
        <FlatList
          data={months}
          renderItem={({ item }) => <MonthView month={item} year={year} />}
          keyExtractor={item => item.toString()}
        />
        <MonthView month={month} year={year} />
      </View> */}
    </SafeAreaView>
  );
};

export default CalendarPage;
