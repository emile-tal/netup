import { type RefObject, useEffect, useRef, useState } from 'react';

import type { FileDrop } from './useFileDrop';
import type { View } from 'react-native';

/** Only a drag carrying files is ours — not a dragged link or a text selection. */
const carriesFiles = (event: DragEvent) =>
  !!event.dataTransfer && Array.from(event.dataTransfer.types).includes('Files');

/**
 * Web half of `useFileDrop`. react-native-web forwards no drag events to a `View`, so the
 * listeners go on the DOM node behind the ref (a `View` *is* its element on web).
 *
 * While mounted it also swallows file drops anywhere else in the window: a near miss would
 * otherwise make the browser navigate away to the file, taking the app with it.
 */
export function useFileDrop(
  target: RefObject<View | null>,
  onDrop: (files: File[]) => void,
  enabled = true
): FileDrop {
  const [dragging, setDragging] = useState(false);
  // Latest callback without re-binding the listeners on every render.
  const onDropRef = useRef(onDrop);
  onDropRef.current = onDrop;

  useEffect(() => {
    const element = target.current as unknown as HTMLElement | null;
    if (!element) return;

    // `dragenter`/`dragleave` fire for every child crossed, so a plain boolean flickers
    // as the pointer moves over the zone's icon and text. Count instead.
    let depth = 0;

    const handleEnter = (event: DragEvent) => {
      if (!carriesFiles(event)) return;
      event.preventDefault();
      depth += 1;
      if (enabled) setDragging(true);
    };
    const handleOver = (event: DragEvent) => {
      if (!carriesFiles(event)) return;
      // Without this the browser refuses the drop.
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = enabled ? 'copy' : 'none';
    };
    const handleLeave = (event: DragEvent) => {
      if (!carriesFiles(event)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setDragging(false);
    };
    const handleDrop = (event: DragEvent) => {
      if (!carriesFiles(event)) return;
      event.preventDefault();
      // The window listener below must not see this drop as a miss.
      event.stopPropagation();
      depth = 0;
      setDragging(false);
      const files = Array.from(event.dataTransfer?.files ?? []);
      if (enabled && files.length > 0) onDropRef.current(files);
    };
    const swallowMiss = (event: DragEvent) => {
      if (carriesFiles(event)) event.preventDefault();
    };

    element.addEventListener('dragenter', handleEnter);
    element.addEventListener('dragover', handleOver);
    element.addEventListener('dragleave', handleLeave);
    element.addEventListener('drop', handleDrop);
    window.addEventListener('dragover', swallowMiss);
    window.addEventListener('drop', swallowMiss);

    return () => {
      element.removeEventListener('dragenter', handleEnter);
      element.removeEventListener('dragover', handleOver);
      element.removeEventListener('dragleave', handleLeave);
      element.removeEventListener('drop', handleDrop);
      window.removeEventListener('dragover', swallowMiss);
      window.removeEventListener('drop', swallowMiss);
      setDragging(false);
    };
  }, [target, enabled]);

  return { supported: true, dragging: enabled && dragging };
}
