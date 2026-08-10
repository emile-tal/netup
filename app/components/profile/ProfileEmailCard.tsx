import { Text, TextInput } from 'react-native';

import CardRow from './CardRow';
import { Email } from '../../types/contacts';
import { colors } from '../../theme';
import { noFocusRing } from '../../utils/inputStyle';
import { useContactEditStore } from '../../stores/contactEditStore';

interface ProfileEmailCardProps {
  email: Email;
  editable?: boolean;
}

const ProfileEmailCard = ({ email, editable }: ProfileEmailCardProps) => {
  const updateItem = useContactEditStore(s => s.updateItem);
  const removeItem = useContactEditStore(s => s.removeItem);

  if (!editable) {
    return (
      <CardRow label={email.label}>
        <Text className='text-[15px] text-ink'>{email.email}</Text>
      </CardRow>
    );
  }

  return (
    <CardRow
      label={email.label}
      onLabelChange={label => updateItem('emails', email.id, { label })}
      onRemove={() => removeItem('emails', email.id)}
    >
      <TextInput
        value={email.email}
        onChangeText={value => updateItem('emails', email.id, { email: value })}
        placeholder='name@example.com'
        placeholderTextColor={colors.inkSubtle}
        keyboardType='email-address'
        autoCapitalize='none'
        className='rounded-lg bg-surface-muted px-2 py-1.5 text-[15px] text-ink'
        style={noFocusRing}
      />
    </CardRow>
  );
};

export default ProfileEmailCard;
