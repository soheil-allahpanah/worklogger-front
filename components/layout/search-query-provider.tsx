"use client";

import { createContext, useContext, useState } from "react";

type SearchQueryContextValue = {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
};

const SearchQueryContext = createContext<SearchQueryContextValue | null>(null);

export function SearchQueryProvider({ children }: { children: React.ReactNode }) {
  const [search, setSearch] = useState("");

  return (
    <SearchQueryContext.Provider value={{ search, setSearch }}>
      {children}
    </SearchQueryContext.Provider>
  );
}

export function useSearchQuery() {
  const context = useContext(SearchQueryContext);
  if (!context) {
    throw new Error("useSearchQuery must be used within SearchQueryProvider");
  }
  return context;
}
