import { Text, TextInput } from 'react-native';

import CardRow from './CardRow';
import { Email } from '../../types/contacts';
import { colors } from '../../theme';
import { noFocusRing } from '../../utils/inputStyle';
import { isRemovableItem, useContactEditStore } from '../../stores/contactEditStore';

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
        <Text className='font-nunito text-[15px] text-ink'>{email.email}</Text>
      </CardRow>
    );
  }

  return (
    <CardRow
      label={email.label}
      onLabelChange={label => updateItem('emails', email.id, { label })}
      // No remove control until the row holds an address: the trailing blank row is the
      // form's "add another" affordance, so deleting it would delete the control itself.
      // Removing the only filled row leaves that blank row behind (see the store's
      // `withTrailingBlanks`), which is exactly the empty input to type the next one in.
      onRemove={
        isRemovableItem('emails', email)
          ? () => removeItem('emails', email.id)
          : undefined
      }
    >
      <TextInput
        value={email.email}
        onChangeText={value => updateItem('emails', email.id, { email: value })}
        placeholder='name@example.com'
        placeholderTextColor={colors.inkSubtle}
        keyboardType='email-address'
        autoCapitalize='none'
        className='font-nunito rounded-lg bg-surface-muted px-2 py-1.5 text-[15px] text-ink'
        style={noFocusRing}
      />
    </CardRow>
  );
};

export default ProfileEmailCard;
