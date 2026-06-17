/** Fixed site background — bone yellow (was oklch(0.93 0.16 85)). Hex for consistent mobile/browser rendering. */
export const SITE_BACKGROUND = "#ffdf58" as const;

/** Safari / mobile browser chrome — keep in sync with index.html theme-color meta. */
export const THEME_COLOR_META = { name: "theme-color", content: SITE_BACKGROUND } as const;
