import { Pressable, Text } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  /** Stretches to fill its row instead of hugging its label. */
  fullWidth?: boolean;
}

// Pill buttons, one entry per variant so call sites pick a role rather than a colour.
const containerStyles: Record<ButtonVariant, string> = {
  primary: 'bg-brand hover:bg-brand-dark',
  secondary: 'bg-surface-sunken hover:bg-line',
  ghost: 'bg-transparent hover:bg-surface-sunken',
  danger: 'bg-danger-light hover:bg-danger-light',
};

const labelStyles: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-ink',
  ghost: 'text-ink-muted',
  danger: 'text-danger',
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
      <Text className={`text-[14px] font-semibold ${labelStyles[variant]}`}>{label}</Text>
    </Pressable>
  );
};

export default Button;
