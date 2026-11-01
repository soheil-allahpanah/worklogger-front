"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { readSearchQuery, withSearchQuery } from "@/lib/search-query";

let cachedQuery = "";
let cacheReady = false;
const listeners = new Set<() => void>();

function emitSearch() {
  for (const listener of listeners) listener();
}

function readCachedQuery(): string {
  if (!cacheReady && typeof window !== "undefined") {
    cacheReady = true;
    cachedQuery = readSearchQuery(window.location.search);
  }
  return cachedQuery;
}

function onPopState() {
  cachedQuery = readSearchQuery(window.location.search);
  cacheReady = true;
  emitSearch();
}

function subscribeSearch(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("popstate", onPopState);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("popstate", onPopState);
  };
}

function writeQuery(next: string) {
  const current = readCachedQuery();
  if (current === next) return;
  cachedQuery = next;
  cacheReady = true;
  const qs = withSearchQuery(window.location.search, next);
  const url = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
  window.history.replaceState(window.history.state, "", url);
  emitSearch();
}

function subscribeHydration() {
  return () => {};
}

type SearchQueryContextValue = {
  search: string;
  debouncedSearch: string;
  hydrated: boolean;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  /** Update the query and the value queries use, without waiting out the typing debounce. */
  commitSearch: (value: string) => void;
};

const SearchQueryContext = createContext<SearchQueryContextValue | null>(null);

export function SearchQueryProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const search = useSyncExternalStore(subscribeSearch, readCachedQuery, () => "");
  const hydrated = useSyncExternalStore(subscribeHydration, () => true, () => false);
  // While the user is typing, hold the previous query so fetches wait 300ms.
  // Null means "follow the live query" (navigation, chips, saved filters, first paint).
  const [heldQuery, setHeldQuery] = useState<string | null>(null);
  const debouncedSearch = heldQuery ?? search;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fromUrl = readSearchQuery(window.location.search);
    if (!cacheReady || fromUrl === cachedQuery) return;
    cachedQuery = fromUrl;
    emitSearch();
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const setSearch = useCallback((action: React.SetStateAction<string>) => {
    const current = readCachedQuery();
    const next = typeof action === "function" ? action(current) : action;
    setHeldQuery((held) => held ?? current);
    writeQuery(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setHeldQuery(null), 300);
  }, []);

  const commitSearch = useCallback((value: string) => {
    if (timer.current) clearTimeout(timer.current);
    writeQuery(value);
    setHeldQuery(null);
  }, []);

  const value = useMemo(
    () => ({ search, debouncedSearch, hydrated, setSearch, commitSearch }),
    [search, debouncedSearch, hydrated, setSearch, commitSearch],
  );

  return <SearchQueryContext.Provider value={value}>{children}</SearchQueryContext.Provider>;
}

export function useSearchQuery() {
  const context = useContext(SearchQueryContext);
  if (!context) {
    throw new Error("useSearchQuery must be used within SearchQueryProvider");
  }
  return context;
}
