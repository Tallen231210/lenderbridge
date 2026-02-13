/**
 * Generic debounce hook — delays updating the returned value until
 * the input stops changing for the specified delay (default 300ms).
 * Used to prevent firing expensive queries on every keystroke.
 */
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
