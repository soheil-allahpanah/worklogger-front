export const THEME_STORAGE_KEY = "wl-theme";

export type ThemeChoice = "light" | "dark";

/** Runs before paint so the persisted or system theme is applied without a flash. */
export const themeInitScript = `(function(){try{var stored=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});var theme=stored==="light"||stored==="dark"?stored:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");var root=document.documentElement;root.classList.remove("light","dark");root.classList.add(theme);root.style.colorScheme=theme;}catch(e){}})();`;
