// Native stub. Picking and saving a file needs expo-document-picker / -file-system /
// -sharing, which would mean new native modules and a dev-client rebuild; contact import
// is web-only for now. The web build resolves `spreadsheetFile.web.ts` — keep both
// signatures identical, since TypeScript only typechecks this file (see CLAUDE.md §12).
// Lives in `lib/`, not `app/`, because the web half pulls in an unzip library that the
// router's sweep of `app/` would otherwise put in the native bundle.
//
// Each function rejects with a `ContactImportError`, whose message the import modal shows
// inline — the same path as a file it can't read.

import { ContactImportError } from '@/app/utils/contactImport';

const unsupported = () =>
  new ContactImportError('Importing contacts is only available in the web app for now.');

/** The picked CSV or .xlsx file as rows of cells, or `null` if the user cancelled. */
export async function pickSpreadsheetRows(): Promise<string[][] | null> {
  throw unsupported();
}

/** A CSV or .xlsx the user dropped, as rows of cells. */
export async function readSpreadsheetFile(_file: File): Promise<string[][]> {
  throw unsupported();
}

export async function saveCsvFile(_filename: string, _content: string): Promise<void> {
  throw unsupported();
}
