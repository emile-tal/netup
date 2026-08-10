import { DEFAULT_ICON_COLOR, DEFAULT_ICON_SIZE, IconProps } from './types';
import { Path, Svg } from 'react-native-svg';

const ChevronRightIcon = ({
  color = DEFAULT_ICON_COLOR,
  size = DEFAULT_ICON_SIZE,
}: IconProps) => {
  return (
    <Svg height={size} width={size} viewBox='0 -960 960 960' fill={color}>
      <Path d='M521-480 320-681q-11-11-11-28t11-28q11-11 28-11t28 11l229 229q6 6 8.5 13t2.5 15q0 8-2.5 15t-8.5 13L376-223q-11 11-28 11t-28-11q-11-11-11-28t11-28l201-201Z' />
    </Svg>
  );
};

export default ChevronRightIcon;
