import { Circle, Line, Svg } from 'react-native-svg';
import { DEFAULT_ICON_COLOR, DEFAULT_ICON_SIZE, IconProps } from './types';

/** Three sliders — settings, without the gear's fussy geometry at 20px. */
const SettingsIcon = ({
  color = DEFAULT_ICON_COLOR,
  size = DEFAULT_ICON_SIZE,
}: IconProps) => {
  return (
    <Svg height={size} width={size} viewBox='0 0 24 24' fill='none'>
      <Line
        x1='3'
        y1='7'
        x2='21'
        y2='7'
        stroke={color}
        strokeWidth='2'
        strokeLinecap='round'
      />
      <Line
        x1='3'
        y1='12'
        x2='21'
        y2='12'
        stroke={color}
        strokeWidth='2'
        strokeLinecap='round'
      />
      <Line
        x1='3'
        y1='17'
        x2='21'
        y2='17'
        stroke={color}
        strokeWidth='2'
        strokeLinecap='round'
      />
      {/* Knobs offset from one another so the row reads as adjustable, not as a menu. */}
      <Circle cx='8' cy='7' r='2.6' fill={color} />
      <Circle cx='16' cy='12' r='2.6' fill={color} />
      <Circle cx='10' cy='17' r='2.6' fill={color} />
    </Svg>
  );
};

export default SettingsIcon;
