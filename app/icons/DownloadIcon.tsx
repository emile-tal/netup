import { DEFAULT_ICON_COLOR, DEFAULT_ICON_SIZE, IconProps } from './types';
import { Path, Svg } from 'react-native-svg';

const DownloadIcon = ({
  color = DEFAULT_ICON_COLOR,
  size = DEFAULT_ICON_SIZE,
}: IconProps) => {
  return (
    <Svg height={size} width={size} viewBox='0 -960 960 960' fill={color}>
      <Path d='M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z' />
    </Svg>
  );
};

export default DownloadIcon;
