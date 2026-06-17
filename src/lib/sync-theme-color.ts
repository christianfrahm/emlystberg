/** Keep browser chrome (status bar, overscroll) identical to the page background. */
export function syncThemeColorFromBackground() {
  const resolved = getComputedStyle(document.documentElement).backgroundColor;
  if (!resolved) return;

  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", resolved);
}
