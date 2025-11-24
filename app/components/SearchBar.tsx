import { TextInput, View } from 'react-native';

import SearchIcon from '../icons/SearchIcon';

interface SearchBarProps {
  onChangeText: (text: string) => void;
  value: string;
}

const SearchBar = ({ onChangeText, value }: SearchBarProps) => {
  return (
    <View className='flex-row items-center gap-2 rounded-xl bg-gray-200 p-2 w-full'>
      <SearchIcon cssClass='fill-gray' />
      <TextInput
        className='w-full text-gray-400'
        placeholder='Search'
        placeholderTextColor='gray-400'
        onChangeText={onChangeText}
        value={value}
      />
    </View>
  );
};

export default SearchBar;
