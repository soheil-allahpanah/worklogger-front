"use client";

import { Search } from "lucide-react";
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
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search logs by date, duration, description, tags, or projects..."
        className="h-12 rounded-xl border-border/80 bg-surface pl-11 text-base"
      />
    </div>
  );
}
