import { Pressable, Text, View } from 'react-native';

export interface PickerGridOption {
  key: string | number;
  label: string;
  accessibilityLabel?: string;
  selected?: boolean;
  /** Marked like today in the day grid — the current month or year. */
  current?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

interface PickerGridProps {
  options: PickerGridOption[];
  /** Cells per row. */
  columns?: number;
}

/**
 * The month and year views of `DatePickerModal`: a grid of pill cells in the same three
 * states as the day grid — selected is the `blue-light` + black pair, current is the
 * `blue-lighter` wash, past the cap is dimmed and inert.
 */
const PickerGrid = ({ options, columns = 3 }: PickerGridProps) => {
  const rows = Array.from({ length: Math.ceil(options.length / columns) }, (_, row) =>
    options.slice(row * columns, row * columns + columns)
  );

  return (
    <View className='gap-1'>
      {rows.map((row, index) => (
        <View key={index} className='flex-row gap-1'>
          {row.map(option => (
            <Pressable
              key={option.key}
              accessibilityRole='button'
              accessibilityLabel={option.accessibilityLabel ?? option.label}
              accessibilityState={{ selected: !!option.selected, disabled: !!option.disabled }}
              disabled={option.disabled}
              onPress={option.onPress}
              className={`h-12 flex-1 items-center justify-center rounded-full ${
                option.selected
                  ? 'bg-blue-light'
                  : option.current
                    ? 'bg-blue-lighter'
                    : option.disabled
                      ? ''
                      : 'hover:bg-grey-light'
              }`}
            >
              <Text
                className={`font-nunito text-[14px] ${
                  option.selected || option.current
                    ? 'text-black'
                    : option.disabled
                      ? 'text-ink-subtle'
                      : 'text-ink'
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
          {/* Pads a short last row so its cells keep the same width as the rest. */}
          {Array.from({ length: columns - row.length }, (_, pad) => (
            <View key={`pad-${pad}`} className='flex-1' />
          ))}
        </View>
      ))}
    </View>
  );
};

export default PickerGrid;
