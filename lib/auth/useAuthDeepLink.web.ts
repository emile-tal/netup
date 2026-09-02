/**
 * Web no-op. The browser client runs with `detectSessionInUrl: true`, so supabase-js
 * exchanges the code in the address bar itself. Keep the signature identical to the
 * native file.
 */
export function useAuthDeepLink() {}
