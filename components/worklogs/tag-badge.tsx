import { getTagColor } from "@/lib/tag-colors";
import { cn } from "@/lib/utils";

export function TagBadge({
  tag,
  className,
  onClick,
}: {
  tag: string;
  className?: string;
  onClick?: (tag: string) => void;
}) {
  const colors = getTagColor(tag);
  const sharedClassName = cn(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
    colors.bg,
    colors.border,
    colors.text,
    onClick &&
      "cursor-pointer transition-all hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
    className,
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={() => onClick(tag)}
        className={sharedClassName}
        aria-label={`Filter by tag ${tag}`}
      >
        #{tag}
      </button>
    );
  }

  return <span className={sharedClassName}>#{tag}</span>;
}
