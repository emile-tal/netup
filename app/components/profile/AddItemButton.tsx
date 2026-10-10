import { Pressable, Text } from 'react-native';

interface AddItemButtonProps {
  label: string;
  onPress: () => void;
}

/** "+ Add email" style control shown under each editable collection. */
const AddItemButton = ({ label, onPress }: AddItemButtonProps) => {
  return (
    <Pressable
      accessibilityRole='button'
      onPress={onPress}
      className='self-start rounded-lg px-4 py-2 hover:bg-surface-sunken'
    >
      <Text className='font-nunito text-[14px] text-brand'>+ {label}</Text>
    </Pressable>
  );
};

export default AddItemButton;
