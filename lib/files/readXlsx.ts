// A minimal .xlsx reader: the first worksheet's cell values as strings. That is all the
// contact import needs, so it does not pull in a full spreadsheet library — an .xlsx is a
// zip of XML parts, unzipped with fflate and read with the browser's DOMParser. Web only
// (DOMParser); imported solely by `spreadsheetFile.web.ts`.
//
// Values come back raw: a date cell is its Excel serial number (`45717`), which the
// importer's `parseLooseDate` understands, and formulas yield their cached result.

import { strFromU8, unzipSync } from 'fflate';

const parseXml = (files: Record<string, Uint8Array>, path: string) => {
  const bytes = files[path];
  return bytes
    ? new DOMParser().parseFromString(strFromU8(bytes), 'application/xml')
    : null;
};

// Namespace-agnostic: some writers prefix the spreadsheetml elements (`x:c`).
const byTag = (node: Document | Element, tag: string) =>
  Array.from(node.getElementsByTagNameNS('*', tag));

/** Rich-text runs are several `<t>`s; phonetic guides (`<rPh>`) are not part of the text. */
const textOf = (node: Element) =>
  byTag(node, 't')
    .filter(t => (t.parentNode as Element | null)?.localName !== 'rPh')
    .map(t => t.textContent ?? '')
    .join('');

/** `AB12` → 27 (0-based column index). */
const columnIndex = (ref: string) =>
  [...(/^[A-Z]+/.exec(ref)?.[0] ?? '')].reduce(
    (n, ch) => n * 26 + ch.charCodeAt(0) - 64,
    0
  ) - 1;

/** Resolves the first sheet's part path through the workbook's relationships. */
function firstSheetPath(files: Record<string, Uint8Array>): string {
  const workbook = parseXml(files, 'xl/workbook.xml');
  const rels = parseXml(files, 'xl/_rels/workbook.xml.rels');
  const sheet = workbook && byTag(workbook, 'sheet')[0];
  const relId =
    sheet && Array.from(sheet.attributes).find(attr => attr.localName === 'id')?.value;
  const target =
    rels &&
    relId &&
    byTag(rels, 'Relationship')
      .find(rel => rel.getAttribute('Id') === relId)
      ?.getAttribute('Target');
  if (!target) return 'xl/worksheets/sheet1.xml';
  return target.startsWith('/') ? target.slice(1) : `xl/${target}`;
}

/**
 * Rows are positional: `rows[i]` is sheet row `i + 1`, with empty arrays for rows the
 * file leaves out, so a row number reported back to the user matches their spreadsheet.
 * Throws if the bytes are not an .xlsx.
 */
export function readXlsx(data: ArrayBuffer): string[][] {
  const files = unzipSync(new Uint8Array(data));

  const sharedStrings = parseXml(files, 'xl/sharedStrings.xml');
  const strings = sharedStrings ? byTag(sharedStrings, 'si').map(textOf) : [];

  const sheet = parseXml(files, firstSheetPath(files));
  if (!sheet) throw new Error('The workbook has no worksheet.');

  const rows: string[][] = [];
  byTag(sheet, 'row').forEach((rowNode, i) => {
    const rowNumber = Number(rowNode.getAttribute('r')) || i + 1;
    const cells: string[] = [];

    byTag(rowNode, 'c').forEach((cell, j) => {
      const ref = cell.getAttribute('r');
      const column = ref ? columnIndex(ref) : j;
      const type = cell.getAttribute('t');
      const raw = byTag(cell, 'v')[0]?.textContent ?? '';

      let value: string;
      if (type === 's') value = strings[Number(raw)] ?? '';
      else if (type === 'inlineStr') value = textOf(cell);
      else if (type === 'b') value = raw === '1' ? 'TRUE' : 'FALSE';
      else if (type === 'e') value = '';
      else value = raw;

      while (cells.length < column) cells.push('');
      cells[column] = value;
    });

    while (rows.length < rowNumber - 1) rows.push([]);
    rows[rowNumber - 1] = cells;
  });

  return rows;
}
