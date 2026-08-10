import { DEFAULT_ICON_COLOR, DEFAULT_ICON_SIZE, IconProps } from './types';
import { Path, Svg } from 'react-native-svg';

/** Three stacked columns — the 5-15-50 board. */
const NetworkIcon = ({
  color = DEFAULT_ICON_COLOR,
  size = DEFAULT_ICON_SIZE,
}: IconProps) => {
  return (
    <Svg height={size} width={size} viewBox='0 -960 960 960' fill={color}>
      <Path d='M120-160v-640h200v640H120Zm260 0v-640h200v640H380Zm260 0v-640h200v640H640ZM180-220h80v-520h-80v520Zm260 0h80v-520h-80v520Zm260 0h80v-520h-80v520ZM180-740h80-80Zm260 0h80-80Zm260 0h80-80Z' />
    </Svg>
  );
};

export default NetworkIcon;
