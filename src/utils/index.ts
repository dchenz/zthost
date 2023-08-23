import { useMediaQuery } from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";

export const useMobileView = () => {
  const [isMobileView] = useMediaQuery("(max-width: 600px)");

  return isMobileView;
};

export function usePersistentState<T>(
  name: string,
  defaultValue: T
): [T, (value: T) => void] {
  const storedState = useMemo(() => {
    const value = localStorage.getItem(name);
    if (value === null) {
      return defaultValue;
    }
    try {
      return JSON.parse(value);
    } catch {
      return defaultValue;
    }
  }, [name, defaultValue]);

  const [state, setState] = useState<T>(storedState);

  const setNewState = useCallback(
    (newState: T) => {
      localStorage.setItem(name, JSON.stringify(newState));
      setState(newState);
    },
    [name, setState]
  );

  return [state, setNewState];
}

export function formatBinarySize(n: number): string {
  if (n < 1024) {
    return `${n.toFixed(2)} B`;
  }
  n /= 1024;
  if (n < 1024) {
    return `${n.toFixed(2)} KB`;
  }
  n /= 1024;
  if (n < 1024) {
    return `${n.toFixed(2)} MB`;
  }
  n /= 1024;
  return `${n.toFixed(2)} GB`;
}

export function formatRelativeTime(date: Date): string {
  let n = (Date.now() - date.getTime()) / 1000;
  if (n < 60) {
    return "Just now";
  }
  n /= 60;
  if (n < 60) {
    return `${Math.floor(n)}min ago`;
  }
  n /= 60;
  if (n < 24) {
    return `${Math.floor(n)}hr ago`;
  }
  return date.toLocaleString();
}
