export function isMobileViewport() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
}

let subsectionScrollInProgress = false;
let scrollLockReleaseTimer: number | null = null;
let scrollSettleCleanup: (() => void) | null = null;

function getCleanUrl() {
  return window.location.pathname + window.location.search;
}

export function stripUrlHash() {
  if (typeof window === "undefined" || !window.location.hash) return;
  window.history.replaceState(null, "", getCleanUrl());
}

export function consumeInitialHashScroll() {
  if (typeof window === "undefined") return;

  const hashId = window.location.hash.replace(/^#/, "");
  stripUrlHash();

  if (!hashId || hashId === "top") {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    return;
  }

  if (hashId === "bottom") {
    window.scrollTo({ top: getMaxScrollTop(), behavior: "auto" });
    return;
  }

  const target = document.getElementById(hashId);
  if (!target) {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    return;
  }

  requestAnimationFrame(() => {
    window.scrollTo({ top: getSectionScrollTop(target), behavior: "auto" });
  });
}

function clearScrollLockTimers() {
  if (scrollLockReleaseTimer) {
    window.clearTimeout(scrollLockReleaseTimer);
    scrollLockReleaseTimer = null;
  }
  if (scrollSettleCleanup) {
    scrollSettleCleanup();
    scrollSettleCleanup = null;
  }
}

function beginScrollLock() {
  clearScrollLockTimers();
  subsectionScrollInProgress = true;
}

/**
 * Keep arrow-key nav locked until scroll actually settles near `targetTop`
 * (or until a safety timeout), so rapid up/down presses can't interrupt mid-animation.
 */
function releaseScrollLockWhenSettled(targetTop: number, onSettled?: () => void) {
  const settleThreshold = 4;
  const idleMs = 120;
  const maxWaitMs = 1600;
  let lastScrollY = window.scrollY;
  let idleTimer: number | null = null;

  const finish = () => {
    clearScrollLockTimers();
    onSettled?.();
    subsectionScrollInProgress = false;
  };

  const tryFinish = () => {
    if (Math.abs(window.scrollY - targetTop) <= settleThreshold) {
      finish();
      return true;
    }
    return false;
  };

  const onScroll = () => {
    lastScrollY = window.scrollY;
    if (idleTimer) window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => {
      if (Math.abs(window.scrollY - lastScrollY) > settleThreshold) return;
      // Close enough: unlock without snapping (avoids a visible micro-jump).
      if (Math.abs(window.scrollY - targetTop) <= 24) {
        finish();
        return;
      }
      window.scrollTo({ top: targetTop, behavior: "auto" });
      finish();
    }, idleMs);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  scrollSettleCleanup = () => {
    window.removeEventListener("scroll", onScroll);
    if (idleTimer) window.clearTimeout(idleTimer);
  };

  // Already there (tiny jump / same section).
  if (tryFinish()) return;

  scrollLockReleaseTimer = window.setTimeout(() => {
    if (Math.abs(window.scrollY - targetTop) > 24) {
      window.scrollTo({ top: targetTop, behavior: "auto" });
    }
    finish();
  }, maxWaitMs);
}

export function scrollToTop() {
  beginScrollLock();
  const targetTop = 0;
  window.scrollTo({ top: targetTop, behavior: "smooth" });
  stripUrlHash();
  releaseScrollLockWhenSettled(targetTop);
}

function getSubsectionBoundsElement(section: HTMLElement) {
  return (
    section.querySelector<HTMLElement>("[data-image-carousel]") ??
    section.querySelector<HTMLElement>("[data-subsection-content]") ??
    section
  );
}

function getScrollFocusElement(target: HTMLElement) {
  // Prefer the artwork itself so short/last sections (naturalHeight) still land
  // with the image centered, matching min-h-screen sections.
  return (
    target.querySelector<HTMLElement>("[data-image-carousel]") ??
    target.querySelector<HTMLElement>("figure") ??
    getSubsectionBoundsElement(target)
  );
}

export function getSectionScrollTop(target: HTMLElement) {
  if (target.dataset.scrollAlign === "start" || isMobileViewport()) {
    return target.getBoundingClientRect().top + window.scrollY;
  }

  const focusEl = getScrollFocusElement(target);
  const rect = focusEl.getBoundingClientRect();
  const absoluteTop = rect.top + window.scrollY;
  // Allow negative offset when focus is shorter than the viewport, so it
  // truly centers instead of sticking to the top of the section.
  const centeredTop = absoluteTop + (rect.height - window.innerHeight) / 2;
  const maxScrollTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  return Math.min(Math.max(0, centeredTop), maxScrollTop);
}

export function scrollToSection(targetId: string) {
  const target = document.getElementById(targetId);
  if (!target) return;

  beginScrollLock();
  const targetTop = getSectionScrollTop(target);
  window.scrollTo({ top: targetTop, behavior: "smooth" });
  stripUrlHash();
  // Stick to the target computed at scroll start — recalculating after settle
  // causes a visible micro-jump (fonts/images/fade-up settling).
  releaseScrollLockWhenSettled(targetTop);
}

function getMaxScrollTop() {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

function isAtPageBottom() {
  return Math.abs(window.scrollY - getMaxScrollTop()) <= 2;
}

export function scrollToPageBottom() {
  beginScrollLock();
  const targetTop = getMaxScrollTop();
  window.scrollTo({ top: targetTop, behavior: "smooth" });
  stripUrlHash();
  releaseScrollLockWhenSettled(targetTop);
}

function isSubsectionVisible(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  const boundsEl = getSubsectionBoundsElement(el);
  const rect = boundsEl.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

export function getVisibleSubsectionIds(subsectionIds: string[]) {
  return subsectionIds.filter(isSubsectionVisible);
}

function isViewportCenterInElement(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const viewportCenter = window.innerHeight / 2;
  return rect.top <= viewportCenter && rect.bottom >= viewportCenter;
}

export function getCurrentSubsectionId(subsectionIds: string[]) {
  const visibleIds = getVisibleSubsectionIds(subsectionIds);
  if (visibleIds.length === 0) return null;

  let centerMatchId: string | null = null;
  let bestId = visibleIds[0];
  let bestDistance = Number.POSITIVE_INFINITY;
  const viewportCenter = window.innerHeight / 2;

  for (const id of visibleIds) {
    const section = document.getElementById(id);
    if (!section) continue;

    const boundsEl = getSubsectionBoundsElement(section);
    const rect = boundsEl.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= window.innerHeight) continue;

    if (isViewportCenterInElement(boundsEl)) {
      centerMatchId = id;
    }

    const center = rect.top + rect.height / 2;
    const distance = Math.abs(center - viewportCenter);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestId = id;
    }
  }

  return centerMatchId ?? bestId;
}

export function getNextSubsectionId(currentId: string, subsectionIds: string[]) {
  const visibleIds = getVisibleSubsectionIds(subsectionIds);
  const index = visibleIds.indexOf(currentId);
  if (index === -1 || index >= visibleIds.length - 1) return null;
  return visibleIds[index + 1];
}

export function getPreviousSubsectionId(currentId: string, subsectionIds: string[]) {
  const visibleIds = getVisibleSubsectionIds(subsectionIds);
  const index = visibleIds.indexOf(currentId);
  if (index <= 0) return null;
  return visibleIds[index - 1];
}

export function getLastSubsectionId(subsectionIds: string[]) {
  const visibleIds = getVisibleSubsectionIds(subsectionIds);
  return visibleIds.at(-1) ?? null;
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

export function setupSubsectionKeyboardNav(subsectionIds: string[]) {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    if (isTypingTarget(event.target)) return;

    // Always swallow up/down while a section scroll is animating, so the
    // browser's native page scroll can't fight the smooth scroll.
    if (subsectionScrollInProgress) {
      event.preventDefault();
      return;
    }

    const lastId = getLastSubsectionId(subsectionIds);

    if (event.key === "ArrowUp") {
      if (isAtPageBottom()) {
        if (!lastId) return;
        event.preventDefault();
        scrollToSection(lastId);
        return;
      }

      const currentId = getCurrentSubsectionId(subsectionIds);
      if (!currentId) return;

      const previousId = getPreviousSubsectionId(currentId, subsectionIds);
      if (!previousId) return;

      event.preventDefault();
      scrollToSection(previousId);
      return;
    }

    if (isAtPageBottom()) return;

    const currentId = getCurrentSubsectionId(subsectionIds);
    if (currentId && lastId && currentId === lastId) {
      event.preventDefault();
      scrollToPageBottom();
      return;
    }

    if (!currentId) return;

    const nextId = getNextSubsectionId(currentId, subsectionIds);
    if (!nextId) return;

    event.preventDefault();
    scrollToSection(nextId);
  };

  document.addEventListener("keydown", handleKeyDown, true);
  return () => document.removeEventListener("keydown", handleKeyDown, true);
}
