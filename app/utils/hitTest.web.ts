/**
 * Web half of `isPointOverAny`. A react-native-web `Text` ref is its DOM `span`, and
 * `getClientRects` returns one rect per line fragment — a wrapped tag's bounding box
 * would also cover the prose between its two halves.
 */
export function isPointOverAny(nodes: unknown[], x: number, y: number): boolean {
  return nodes.some(node => {
    if (!(node instanceof Element)) return false;
    return Array.from(node.getClientRects()).some(
      rect => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  });
}
