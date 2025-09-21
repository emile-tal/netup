import { TextInput, View } from 'react-native';

import { Reminder } from '../../types/reminders';
import { useState } from 'react';

interface AgendaItemProps {
  item: Reminder;
}

const AgendaItem = ({ item }: AgendaItemProps) => {
  const [title, setTitle] = useState(item.title);

  const updateTitle = (text: string) => {
    setTitle(text);
    //TODO: Update reminder title backend/database
  };

  return (
    <View className='p-2 w-full border-b border-gray-200'>
      <TextInput
        className='border-0 text-base'
        value={title}
        onChangeText={updateTitle}
      />
    </View>
  );
};

export default AgendaItem;
