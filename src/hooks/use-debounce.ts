'use client';

import { useEffect, useState } from 'react';

/**
 * Debounces a value by the specified delay.
 * The returned value only updates after the input has been
 * stable for `delay` milliseconds — preventing a downstream
 * effect from firing on every single keystroke.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear the timer if value changes before delay expires
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
