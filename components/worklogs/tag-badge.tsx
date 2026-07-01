import { getTagColor } from "@/lib/tag-colors";
import { cn } from "@/lib/utils";

export function TagBadge({
  tag,
  className,
}: {
  tag: string;
  className?: string;
}) {
  const colors = getTagColor(tag);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        colors.bg,
        colors.border,
        colors.text,
        className,
      )}
    >
      #{tag}
    </span>
  );
}
