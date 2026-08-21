import { Text, View } from 'react-native';
import { fullName, initials } from '../utils/string';

import { avatarColor } from '../utils/avatar';

interface AvatarProps {
  firstName?: string;
  lastName?: string;
  /** Diameter in px. Text scales with it so one component covers list rows and headers. */
  size?: number;
}

/** Initials circle in a tint derived from the name. Used wherever a contact is shown. */
const Avatar = ({ firstName, lastName, size = 40 }: AvatarProps) => {
  const name = fullName(firstName, lastName);
  const tint = avatarColor(name);

  return (
    <View
      className='items-center justify-center'
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: tint.bg,
      }}
    >
      <Text
        className='font-semibold'
        style={{ fontSize: Math.round(size * 0.36), color: tint.fg }}
      >
        {initials(firstName, lastName)}
      </Text>
    </View>
  );
};

export default Avatar;
