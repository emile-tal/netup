/**
 * Whether a pointer at window coordinates `(x, y)` is over any of `nodes`, measured from
 * their rendered line boxes — so a tag that wraps onto two lines counts on both.
 *
 * Native has no hover pointer, so there is nothing to test; see the `.web.ts` half.
 */
export function isPointOverAny(_nodes: unknown[], _x: number, _y: number): boolean {
  return false;
}
