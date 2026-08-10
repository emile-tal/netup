import { Pressable, Text, View } from 'react-native';

interface NavItemProps {
  label: string;
  icon: React.ReactNode;
  focused: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  /** `row` is the desktop rail (icon beside label), `column` the bottom bar. */
  orientation: 'row' | 'column';
}

/** One destination, shared by the side rail and the bottom tab bar. */
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
      className={
        isRow
          ? `flex-row items-center gap-3 rounded-xl px-3 py-2.5 ${
              focused ? 'bg-brand-light' : 'hover:bg-surface-sunken'
            }`
          : 'flex-1 items-center justify-center gap-1 py-1.5'
      }
    >
      <View className={focused && !isRow ? 'rounded-full bg-brand-light px-5 py-1' : ''}>
        {icon}
      </View>
      <Text
        numberOfLines={1}
        className={`${isRow ? 'text-[14px]' : 'text-[11px]'} ${
          focused ? 'font-semibold text-brand-dark' : 'font-normal text-ink-muted'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
};

export default NavItem;
