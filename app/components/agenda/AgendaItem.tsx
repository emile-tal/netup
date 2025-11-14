import { TextInput, TouchableOpacity, View } from 'react-native';

import { Reminder } from '../../types/reminders';
import { useState } from 'react';

interface AgendaItemProps {
  item: Reminder;
}

const AgendaItem = ({ item }: AgendaItemProps) => {
  const [title, setTitle] = useState(item.title);
  const [isCompleted, setIsCompleted] = useState(false);

  const updateTitle = (text: string) => {
    setTitle(text);
    //TODO: Update reminder title backend/database
  };

  const toggleCompleted = () => {
    setIsCompleted(!isCompleted);
    //TODO: Update reminder completed status backend/database
  };

  return (
    <View className='flex-row items-center w-full bg-white border-b border-gray-200'>
      <TouchableOpacity
        onPress={toggleCompleted}
        className='w-6 h-6 mr-3 ml-4 justify-center items-center'
      >
        <View
          className={`w-5 h-5 rounded-full border-2 ${
            isCompleted ? 'bg-black border-black' : 'border-gray-400'
          } justify-center items-center`}
        >
          {isCompleted && <View className='w-2 h-2 rounded-full bg-white' />}
        </View>
      </TouchableOpacity>
      <TextInput
        className='flex-1 py-3 pr-4 text-base text-black'
        value={title}
        onChangeText={updateTitle}
        placeholderTextColor='#9CA3AF'
        multiline
        style={{
          textDecorationLine: isCompleted ? 'line-through' : 'none',
          opacity: isCompleted ? 0.5 : 1,
        }}
      />
    </View>
  );
};

export default AgendaItem;
