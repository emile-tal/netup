import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Small per-device, per-user preferences — the "don't show me this again" kind.
 *
 * Same shape as `db/sync/cursor.ts`: a namespaced key, scoped to the user id, with read
 * and write failures swallowed. These are conveniences, so losing one is a re-shown modal
 * rather than a bug. Anything that must follow the user between devices belongs on the
 * profile record instead (`db/repo/profile.ts`), not here.
 *
 * Keyed per user because AsyncStorage is shared across accounts on one device.
 */
const key = (name: string, userId: string) => `netup.${name}.${userId}`;

/** The 5-15-50 explainer has been dismissed with "Don't show this again". */
export const TIER_INFO_DISMISSED = 'tierInfoDismissed';

export async function readFlag(name: string, userId: string): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(key(name, userId))) === 'true';
  } catch {
    // Unreadable means "not set": the worst case is showing something one extra time.
    return false;
  }
}

export async function setFlag(
  name: string,
  userId: string,
  value: boolean
): Promise<void> {
  try {
    if (value) await AsyncStorage.setItem(key(name, userId), 'true');
    else await AsyncStorage.removeItem(key(name, userId));
  } catch (error) {
    console.warn('Could not persist a preference:', error);
  }
}
