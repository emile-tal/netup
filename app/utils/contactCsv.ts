// The contact ⇄ CSV mapping. This file is the single source of truth for the column set:
// the downloadable template and the importer are both built from `CONTACT_CSV_COLUMNS`,
// so they cannot drift apart. Addresses are deliberately not part of the CSV.

import type { Contact } from '../types/contacts';
import { parseCsv, toCsv } from './csv';
import { parseDateInputValue } from './date';
import { newLocalId } from './id';
import { toTier } from './outreach';

export const CONTACT_CSV_COLUMNS = [
  'firstName',
  'lastName',
  'company',
  'jobTitle',
  'email',
  'phone',
  'tier',
  'alumni',
  'source',
  'notes',
  'firstMetDate',
  'firstMetLocation',
] as const;

type ContactCsvColumn = (typeof CONTACT_CSV_COLUMNS)[number];

/** Guards against a paste of a whole address book; every row is its own `db.write`. */
export const MAX_IMPORT_ROWS = 500;

const EXAMPLE_ROW: Record<ContactCsvColumn, string> = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  company: 'Analytical Co',
  jobTitle: 'Engineer',
  email: 'ada@example.com',
  phone: '+1 555 0100',
  tier: '5',
  alumni: 'Cambridge 2014',
  source: 'Conference',
  notes: 'Met at the AI summit',
  firstMetDate: '2025-03-14',
  firstMetLocation: 'London',
};

/** Header row + one example row, for the "Download template" action. */
export function contactCsvTemplate(): string {
  return toCsv([
    [...CONTACT_CSV_COLUMNS],
    CONTACT_CSV_COLUMNS.map(column => EXAMPLE_ROW[column]),
  ]);
}

export interface ContactCsvRowError {
  /** 1-based row number, counting the header row as row 1 — what the user sees. */
  row: number;
  message: string;
}

export interface ContactCsvParseResult {
  contacts: Contact[];
  errors: ContactCsvRowError[];
}

/** Thrown when the file as a whole is unusable (no header, wrong header, too long). */
export class ContactCsvError extends Error {}

const normalizeHeader = (value: string) => value.trim().toLowerCase();

/**
 * Maps CSV text onto complete `Contact` DTOs. Header matching is case- and
 * whitespace-insensitive and unknown columns are ignored, so an export that carries extra
 * fields still imports. Per-row problems are collected rather than thrown: a bad row
 * should not cost the user the other 200.
 */
export function parseContactsCsv(text: string): ContactCsvParseResult {
  const rows = parseCsv(text);
  if (rows.length === 0) throw new ContactCsvError('The file is empty.');

  const header = rows[0].map(normalizeHeader);
  const indexOf = (column: ContactCsvColumn) => header.indexOf(normalizeHeader(column));

  if (indexOf('firstName') === -1) {
    throw new ContactCsvError(
      'The first row must be a header row containing at least a "firstName" column. Download the template to see the expected columns.'
    );
  }

  const dataRows = rows.slice(1);
  if (dataRows.length === 0) throw new ContactCsvError('The file has no contacts in it.');
  if (dataRows.length > MAX_IMPORT_ROWS) {
    throw new ContactCsvError(
      `That file has ${dataRows.length} rows. Import at most ${MAX_IMPORT_ROWS} at a time.`
    );
  }

  const columnIndexes = Object.fromEntries(
    CONTACT_CSV_COLUMNS.map(column => [column, indexOf(column)])
  ) as Record<ContactCsvColumn, number>;

  const contacts: Contact[] = [];
  const errors: ContactCsvRowError[] = [];

  dataRows.forEach((cells, i) => {
    const lineNumber = i + 2; // +1 for the header row, +1 for 1-based counting.
    const cell = (column: ContactCsvColumn) => {
      const index = columnIndexes[column];
      return index === -1 ? '' : (cells[index] ?? '').trim();
    };

    const firstName = cell('firstName');
    const lastName = cell('lastName');
    if (!firstName && !lastName) {
      errors.push({ row: lineNumber, message: 'No name — skipped.' });
      return;
    }

    const dateText = cell('firstMetDate');
    const firstMetDate = dateText ? parseDateInputValue(dateText) : undefined;
    if (dateText && !firstMetDate) {
      errors.push({
        row: lineNumber,
        message: `"${dateText}" is not a valid firstMetDate (use YYYY-MM-DD) — skipped.`,
      });
      return;
    }

    const email = cell('email');
    const phone = cell('phone');

    contacts.push({
      id: newLocalId(),
      firstName,
      lastName,
      company: cell('company'),
      jobTitle: cell('jobTitle'),
      alumni: cell('alumni'),
      tier: toTier(Number(cell('tier'))),
      source: cell('source'),
      notes: cell('notes'),
      emails: email ? [{ id: newLocalId(), label: 'work', email }] : [],
      phones: phone ? [{ id: newLocalId(), label: 'mobile', phoneNumber: phone }] : [],
      addresses: [],
      firstMeeting: {
        id: newLocalId(),
        date: firstMetDate,
        location: cell('firstMetLocation') || undefined,
      },
    });
  });

  return { contacts, errors };
}
