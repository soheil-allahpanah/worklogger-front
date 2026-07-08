export const DEFAULT_PAGE_SIZE = 30;
export const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100] as const;

export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];
