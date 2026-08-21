import { Text, TextInput, View } from 'react-native';

import Avatar from '../Avatar';
import Card from '../Card';
import { colors } from '../../theme';
import { fullName } from '../../utils/string';
import { noFocusRing } from '../../utils/inputStyle';
import { useContactEditStore } from '../../stores/contactEditStore';

interface ProfileKeyDataCardProps {
  firstName: string;
  lastName: string;
  jobTitle: string;
  company: string;
  editable?: boolean;
}

/** The identity block at the top of a profile: avatar, name, role, company. */
const ProfileKeyDataCard = ({
  firstName,
  lastName,
  jobTitle,
  company,
  editable,
}: ProfileKeyDataCardProps) => {
  const working = useContactEditStore(s => s.workingContact);
  const updateField = useContactEditStore(s => s.updateField);

  return (
    <Card className='items-center p-6'>
      <Avatar
        firstName={editable ? working?.firstName : firstName}
        lastName={editable ? working?.lastName : lastName}
        size={72}
      />
      {editable ? (
        <View className='mt-4 w-full max-w-[320px] gap-1'>
          <View className='flex-row gap-2'>
            <TextInput
              value={working?.firstName ?? ''}
              onChangeText={text => updateField('firstName', text)}
              placeholder='First name'
              placeholderTextColor={colors.inkSubtle}
              className='min-w-0 flex-1 rounded-lg bg-surface-muted px-3 py-2 text-[17px] font-bold text-ink'
              style={noFocusRing}
            />
            <TextInput
              value={working?.lastName ?? ''}
              onChangeText={text => updateField('lastName', text)}
              placeholder='Last name'
              placeholderTextColor={colors.inkSubtle}
              className='min-w-0 flex-1 rounded-lg bg-surface-muted px-3 py-2 text-[17px] font-bold text-ink'
              style={noFocusRing}
            />
          </View>
          <TextInput
            value={working?.jobTitle ?? ''}
            onChangeText={text => updateField('jobTitle', text)}
            placeholder='Job title'
            placeholderTextColor={colors.inkSubtle}
            className='rounded-lg bg-surface-muted px-3 py-2 text-[14px] text-ink-muted'
            style={noFocusRing}
          />
          <TextInput
            value={working?.company ?? ''}
            onChangeText={text => updateField('company', text)}
            placeholder='Company'
            placeholderTextColor={colors.inkSubtle}
            className='rounded-lg bg-surface-muted px-3 py-2 text-[14px] text-ink-muted'
            style={noFocusRing}
          />
        </View>
      ) : (
        <View className='mt-4 items-center'>
          <Text className='text-[20px] font-bold text-ink'>
            {fullName(firstName, lastName) || 'Unnamed contact'}
          </Text>
          {jobTitle ? (
            <Text className='mt-0.5 text-[14px] text-ink-muted'>{jobTitle}</Text>
          ) : null}
          {company ? (
            <Text className='mt-0.5 text-[14px] text-ink-muted'>{company}</Text>
          ) : null}
        </View>
      )}
    </Card>
  );
};

export default ProfileKeyDataCard;
