const TAG_COLORS = [
  { bg: "bg-teal-500/15", border: "border-teal-400/60", text: "text-teal-300" },
  { bg: "bg-orange-500/15", border: "border-orange-400/60", text: "text-orange-300" },
  { bg: "bg-purple-500/15", border: "border-purple-400/60", text: "text-purple-300" },
  { bg: "bg-pink-500/15", border: "border-pink-400/60", text: "text-pink-300" },
  { bg: "bg-blue-500/15", border: "border-blue-400/60", text: "text-blue-300" },
  { bg: "bg-emerald-500/15", border: "border-emerald-400/60", text: "text-emerald-300" },
];

export function getTagColor(tag: string) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}
