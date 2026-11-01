const TAG_COLORS = [
  {
    bg: "bg-[color-mix(in_srgb,var(--tag-teal)_15%,transparent)]",
    border: "border-[color-mix(in_srgb,var(--tag-teal)_60%,transparent)]",
    text: "text-[var(--tag-teal)]",
  },
  {
    bg: "bg-[color-mix(in_srgb,var(--tag-orange)_15%,transparent)]",
    border: "border-[color-mix(in_srgb,var(--tag-orange)_60%,transparent)]",
    text: "text-[var(--tag-orange)]",
  },
  {
    bg: "bg-[color-mix(in_srgb,var(--tag-purple)_15%,transparent)]",
    border: "border-[color-mix(in_srgb,var(--tag-purple)_60%,transparent)]",
    text: "text-[var(--tag-purple)]",
  },
  {
    bg: "bg-[color-mix(in_srgb,var(--tag-pink)_15%,transparent)]",
    border: "border-[color-mix(in_srgb,var(--tag-pink)_60%,transparent)]",
    text: "text-[var(--tag-pink)]",
  },
  {
    bg: "bg-[color-mix(in_srgb,var(--tag-blue)_15%,transparent)]",
    border: "border-[color-mix(in_srgb,var(--tag-blue)_60%,transparent)]",
    text: "text-[var(--tag-blue)]",
  },
  {
    bg: "bg-[color-mix(in_srgb,var(--tag-emerald)_15%,transparent)]",
    border: "border-[color-mix(in_srgb,var(--tag-emerald)_60%,transparent)]",
    text: "text-[var(--tag-emerald)]",
  },
];

export function getTagColor(tag: string) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

/** Fixed chip colors from the Figma quick-filter row. */
export const QUICK_FILTER_TAG_STYLES = {
  mahak: {
    bg: "bg-[color-mix(in_srgb,var(--tag-blue)_15%,transparent)]",
    border: "border-[color-mix(in_srgb,var(--tag-blue)_60%,transparent)]",
    text: "text-[var(--tag-blue)]",
  },
  trading: {
    bg: "bg-[color-mix(in_srgb,var(--tag-pink)_15%,transparent)]",
    border: "border-[color-mix(in_srgb,var(--tag-pink)_60%,transparent)]",
    text: "text-[var(--tag-pink)]",
  },
  linux: {
    bg: "bg-[color-mix(in_srgb,var(--tag-purple)_15%,transparent)]",
    border: "border-[color-mix(in_srgb,var(--tag-purple)_60%,transparent)]",
    text: "text-[var(--tag-purple)]",
  },
} as const;
