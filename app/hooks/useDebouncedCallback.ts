import { useCallback, useEffect, useRef } from 'react';

/**
 * Returns a stable debounced wrapper around `fn`. The latest `fn` is kept in a ref, so
 * the returned callback identity never changes and the pending timer is not thrown away
 * every time the caller re-renders. Any pending call is cancelled on unmount.
 */
export function useDebouncedCallback<A extends unknown[]>(
  fn: (...args: A) => void,
  delay = 500
) {
  const fnRef = useRef(fn);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return useCallback(
    (...args: A) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        fnRef.current(...args);
      }, delay);
    },
    [delay]
  );
}
