import { TextInput, View } from 'react-native';

import SearchIcon from '../icons/SearchIcon';

const SearchBar = () => {
  return (
    <View className='flex-row items-center gap-2 rounded-full bg-gray-200 p-2 w-full ml-4 mr-4'>
      <SearchIcon cssClass='fill-gray' />
      <TextInput
        className='w-full text-gray-400'
        placeholder='Search'
        placeholderTextColor='gray-400'
      />
    </View>
  );
};

export default SearchBar;
