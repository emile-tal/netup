// The spreadsheet ⇄ contact mapping for bulk import. The column set mirrors
// `assets/NetUp_Network_Template.xlsx` — the template people fill in — and this file is
// the single source of truth for it in code: the downloadable CSV template and the
// importer are both built from `TEMPLATE_COLUMNS`, so they cannot drift apart. If the
// .xlsx changes, change the columns here to match.
//
// Input is rows of cells, already read from a CSV or an .xlsx (see `lib/files/`), so
// nothing here knows about file formats.

import type { Contact, Tier } from '../types/contacts';
import { parseLooseDate } from './date';
import { toCsv } from './csv';
import { newLocalId } from './id';

const TEMPLATE_COLUMNS = [
  { key: 'name', header: 'Name', hint: '', example: 'Jane Doe' },
  { key: 'company', header: 'Company', hint: '', example: 'Example Hotels Group' },
  { key: 'role', header: 'Role', hint: '', example: 'Director of Development' },
  {
    key: 'channel',
    header: 'Contact Channel',
    hint: 'Email, LinkedIn, phone…',
    example: 'Email, LinkedIn',
  },
  {
    key: 'affiliation',
    header: 'Shared Affiliation',
    hint: 'School, club, former employer…',
    example: 'University alum',
  },
  {
    key: 'strength',
    header: 'Relationship Strength',
    hint: '1 (weak) to 5 (strong)',
    example: '4',
  },
  {
    key: 'source',
    header: 'Source of Contact',
    hint: 'Referral, event, internship…',
    example: 'Referral from a professor',
  },
  {
    key: 'whereMet',
    header: 'Where You Met',
    hint: 'Call, event, office…',
    example: 'Industry conference',
  },
  { key: 'firstMet', header: 'First Met', hint: 'Month/Year', example: '03/2025' },
  { key: 'lastContact', header: 'Last Contact', hint: 'Date', example: '2026-09-15' },
  {
    key: 'notes',
    header: 'Personal Notes',
    hint: 'Family, interests, milestones…',
    example: 'Training for a marathon; two kids',
  },
] as const;

type ColumnKey = (typeof TEMPLATE_COLUMNS)[number]['key'];

/** Guards against a paste of a whole address book; every row is its own `db.write`. */
export const MAX_IMPORT_ROWS = 500;

/** How far down the sheet to look for the header row (the .xlsx has a title above it). */
const HEADER_SEARCH_ROWS = 10;

/** Header row, the hint row, then the example row — what "Download template" saves. */
export function contactTemplateCsv(): string {
  return toCsv([
    TEMPLATE_COLUMNS.map(column => column.header),
    TEMPLATE_COLUMNS.map(column => column.hint),
    TEMPLATE_COLUMNS.map(column => column.example),
  ]);
}

export interface ContactImportRowError {
  /** 1-based row number in the sheet — what the user sees in their spreadsheet app. */
  row: number;
  message: string;
}

export interface ContactImportResult {
  contacts: Contact[];
  errors: ContactImportRowError[];
}

/** Thrown when the file as a whole is unusable (no header row, no rows, too many). */
export class ContactImportError extends Error {}

/** `Contact Channel`, `contact channel` and `contactChannel` all match. */
const normalizeHeader = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const isBlankRow = (cells: string[]) => cells.every(cell => cell.trim() === '');

/**
 * The template's 1–5 strength onto the 5-15-50 circles. Only the strongest three steps
 * earn a circle; 1–2 (and anything unreadable) stay unassigned for the user to place.
 */
const TIER_BY_STRENGTH: Record<number, Tier> = { 5: 5, 4: 15, 3: 50 };

const EMAIL_PATTERN = /[^\s,;<>()]+@[^\s,;<>()]+\.[a-z]{2,}/gi;
/** Seven or more digits, with the usual separators in between. */
const PHONE_PATTERN = /\+?\d[\d\s().-]{5,}\d/g;

/**
 * "Contact Channel" is free text: usually *how* to reach someone ("Email, LinkedIn"), but
 * people also paste the address itself. Addresses become real emails/phones; whatever
 * is left over is kept as a line of notes rather than dropped.
 */
function splitChannel(text: string) {
  const emails = text.match(EMAIL_PATTERN) ?? [];
  const withoutEmails = text.replace(EMAIL_PATTERN, ' ');
  const phones = (withoutEmails.match(PHONE_PATTERN) ?? []).filter(
    phone => phone.replace(/\D/g, '').length >= 7
  );
  const rest = phones
    .reduce((acc, phone) => acc.replace(phone, ' '), withoutEmails)
    .split(/[,;/\n]/)
    .map(part => part.trim())
    .filter(Boolean)
    .join(', ');
  return { emails, phones: phones.map(phone => phone.trim()), rest };
}

