/**
 * The field rules shared by every auth form, in one place so sign-up and the password
 * reset cannot drift apart. Each returns a message to show, or `null` when the value is
 * acceptable.
 */

/** Keep in step with the project's password policy (Auth → Policies → Passwords). */
export const MIN_PASSWORD_LENGTH = 10;

/** Rough shape check only — the server is the authority on whether an address exists. */
export const looksLikeEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export function emailProblem(value: string): string | null {
  return looksLikeEmail(value) ? null : 'Enter a valid email address';
}

/**
 * `min` is 0 for sign-in, where an existing password may predate the current policy and
 * the only useful client-side check is that the field is not empty.
 */
export function passwordProblem(value: string, min: number): string | null {
  if (value.length >= Math.max(min, 1)) return null;
  return min > 1 ? `Use at least ${min} characters` : 'Enter your password';
}

export function confirmPasswordProblem(password: string, confirm: string): string | null {
  if (confirm.length === 0) return 'Re-enter your password';
  return confirm === password ? null : 'Passwords do not match';
}
