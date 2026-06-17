/** Fixed site background — butter (was oklch(0.9 0.2 105)). Hex for consistent mobile/browser rendering. */
export const BUTTER = "#f3e300" as const;

/** Safari / mobile browser chrome — keep in sync with index.html theme-color meta. */
export const THEME_COLOR_META = { name: "theme-color", content: BUTTER } as const;
