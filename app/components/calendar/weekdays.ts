/** The calendar is Monday-first; the header row and the grid offset both read this. */
export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

/**
 * Width of the grid's leading border. React Native is border-box, so the border is
 * subtracted from the space the seven columns get — the screen budgets for it when it
 * derives `columnWidth`, and the header offsets by it to stay aligned with the columns.
 */
export const GRID_BORDER_WIDTH = 1;

/** Total width of a seven-column grid, borders included. */
export function gridWidthFor(columnWidth: number): number {
  return columnWidth * 7 + GRID_BORDER_WIDTH;
}

/**
 * Index (0 = Monday) of the weekday a month starts on. `Date.getDay()` is Sunday-first,
 * so it is rotated rather than simply decremented — subtracting 1 yields -1 for a month
 * that starts on a Sunday.
 */
export function mondayFirstOffset(year: number, month: number): number {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}
