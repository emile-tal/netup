import { View } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  /** Extra classes for spacing/layout on the card itself. */
  className?: string;
  /** Turns off the built-in padding when the content manages its own (e.g. list rows). */
  flush?: boolean;
}

/** The app's one surface panel: white, hairline border, generous radius. */
const Card = ({ children, className = '', flush }: CardProps) => {
  return (
    <View
      className={`w-full overflow-hidden rounded-2xl border border-line bg-surface ${
        flush ? '' : 'p-4'
      } ${className}`}
    >
      {children}
    </View>
  );
};

export default Card;
