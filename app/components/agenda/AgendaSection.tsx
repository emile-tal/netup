import { Fragment } from 'react';
import { Text, View } from 'react-native';

import AgendaItem from './AgendaItem';
import Card from '../Card';
import { ReminderSection } from '../../utils/reminders';

interface AgendaSectionProps {
  section: ReminderSection;
}

/** One day's worth of reminders: a date heading above a single card of rows. */
const AgendaSection = ({ section }: AgendaSectionProps) => {
  return (
    <View className='mb-5'>
      <Text className='mb-2 px-1 text-[12px] font-semibold uppercase tracking-wider text-ink-subtle'>
        {section.title}
      </Text>
      <Card flush>
        {section.items.map((item, index) => (
          <Fragment key={item.id}>
            {index > 0 && <View className='ml-12 h-[1px] bg-line' />}
            <AgendaItem item={item} />
          </Fragment>
        ))}
      </Card>
    </View>
  );
};

export default AgendaSection;
