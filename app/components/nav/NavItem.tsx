import { Pressable, Text } from 'react-native';

interface NavItemProps {
  label: string;
  icon: React.ReactNode;
  focused: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  /** `row` is the desktop rail (icon beside label), `column` the bottom bar. */
  orientation: 'row' | 'column';
}

/**
 * One destination, shared by the side rail and the bottom tab bar.
 *
 * **The active destination is a primary button**, and it is drawn exactly like one: the
 * `blue-light` fill deepening to `blue` on hover (see `Button`'s `primary`). The fill is
 * on the pressable itself in *both* orientations, so on the bottom bar it wraps the icon
 * and the label together as one control rather than tinting a disc behind the icon.
 *
 * The label and icon are black in both states, so a destination doesn't change colour as
 * you move between tabs — the fill is the only thing that moves.
 */
const NavItem = ({
  label,
  icon,
  focused,
  onPress,
  onLongPress,
  orientation,
}: NavItemProps) => {
  const isRow = orientation === 'row';

  return (
    <Pressable
      accessibilityRole='button'
      accessibilityState={focused ? { selected: true } : {}}
      accessibilityLabel={label}
      onPress={onPress}
      onLongPress={onLongPress}
      className={`rounded-xl ${
        isRow
          ? 'flex-row items-center gap-3 px-3 py-2.5'
          : 'flex-1 items-center justify-center gap-1 px-2 py-2'
      } ${focused ? 'bg-blue-light hover:bg-blue' : 'hover:bg-grey-light'}`}
    >
      {icon}
      <Text
        numberOfLines={1}
        className={`font-nunito-medium text-black ${isRow ? 'text-[14px]' : 'text-[11px]'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
};

export default NavItem;
