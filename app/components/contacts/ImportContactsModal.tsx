import { Pressable, Text, View } from 'react-native';
import {
  ContactImportError,
  contactTemplateCsv,
  parseContactRows,
  type ContactImportRowError,
} from '@/app/utils/contactImport';
import {
  pickSpreadsheetRows,
  readSpreadsheetFile,
  saveCsvFile,
} from '@/lib/files/spreadsheetFile';
import { useEffect, useState } from 'react';

import Button from '../Button';
import DownloadIcon from '@/app/icons/DownloadIcon';
import FileDropZone from './FileDropZone';
import ModalShell from '../ModalShell';
import { colors } from '@/app/theme';
import { importContacts } from '@/db/repo/contacts';
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
  // Shown inline: a toast would be drawn underneath this modal (app/utils/alert).
  const [error, setError] = useState<string | null>(null);

  // Start from a clean slate each time the modal opens, so a previous run's summary or
  // error doesn't greet the next import.
  useEffect(() => {
    if (!visible) return;
    setSummary(null);
    setError(null);
  }, [visible]);

  const handleClose = () => {
    if (importing) return;
    onRequestClose();
  };

  const handleDownloadTemplate = async () => {
    setError(null);
    try {
      await saveCsvFile(TEMPLATE_FILENAME, contactTemplateCsv());
    } catch (cause) {
      if (cause instanceof ContactImportError) {
        setError(cause.message);
      } else {
        console.error('Error saving CSV template:', cause);
        setError('The template was not downloaded. Please try again.');
      }
    }
  };

  /**
   * The one import path, for a picked file and a dropped one alike: read the rows (or
   * `null` if the picker was cancelled), parse, write. A file that can't be used says why;
   * anything else is a write failure part-way through — `importContacts` writes row by row,
   * so the rows before it stay, and the message says so rather than claiming a rollback.
   */
  const runImport = async (readRows: () => Promise<string[][] | null>) => {
    if (importing) return;

    setImporting(true);
    setError(null);
    try {
      const rows = await readRows();
      if (rows === null) return;

      const { contacts, errors } = parseContactRows(rows);
      const { imported, skipped } = await importContacts(db, contacts);
      setSummary({ imported, skipped, errors });
    } catch (cause) {
      if (cause instanceof ContactImportError) {
        setError(cause.message);
      } else {
        console.error('Error importing contacts:', cause);
        setError(
          'The import stopped part-way. Contacts already added were kept; importing the same file again skips any whose email is saved.'
        );
      }
    } finally {
      setImporting(false);
    }
  };

  const handleDropFiles = (files: File[]) => {
    if (files.length > 1) {
      setError('Drop one file at a time.');
      return;
    }
    void runImport(() => readSpreadsheetFile(files[0]));
  };

  return (
    <ModalShell
      visible={visible}
      onRequestClose={handleClose}
      title='Import contacts'
      error={error}
      footer={
        <Button
          label={summary ? 'Done' : 'Cancel'}
          variant={summary ? 'primary' : 'grey'}
          onPress={handleClose}
          disabled={importing}
        />
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
            Download the template, fill in your contacts, then drop it below as a CSV or
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
          <FileDropZone
            onBrowse={() => void runImport(pickSpreadsheetRows)}
            onDropFiles={handleDropFiles}
            busy={importing}
          />
        </View>
      )}
    </ModalShell>
  );
};

export default ImportContactsModal;
