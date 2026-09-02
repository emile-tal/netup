/**
 * Web implementation — `Alert` from react-native is a no-op under react-native-web,
 * which would silently swallow every error message.
 */
export function notify(title: string, message?: string): void {
  window.alert([title, message].filter(Boolean).join('\n\n'));
}
