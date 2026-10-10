import { Pressable, Text } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'grey' | 'destructive';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  /** Stretches to fill its row instead of hugging its label. */
  fullWidth?: boolean;
}

// Pill buttons, one entry per variant so call sites pick a role rather than a colour.
//
// Both coloured fills carry **black** ink, and the hover step is whichever neighbour
// keeps that above 4.5:1. The primary action sits on `blue-light` (black 7.71:1) rather
// than the full `blue` (4.66:1 — legal, but the label works for it) and deepens to the
// brand value on hover; `error` is already light enough, so it goes lighter still.
const containerStyles: Record<ButtonVariant, string> = {
  primary: 'bg-blue-light hover:bg-blue',
  secondary: 'bg-grey-light hover:bg-grey',
  // No background and no border at rest: the grey only appears under the cursor.
  grey: 'bg-transparent hover:bg-grey-light',
  destructive: 'bg-error hover:bg-error-light',
};

const labelStyles: Record<ButtonVariant, string> = {
  primary: 'text-black',
  secondary: 'text-ink',
  grey: 'text-ink',
  destructive: 'text-black',
};

const Button = ({
  label,
  onPress,
  variant = 'primary',
  disabled,
  fullWidth,
}: ButtonProps) => {
  return (
    <Pressable
      accessibilityRole='button'
      onPress={onPress}
      disabled={disabled}
      className={`items-center justify-center rounded-full px-5 py-2.5 ${
        containerStyles[variant]
      } ${fullWidth ? 'w-full' : 'self-start'} ${disabled ? 'opacity-50' : ''}`}
    >
      <Text className={`font-nunito-medium text-[14px] ${labelStyles[variant]}`}>{label}</Text>
    </Pressable>
  );
};

export default Button;
