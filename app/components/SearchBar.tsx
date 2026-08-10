import { Pressable, TextInput, View } from 'react-native';

import SearchIcon from '../icons/SearchIcon';
import XIcon from '../icons/XIcon';
import { colors } from '../theme';
import { noFocusRing } from '../utils/inputStyle';

interface SearchBarProps {
  onChangeText: (text: string) => void;
  value: string;
  placeholder?: string;
}

const SearchBar = ({ onChangeText, value, placeholder = 'Search' }: SearchBarProps) => {
  return (
    <View className='w-full flex-row items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5'>
      <SearchIcon size={18} color={colors.inkSubtle} />
      <TextInput
        className='flex-1 text-[15px] text-ink'
        placeholder={placeholder}
        placeholderTextColor={colors.inkSubtle}
        onChangeText={onChangeText}
        value={value}
        autoCapitalize='none'
        autoCorrect={false}
        returnKeyType='search'
        style={noFocusRing}
      />
      {value.length > 0 && (
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Clear search'
          onPress={() => onChangeText('')}
          className='h-5 w-5 items-center justify-center rounded-full'
        >
          <XIcon size={16} color={colors.inkSubtle} />
        </Pressable>
      )}
    </View>
  );
};

export default SearchBar;
