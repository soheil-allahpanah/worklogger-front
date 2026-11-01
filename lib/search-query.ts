export const SEARCH_QUERY_PARAM = "q";

function paramsFrom(search: string): URLSearchParams {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  return new URLSearchParams(raw);
}

/** Read the shared worklog filter from a location search string. */
export function readSearchQuery(search: string): string {
  return paramsFrom(search).get(SEARCH_QUERY_PARAM) ?? "";
}

/** Return the query string (no leading `?`) with the shared filter written or removed. */
export function withSearchQuery(search: string, query: string): string {
  const params = paramsFrom(search);
  if (query) params.set(SEARCH_QUERY_PARAM, query);
  else params.delete(SEARCH_QUERY_PARAM);
  return params.toString();
}

export function hrefWithSearchQuery(path: string, query: string): string {
  const next = withSearchQuery("", query);
  return next ? `${path}?${next}` : path;
}
