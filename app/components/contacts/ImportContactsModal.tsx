import { Modal, Pressable, Text, View } from 'react-native';
import {
  CONTACT_CSV_COLUMNS,
  ContactCsvError,
  contactCsvTemplate,
  parseContactsCsv,
  type ContactCsvRowError,
} from '@/app/utils/contactCsv';
import { pickCsvText, saveCsvFile } from '@/app/utils/csvFile';
import { useEffect, useState } from 'react';

import Button from '../Button';
import DownloadIcon from '@/app/icons/DownloadIcon';
import { colors } from '@/app/theme';
import { importContacts } from '@/db/repo/contacts';
import { notify } from '@/app/utils/alert';
import { useDB } from '@/db/dbProvider';

interface ImportContactsModalProps {
  visible: boolean;
  onRequestClose: () => void;
}

interface ImportSummary {
  imported: number;
  skipped: number;
  errors: ContactCsvRowError[];
}

/** Only the first few row errors are worth showing; the rest would fill the panel. */
const MAX_LISTED_ERRORS = 5;

const TEMPLATE_FILENAME = 'netup-contacts-template.csv';

const ImportContactsModal = ({ visible, onRequestClose }: ImportContactsModalProps) => {
  const db = useDB();
  const [importing, setImporting] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  // Start from a clean slate each time the modal opens, so a previous run's summary
  // doesn't greet the next import.
  useEffect(() => {
    if (visible) setSummary(null);
  }, [visible]);

  const handleClose = () => {
    if (importing) return;
    onRequestClose();
  };

  const handleDownloadTemplate = async () => {
    try {
      await saveCsvFile(TEMPLATE_FILENAME, contactCsvTemplate());
    } catch (error) {
      console.error('Error saving CSV template:', error);
      notify('Could not download', 'The template was not saved. Please try again.');
    }
  };

  const handlePickFile = async () => {
    if (importing) return;

    setImporting(true);
    try {
      const text = await pickCsvText();
      if (text === null) return;

      const { contacts, errors } = parseContactsCsv(text);
      const { imported, skipped } = await importContacts(db, contacts);
      setSummary({ imported, skipped, errors });
    } catch (error) {
      if (error instanceof ContactCsvError) {
        notify("That file can't be read", error.message);
      } else {
        console.error('Error importing contacts:', error);
        notify('Could not import', 'Nothing was changed. Please try again.');
      }
    } finally {
      setImporting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={handleClose}
      animationType='fade'
      transparent
      presentationStyle='overFullScreen'
    >
      <View className='flex-1 items-center justify-center bg-black/40 p-5'>
        <Pressable
          accessibilityLabel='Dismiss'
          onPress={handleClose}
          className='absolute inset-0'
        />
        <View className='w-full max-w-[420px] rounded-2xl border border-line bg-surface p-6'>
          <Text className='mb-2 text-[18px] font-bold text-ink'>Import contacts</Text>

          {summary ? (
            <View className='gap-2'>
              <Text className='text-[14px] text-ink'>
                {summary.imported} {summary.imported === 1 ? 'contact' : 'contacts'} imported
                {summary.skipped > 0
                  ? ` · ${summary.skipped} skipped (duplicate email)`
                  : ''}
                {summary.errors.length > 0 ? ` · ${summary.errors.length} not read` : ''}
              </Text>
              {summary.errors.slice(0, MAX_LISTED_ERRORS).map(error => (
                <Text key={error.row} className='text-[13px] text-ink-muted'>
                  Row {error.row}: {error.message}
                </Text>
              ))}
              {summary.errors.length > MAX_LISTED_ERRORS && (
                <Text className='text-[13px] text-ink-subtle'>
                  …and {summary.errors.length - MAX_LISTED_ERRORS} more.
                </Text>
              )}
            </View>
          ) : (
            <View className='gap-4'>
              <Text className='text-[14px] leading-5 text-ink-muted'>
                Upload a CSV whose first row lists the column names. Contacts whose email
                already exists are skipped.
              </Text>
              <View className='rounded-xl bg-surface-sunken p-3'>
                <Text className='text-[12px] leading-4 text-ink-muted'>
                  {CONTACT_CSV_COLUMNS.join(', ')}
                </Text>
              </View>
              <Pressable
                accessibilityRole='button'
                accessibilityLabel='Download CSV template'
                onPress={handleDownloadTemplate}
                className='flex-row items-center gap-1.5 self-start'
              >
                <DownloadIcon size={16} color={colors.brand} />
                <Text className='text-[14px] font-semibold text-brand'>
                  Download template
                </Text>
              </Pressable>
            </View>
          )}

          <View className='mt-6 flex-row justify-end gap-2'>
            <Button
              label={summary ? 'Done' : 'Cancel'}
              variant='ghost'
              onPress={handleClose}
              disabled={importing}
            />
            {!summary && (
              <Button
                label={importing ? 'Importing…' : 'Choose CSV file'}
                onPress={handlePickFile}
                disabled={importing}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ImportContactsModal;
