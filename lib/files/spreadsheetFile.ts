// Native stub. Picking and saving a file needs expo-document-picker / -file-system /
// -sharing, which would mean new native modules and a dev-client rebuild; contact import
// is web-only for now. The web build resolves `spreadsheetFile.web.ts` — keep both
// signatures identical, since TypeScript only typechecks this file (see CLAUDE.md §12).
// Lives in `lib/`, not `app/`, because the web half pulls in an unzip library that the
// router's sweep of `app/` would otherwise put in the native bundle.

import { notify } from '@/app/utils/alert';

const unsupported = () =>
  notify(
    'Not available here',
    'Importing contacts is only available in the web app for now.'
  );

/** The picked CSV or .xlsx file as rows of cells, or `null` if the user cancelled. */
export async function pickSpreadsheetRows(): Promise<string[][] | null> {
  unsupported();
  return null;
}

export async function saveCsvFile(_filename: string, _content: string): Promise<void> {
  unsupported();
}
