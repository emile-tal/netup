import { Circle, Ellipse, Line, Svg } from 'react-native-svg';

import { colors } from '../theme';

interface LogoProps {
  size?: number;
}

/** The NetUp mark: three linked nodes. Fixed brand colours, so it takes no `color`. */
const Logo = ({ size = 28 }: LogoProps) => {
  return (
    <Svg width={size} height={size} viewBox='0 0 32 32' fill='none'>
      {/* Three nodes in the three circle colours — the mark is the 5-15-50 idea. */}
      <Circle cx='22' cy='7' r='5' fill={colors.tierStrategic} />
      <Circle cx='8' cy='12' r='5' fill={colors.tierTrusted} />
      <Line
        x1='22'
        y1='7'
        x2='14'
        y2='20'
        stroke={colors.inkSubtle}
        strokeWidth='2'
        strokeLinecap='round'
      />
      <Line
        x1='8'
        y1='12'
        x2='14'
        y2='20'
        stroke={colors.inkSubtle}
        strokeWidth='2'
        strokeLinecap='round'
      />
      <Circle cx='14' cy='21' r='5' fill={colors.brand} />
      <Ellipse cx='14' cy='29' rx='7' ry='3' fill={colors.brand} opacity='0.25' />
    </Svg>
  );
};

export default Logo;
