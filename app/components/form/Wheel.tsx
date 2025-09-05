import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  View,
} from 'react-native';

type WheelProps<T> = {
  data: T[];
  getLabel: (item: T, index: number) => string;
  selectedIndex: number;
  onChange: (index: number) => void;
  containerClassName?: string;
};

const Wheel = <T,>({
  data,
  getLabel,
  selectedIndex,
  onChange,
  containerClassName,
}: WheelProps<T>) => {
  const listRef = useRef<FlatList<T>>(null);
  const itemHeight = 32;
  const visibleRows = 3;

  const halfPadding = useMemo(
    () => ((visibleRows - 1) / 2) * itemHeight,
    [visibleRows, itemHeight]
  );

  // scroll to the selected index on mount/prop changes (controlled component)
  useEffect(() => {
    const offset = selectedIndex * itemHeight;
    listRef.current?.scrollToOffset({ offset, animated: false });
  }, [selectedIndex, itemHeight]);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const index = Math.round(y / itemHeight);
      if (index !== selectedIndex) onChange(index);
      // nudge to exact snap position if slightly off
      listRef.current?.scrollToOffset({ offset: index * itemHeight, animated: true });
    },
    [itemHeight, onChange, selectedIndex]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: T; index: number }) => {
      const isSelected = index === selectedIndex;
      return (
        <View className='justify-center items-center' style={{ height: itemHeight }}>
          <Text
            className={`text-sm text-black opacity-65 ${isSelected && 'font-semibold text-[16px] opacity-100'}`}
            accessibilityRole='text'
            accessibilityState={{ selected: isSelected }}
            accessible
          >
            {getLabel(item, index)}
          </Text>
        </View>
      );
    },
    [itemHeight, selectedIndex, getLabel]
  );

  return (
    <View
      className={`relative overflow-hidde ${containerClassName}`}
      style={{ height: itemHeight * visibleRows }}
    >
      <View
        pointerEvents='none'
        className='absolute left-0 right-0 border-width-1 border-color-black bg-rgba-0-0-0-0.03 rounded-8'
        style={{ top: halfPadding, height: itemHeight }}
        accessibilityElementsHidden
        importantForAccessibility='no-hide-descendants'
      />

      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate='fast'
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
        contentContainerStyle={{
          paddingTop: halfPadding,
          paddingBottom: halfPadding,
        }}
      />
    </View>
  );
};

export default Wheel;
