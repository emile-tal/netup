import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import ImportIcon from '@/app/icons/ImportIcon';
import { colors } from '@/app/theme';
import { useFileDrop } from '@/app/hooks/useFileDrop';
import { useRef } from 'react';

interface FileDropZoneProps {
  /** Opens the file picker — the zone is a button as well as a drop target. */
  onBrowse: () => void;
  onDropFiles: (files: File[]) => void;
  /** Shows progress and ignores both drops and presses while true. */
  busy?: boolean;
}

/**
 * The import modal's middle section: drag a spreadsheet onto it, or press it to browse.
 * Drag-and-drop is web-only (`useFileDrop`); on native the zone is just the button, and
 * its copy says so.
 */
const FileDropZone = ({ onBrowse, onDropFiles, busy = false }: FileDropZoneProps) => {
  const zoneRef = useRef<View>(null);
  const { supported, dragging } = useFileDrop(zoneRef, onDropFiles, !busy);

  const headline = busy
    ? 'Importing…'
    : dragging
      ? 'Drop to import'
      : supported
        ? 'Drag your CSV or Excel file here'
        : 'Choose a CSV or Excel file';

  return (
    <View ref={zoneRef}>
      <Pressable
        accessibilityRole='button'
        accessibilityLabel='Choose a CSV or Excel file to import'
        accessibilityState={{ disabled: busy, busy }}
        onPress={onBrowse}
        disabled={busy}
        className={`items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 ${
          dragging
            ? 'border-blue bg-blue-lighter'
            : 'border-line-strong bg-surface-muted hover:border-blue'
        }`}
      >
        {busy ? (
          <ActivityIndicator color={colors.blue} />
        ) : (
          <ImportIcon size={32} color={dragging ? colors.blueDark : colors.inkSubtle} />
        )}
        <Text
          className={`font-nunito text-center text-[15px] ${
            dragging ? 'text-blue-darker' : 'text-ink'
          }`}
        >
          {headline}
        </Text>
        {!busy && !dragging && (
          <Text className='font-nunito text-center text-[13px] text-ink-muted'>
            {supported ? 'or ' : ''}
            <Text className='font-nunito text-blue-dark'>
              {supported ? 'browse files' : 'Browse files'}
            </Text>
            {' · .csv or .xlsx'}
          </Text>
        )}
      </Pressable>
    </View>
  );
};

export default FileDropZone;
