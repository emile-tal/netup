import { DEFAULT_ICON_COLOR, DEFAULT_ICON_SIZE, IconProps } from './types';
import { Path, Svg } from 'react-native-svg';

const CheckIcon = ({ color = DEFAULT_ICON_COLOR, size = DEFAULT_ICON_SIZE }: IconProps) => {
  return (
    <Svg height={size} width={size} viewBox='0 -960 960 960' fill={color}>
      <Path d='m382-354 339-339q12-12 28-12t28 12q12 12 12 28.5T777-636L410-268q-12 12-28 12t-28-12L182-440q-12-12-11.5-28.5T183-497q12-12 28.5-12t28.5 12l142 143Z' />
    </Svg>
  );
};

export default CheckIcon;
