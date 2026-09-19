"use client";

import { useEffect, useRef, useState } from "react";
import { RELOAD_EVENT } from "@/lib/design/project";

export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  const skipWrite = useRef(true);

  useEffect(() => {
    function load() {
      skipWrite.current = true;
      try {
        const raw = localStorage.getItem(key);
        if (raw) setValue({ ...initial, ...JSON.parse(raw) });
        else setValue(initial);
      } catch {
        setValue(initial);
      }
    }
    load();
    setReady(true);
    window.addEventListener(RELOAD_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(RELOAD_EVENT, load);
      window.removeEventListener("storage", load);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    if (skipWrite.current) {
      skipWrite.current = false;
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore quota */
    }
  }, [key, value, ready]);

  return [value, setValue, ready] as const;
}
