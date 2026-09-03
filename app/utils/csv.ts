// Minimal RFC-4180 CSV reader/writer. Format only — nothing here knows what a contact
// is; the column mapping lives in `contactCsv.ts`.

const QUOTE = '"';

/**
 * Parses CSV text into rows of raw cells. Handles quoted fields (with `""` escapes and
 * embedded commas/newlines), CRLF and LF line endings, and a leading UTF-8 BOM.
 * Blank lines are dropped, so a trailing newline never produces a phantom row.
 */
export function parseCsv(text: string): string[][] {
  const input = text.replace(/^﻿/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  const endCell = () => {
    row.push(cell);
    cell = '';
  };
  const endRow = () => {
    endCell();
    // A row of one empty cell is a blank line, not a record.
    if (!(row.length === 1 && row[0].trim() === '')) rows.push(row);
    row = [];
  };

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (quoted) {
      if (char === QUOTE) {
        if (input[i + 1] === QUOTE) {
          cell += QUOTE;
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (char === QUOTE) {
      quoted = true;
    } else if (char === ',') {
      endCell();
    } else if (char === '\n') {
      endRow();
    } else if (char === '\r') {
      // Swallowed: the '\n' of a CRLF pair ends the row on the next iteration.
      if (input[i + 1] !== '\n') endRow();
    } else {
      cell += char;
    }
  }

  // Whatever is left after the last line ending is the final record.
  if (cell !== '' || row.length > 0) endRow();

  return rows;
}

/** Quotes a cell only when it would otherwise break the format. */
function escapeCell(value: string): string {
  return /[",\r\n]/.test(value) ? `${QUOTE}${value.split(QUOTE).join('""')}${QUOTE}` : value;
}

/** Serialises rows to CSV text with CRLF line endings (what spreadsheet apps expect). */
export function toCsv(rows: string[][]): string {
  return rows.map(cells => cells.map(escapeCell).join(',')).join('\r\n');
}
