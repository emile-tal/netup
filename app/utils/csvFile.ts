// Native stub. Picking and saving a file needs expo-document-picker / -file-system /
// -sharing, which would mean new native modules and a dev-client rebuild; CSV import is
// web-only for now. The web build resolves `csvFile.web.ts` — keep both signatures
// identical, since TypeScript only typechecks this file (see CLAUDE.md §12).

import { notify } from './alert';

const unsupported = () =>
  notify('Not available here', 'CSV import is only available in the web app for now.');

export async function pickCsvText(): Promise<string | null> {
  unsupported();
  return null;
}

export async function saveCsvFile(_filename: string, _content: string): Promise<void> {
  unsupported();
}
