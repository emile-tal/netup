import { Pressable, Text, View } from 'react-native';
import {
  ContactImportError,
  contactTemplateCsv,
  parseContactRows,
  type ContactImportRowError,
} from '@/app/utils/contactImport';
import { pickSpreadsheetRows, saveCsvFile } from '@/lib/files/spreadsheetFile';
import { useEffect, useState } from 'react';

import Button from '../Button';
import DownloadIcon from '@/app/icons/DownloadIcon';
import ModalShell from '../ModalShell';
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
  errors: ContactImportRowError[];
}

/** Only the first few row errors are worth showing; the rest would fill the panel. */
const MAX_LISTED_ERRORS = 5;

const TEMPLATE_FILENAME = 'NetUp_Network_Template.csv';

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
      await saveCsvFile(TEMPLATE_FILENAME, contactTemplateCsv());
    } catch (error) {
      console.error('Error saving CSV template:', error);
      notify('Could not download', 'The template was not saved. Please try again.');
    }
  };

  const handlePickFile = async () => {
    if (importing) return;

    setImporting(true);
    try {
      const rows = await pickSpreadsheetRows();
      if (rows === null) return;

      const { contacts, errors } = parseContactRows(rows);
      const { imported, skipped } = await importContacts(db, contacts);
      setSummary({ imported, skipped, errors });
    } catch (error) {
      if (error instanceof ContactImportError) {
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
    <ModalShell
      visible={visible}
      onRequestClose={handleClose}
      title='Import contacts'
      footer={
        <>
          <Button
            label={summary ? 'Done' : 'Cancel'}
            variant='grey'
            onPress={handleClose}
            disabled={importing}
          />
          {!summary && (
            <Button
              label={importing ? 'Importing…' : 'Choose file'}
              onPress={handlePickFile}
              disabled={importing}
            />
          )}
        </>
      }
    >
      {summary ? (
        <View className='mt-2 gap-2'>
          <Text className='font-nunito text-[14px] text-ink'>
            {summary.imported} {summary.imported === 1 ? 'contact' : 'contacts'} imported
            {summary.skipped > 0 ? ` · ${summary.skipped} skipped (duplicate email)` : ''}
            {summary.errors.length > 0 ? ` · ${summary.errors.length} not read` : ''}
          </Text>
          {summary.errors.slice(0, MAX_LISTED_ERRORS).map(error => (
            <Text key={error.row} className='font-nunito text-[13px] text-ink-muted'>
              Row {error.row}: {error.message}
            </Text>
          ))}
          {summary.errors.length > MAX_LISTED_ERRORS && (
            <Text className='font-nunito text-[13px] text-ink-subtle'>
              …and {summary.errors.length - MAX_LISTED_ERRORS} more.
            </Text>
          )}
        </View>
      ) : (
        <View className='mt-2 gap-4'>
          <Text className='font-nunito text-[14px] leading-5 text-ink-muted'>
            Download the template, fill in your contacts, then upload it as a CSV or
            Excel file. Contacts whose email already exists are skipped.
          </Text>
          <Pressable
            accessibilityRole='button'
            accessibilityLabel='Download template'
            onPress={handleDownloadTemplate}
            className='flex-row items-center gap-1.5 self-start'
          >
            <DownloadIcon size={16} color={colors.blue} />
            <Text className='font-nunito text-[14px] text-blue'>
              Download template
            </Text>
          </Pressable>
        </View>
      )}
    </ModalShell>
  );
};

export default ImportContactsModal;
