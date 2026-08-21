import { avatarPalette } from '../theme';

/** A background/initials pair from `avatarPalette`. */
export type AvatarTint = (typeof avatarPalette)[number];

/**
 * Picks a stable avatar tint for a name. Deterministic so the same contact keeps the
 * same colour across renders and screens — no colour is stored on the record.
 */
export function avatarColor(seed: string): AvatarTint {
  if (!seed) return avatarPalette[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % avatarPalette.length;
  }
  return avatarPalette[hash];
}
