import { Pressable } from 'react-native';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  /** Fills the button with the brand colour — for the one primary action in a header. */
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
        emphasis === 'brand' ? 'bg-brand hover:bg-brand-dark' : 'hover:bg-surface-sunken'
      }`}
    >
      {icon}
    </Pressable>
  );
};

export default IconButton;
