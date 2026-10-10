import { Pressable } from 'react-native';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  /**
   * Fills the button with the accent blue — the one primary action in a header. Same fill
   * and hover as `Button`'s `primary`, since it is the same role; the icon passed in must
   * be black, like every other ink on a coloured fill.
   */
  emphasis?: 'plain' | 'brand';
}

/** Circular tap target for a bare icon. Used by headers and inline row actions. */
const IconButton = ({
  icon,
  onPress,
  accessibilityLabel,
  emphasis = 'plain',
}: IconButtonProps) => {
  return (
    <Pressable
      accessibilityRole='button'
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className={`h-10 w-10 items-center justify-center rounded-full ${
        emphasis === 'brand' ? 'bg-blue-light hover:bg-blue' : 'hover:bg-grey-light'
      }`}
    >
      {icon}
    </Pressable>
  );
};

export default IconButton;