/** "Jane Doe" → Jane / Doe; "Jane" → Jane / ''. */
function splitName(name: string) {
  const [firstName, ...rest] = name.split(/\s+/);
  return { firstName: firstName ?? '', lastName: rest.join(' ') };
}

/**
 * Maps sheet rows onto complete `Contact` DTOs. The header row is found by its "Name"
 * column within the first few rows, so the .xlsx (title and instructions above the
 * header) and the CSV template (header first) both import. Header matching ignores case,
 * spacing and punctuation, and unknown columns are ignored. The template's hint row and
 * untouched example row are skipped. Per-row problems are collected rather than thrown:
 * a bad row should not cost the user the other 200.
 */
export function parseContactRows(rows: string[][]): ContactImportResult {
  const headerIndex = rows
    .slice(0, HEADER_SEARCH_ROWS)
    .findIndex(cells => cells.some(cell => normalizeHeader(cell) === 'name'));
  if (headerIndex === -1) {
    throw new ContactImportError(
      "We couldn't find the template's header row. Download the template and copy your contacts into it."
    );
  }

  const header = rows[headerIndex].map(normalizeHeader);
  const columnIndexes = Object.fromEntries(
    TEMPLATE_COLUMNS.map(column => [
      column.key,
      header.indexOf(normalizeHeader(column.header)),
    ])
  ) as Record<ColumnKey, number>;

  const read = (cells: string[], key: ColumnKey) => {
    const index = columnIndexes[key];
    return index === -1 ? '' : (cells[index] ?? '').trim();
  };
  const matchesTemplateRow = (cells: string[], field: 'hint' | 'example') =>
    TEMPLATE_COLUMNS.every(column => read(cells, column.key) === column[field]);
  const isExampleRow = (cells: string[]) =>
    TEMPLATE_COLUMNS.slice(0, 3).every(
      column => read(cells, column.key) === column.example
    );

  // Keep each row's position, so errors name the row the user sees in their sheet.
  const dataRows = rows
    .map((cells, index) => ({ cells, rowNumber: index + 1 }))
    .slice(headerIndex + 1)
    .filter(
      ({ cells }) =>
        !isBlankRow(cells) && !matchesTemplateRow(cells, 'hint') && !isExampleRow(cells)
    );

  if (dataRows.length === 0)
    throw new ContactImportError(
      'The file has no contacts in it. Add yours below the example row.'
    );
  if (dataRows.length > MAX_IMPORT_ROWS) {
    throw new ContactImportError(
      `That file has ${dataRows.length} contacts. Import at most ${MAX_IMPORT_ROWS} at a time.`
    );
  }

  const contacts: Contact[] = [];
  const errors: ContactImportRowError[] = [];

  dataRows.forEach(({ cells, rowNumber }) => {
    const cell = (key: ColumnKey) => read(cells, key);

    const { firstName, lastName } = splitName(cell('name'));
    if (!firstName) {
      errors.push({ row: rowNumber, message: 'No name — skipped.' });
      return;
    }

    const dates: Partial<Record<'firstMet' | 'lastContact', Date>> = {};
    for (const key of ['firstMet', 'lastContact'] as const) {
      const text = cell(key);
      if (!text) continue;
      const date = parseLooseDate(text);
      if (!date) {
        const header = TEMPLATE_COLUMNS.find(column => column.key === key)!.header;
        errors.push({
          row: rowNumber,
          message: `"${text}" is not a valid ${header} date — skipped.`,
        });
        return;
      }
      dates[key] = date;
    }

    const channel = splitChannel(cell('channel'));
    const notes = [cell('notes'), channel.rest && `Contact channel: ${channel.rest}`]
      .filter(Boolean)
      .join('\n');

    contacts.push({
      id: newLocalId(),
      firstName,
      lastName,
      company: cell('company'),
      jobTitle: cell('role'),
      alumni: cell('affiliation'),
      tier: TIER_BY_STRENGTH[Number(cell('strength'))] ?? null,
      lastOutreachAt: dates.lastContact,
      source: cell('source'),
      notes,
      emails: channel.emails.map(email => ({ id: newLocalId(), label: 'work', email })),
      phones: channel.phones.map(phoneNumber => ({
        id: newLocalId(),
        label: 'mobile',
        phoneNumber,
      })),
      addresses: [],
      firstMeeting: {
        id: newLocalId(),
        date: dates.firstMet,
        location: cell('whereMet') || undefined,
      },
    });
  });

  return { contacts, errors };
}
