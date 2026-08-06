import { Text, TouchableOpacity } from 'react-native';

interface AddItemButtonProps {
  label: string;
  onPress: () => void;
}

/** "+ Add email" style control shown under each editable collection. */
const AddItemButton = ({ label, onPress }: AddItemButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} className='py-2 px-1 self-start'>
      <Text className='text-base text-blue-500'>+ {label}</Text>
    </TouchableOpacity>
  );
};

export default AddItemButton;
