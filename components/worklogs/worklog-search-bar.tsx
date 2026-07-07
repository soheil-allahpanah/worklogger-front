"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export function WorklogSearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by date (1405/4/3.., ..1405/4/3), duration (2h.., ..30m, 1h..4h), tags (#tag), description..."
        className="h-10 rounded-xl border-border/80 bg-surface pl-10 pr-10 text-sm"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
