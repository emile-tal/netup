import { Text, View } from 'react-native';
import { fullName, initials } from '../utils/string';

import { avatarColor } from '../utils/avatar';

interface AvatarProps {
  firstName?: string;
  lastName?: string;
  /** Diameter in px. Text scales with it so one component covers list rows and headers. */
  size?: number;
}

/** Initials circle in a colour derived from the name. Used wherever a contact is shown. */
const Avatar = ({ firstName, lastName, size = 40 }: AvatarProps) => {
  const name = fullName(firstName, lastName);

  return (
    <View
      className='items-center justify-center'
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: avatarColor(name),
      }}
    >
      <Text
        className='font-semibold text-white'
        style={{ fontSize: Math.round(size * 0.36) }}
      >
        {initials(firstName, lastName)}
      </Text>
    </View>
  );
};

export default Avatar;
