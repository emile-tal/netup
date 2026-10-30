// Web implementation of the file seam — a hidden <input type="file"> to read a CSV or an
// .xlsx and a synthetic <a download> to save a CSV. Kept in a `.web` sibling so the
// native build never sees the DOM. See `spreadsheetFile.ts` for the native half.

import { ContactImportError } from '@/app/utils/contactImport';
import { parseCsv } from '@/app/utils/csv';
import { readXlsx } from './readXlsx';

const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const isXlsx = (file: File) => /\.xlsx$/i.test(file.name) || file.type === XLSX_TYPE;

function readFile(file: File): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    if (/\.xls$/i.test(file.name)) {
      reject(
        new ContactImportError(
          'Old .xls files are not supported. Save it as .xlsx or CSV and try again.'
        )
      );
      return;
    }
    const xlsx = isXlsx(file);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(
          xlsx
            ? readXlsx(reader.result as ArrayBuffer)
            : parseCsv(String(reader.result ?? ''))
        );
      } catch {
        reject(new ContactImportError("That file isn't a readable Excel workbook."));
      }
    };
    reader.onerror = () => reject(new ContactImportError('The file could not be read.'));
    if (xlsx) reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
  });
}

/**
 * Opens the browser's file picker and resolves with the chosen CSV or .xlsx as rows of
 * cells, or `null` if the user cancelled. Cancellation has no reliable event, so the
 * input is left attached and cleaned up on the next `focus` — either way exactly one of
 * the two paths settles.
 */
export async function pickSpreadsheetRows(): Promise<string[][] | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = `.csv,text/csv,.xlsx,${XLSX_TYPE}`;
    input.style.display = 'none';

    let settled = false;
    const settle = () => {
      if (settled) return false;
      settled = true;
      input.remove();
      return true;
    };
    const finish = (value: string[][] | null) => settle() && resolve(value);
    const fail = (error: unknown) => settle() && reject(error);

    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) {
        finish(null);
        return;
      }
      readFile(file).then(finish, fail);
    });

    // Cancelling a file dialog fires no event of its own; regaining window focus is the
    // only signal. Reading the file is async, so this must not resolve out from under a
    // pending FileReader — hence the check that nothing was actually chosen.
    window.addEventListener(
      'focus',
      () => {
        setTimeout(() => {
          if (!input.files?.length) finish(null);
        }, 300);
      },
      { once: true }
    );

    document.body.appendChild(input);
    input.click();
  });
}

/** Saves `content` to the user's downloads as `filename`. */
export async function saveCsvFile(filename: string, content: string): Promise<void> {
  const url = URL.createObjectURL(
    new Blob([content], { type: 'text/csv;charset=utf-8;' })
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
