export function isMobileViewport() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
}

let subsectionScrollInProgress = false;

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

  if (!hashId) return;

  if (hashId === "top") {
    window.scrollTo({ top: 0, behavior: "auto" });
    return;
  }

  if (hashId === "bottom") {
    window.scrollTo({ top: getMaxScrollTop(), behavior: "auto" });
    return;
  }

  const target = document.getElementById(hashId);
  if (!target) return;

  requestAnimationFrame(() => {
    window.scrollTo({ top: getSectionScrollTop(target), behavior: "auto" });
  });
}

export function scrollToTop() {
  subsectionScrollInProgress = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
  stripUrlHash();

  window.setTimeout(() => {
    subsectionScrollInProgress = false;
  }, 700);
}

function getSubsectionBoundsElement(section: HTMLElement) {
  return (
    section.querySelector<HTMLElement>("[data-image-carousel]") ??
    section.querySelector<HTMLElement>("[data-subsection-content]") ??
    section
  );
}

export function getSectionScrollTop(target: HTMLElement) {
  if (target.dataset.scrollAlign === "start" || isMobileViewport()) {
    return target.getBoundingClientRect().top + window.scrollY;
  }

  const rect = target.getBoundingClientRect();
  const absoluteTop = rect.top + window.scrollY;
  const centeredTop = absoluteTop + Math.max(0, (rect.height - window.innerHeight) / 2);
  const maxScrollTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  return Math.min(centeredTop, maxScrollTop);
}

export function scrollToSection(targetId: string) {
  const target = document.getElementById(targetId);
  if (!target) return;

  subsectionScrollInProgress = true;
  const targetTop = getSectionScrollTop(target);
  window.scrollTo({ top: targetTop, behavior: "smooth" });
  stripUrlHash();

  const settleAndCorrect = () => {
    const correctedTop = getSectionScrollTop(target);
    if (Math.abs(window.scrollY - correctedTop) > 2) {
      window.scrollTo({ top: correctedTop, behavior: "auto" });
    }
  };

  const releaseScrollLock = () => {
    subsectionScrollInProgress = false;
  };

  requestAnimationFrame(() => requestAnimationFrame(settleAndCorrect));
  window.setTimeout(settleAndCorrect, 450);
  window.setTimeout(releaseScrollLock, 700);
}

function getMaxScrollTop() {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

function isAtPageBottom() {
  return Math.abs(window.scrollY - getMaxScrollTop()) <= 2;
}

export function scrollToPageBottom() {
  subsectionScrollInProgress = true;
  window.scrollTo({ top: getMaxScrollTop(), behavior: "smooth" });
  stripUrlHash();

  window.setTimeout(() => {
    subsectionScrollInProgress = false;
  }, 700);
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
    if (subsectionScrollInProgress) return;

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
