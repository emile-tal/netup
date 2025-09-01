import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type WheelProps<T> = {
  data: T[];
  // how to render each row's label
  getLabel: (item: T, index: number) => string;
  selectedIndex: number; // controlled
  onChange: (index: number) => void; // emits selected index on snap
  itemHeight?: number; // default 44
  visibleRows?: 5 | 3 | 7; // must be odd so the center aligns
  // optional styling hooks
  containerStyle?: object;
  itemStyle?: object;
  selectedItemStyle?: object;
  testID?: string;
};

const Wheel = <T,>({
  data,
  getLabel,
  selectedIndex,
  onChange,
  itemHeight = 44,
  visibleRows = 5,
  containerStyle,
  itemStyle,
  selectedItemStyle,
  testID,
}: WheelProps<T>) => {
  const listRef = useRef<FlatList<T>>(null);

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
        <View
          style={[
            styles.item,
            { height: itemHeight },
            itemStyle,
            isSelected && selectedItemStyle,
          ]}
        >
          <Text
            style={[styles.itemText, isSelected && styles.itemTextSelected]}
            accessibilityRole='text'
            accessibilityState={{ selected: isSelected }}
            accessible
          >
            {getLabel(item, index)}
          </Text>
        </View>
      );
    },
    [itemHeight, itemStyle, selectedItemStyle, selectedIndex, getLabel]
  );

  return (
    <View
      style={[{ height: itemHeight * visibleRows }, styles.container, containerStyle]}
      testID={testID}
    >
      {/* selection highlight */}
      <View
        pointerEvents='none'
        style={[
          styles.selectionOverlay,
          { top: halfPadding, height: itemHeight, borderRadius: 8 },
        ]}
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

const styles = StyleSheet.create({
  container: { position: 'relative', overflow: 'hidden' },
  item: { justifyContent: 'center', alignItems: 'center' },
  itemText: { fontSize: 16, opacity: 0.7 },
  itemTextSelected: { fontWeight: '600', opacity: 1 },
  selectionOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
});
