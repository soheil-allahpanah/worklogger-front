export const SAVED_FILTERS_KEY = "wl-saved-filters";

export type SavedFilter = {
  id: string;
  name: string;
  query: string;
};

export function parseSavedFilters(raw: string | null): SavedFilter[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const candidate = entry as Partial<SavedFilter>;
      if (
        typeof candidate.id !== "string" ||
        typeof candidate.name !== "string" ||
        typeof candidate.query !== "string"
      ) {
        return [];
      }
      const name = candidate.name.trim();
      const query = candidate.query.trim();
      if (!name || !query) return [];
      return [{ id: candidate.id, name, query }];
    });
  } catch {
    return [];
  }
}
