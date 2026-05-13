import { useEffect, useState } from "react";

export type NavItem = { id: string; label: string; year?: string };

interface Props {
  items: NavItem[];
  activeId: string;
  onMenuClose?: () => void;
}

export function Sidebar({ items, activeId, onMenuClose }: Props) {
  const [open, setOpen] = useState(false);
  const isMobileViewport = () => window.matchMedia("(max-width: 767px)").matches;
  const notifyMenuClosed = () => {
    requestAnimationFrame(() => onMenuClose?.());
  };

  const getCenteredTop = (target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    const absoluteTop = rect.top + window.scrollY;
    const centeredTop = absoluteTop + Math.max(0, (rect.height - window.innerHeight) / 2);
    const maxScrollTop = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    return Math.min(centeredTop, maxScrollTop);
  };

  const scrollWithOffset = (targetId: string) => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const targetTop = isMobileViewport()
      ? target.getBoundingClientRect().top + window.scrollY
      : getCenteredTop(target);
    window.scrollTo({ top: targetTop, behavior: "smooth" });
    window.history.replaceState(null, "", `#${targetId}`);

    const settleAndCorrect = () => {
      const correctedTop = isMobileViewport()
        ? target.getBoundingClientRect().top + window.scrollY
        : getCenteredTop(target);
      if (Math.abs(window.scrollY - correctedTop) > 2) {
        window.scrollTo({ top: correctedTop, behavior: "auto" });
      }
    };

    requestAnimationFrame(() => requestAnimationFrame(settleAndCorrect));
    window.setTimeout(settleAndCorrect, 450);
  };

  const alignHashTargetToCenter = () => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;

    const target = document.getElementById(hash);
    if (!target) return;

    const correctedTop = isMobileViewport()
      ? target.getBoundingClientRect().top + window.scrollY
      : getCenteredTop(target);
    if (Math.abs(window.scrollY - correctedTop) > 2) {
      window.scrollTo({ top: correctedTop, behavior: "auto" });
    }
  };

  useEffect(() => {
    setOpen(false);
    if (isMobileViewport()) {
      notifyMenuClosed();
    }
  }, [activeId]);

  useEffect(() => {
    const runInitialAlignment = () => {
      requestAnimationFrame(() => requestAnimationFrame(alignHashTargetToCenter));
      window.setTimeout(alignHashTargetToCenter, 250);
      window.setTimeout(alignHashTargetToCenter, 600);
      window.setTimeout(alignHashTargetToCenter, 1200);
    };

    runInitialAlignment();
    window.addEventListener("hashchange", runInitialAlignment);
    window.addEventListener("load", runInitialAlignment);

    return () => {
      window.removeEventListener("hashchange", runInitialAlignment);
      window.removeEventListener("load", runInitialAlignment);
    };
  }, []);

  return (
    <>
      {/* Mobile top bar */}
      <header
        className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-end px-4 pb-3 bg-[rgba(107,114,128,0.1)] backdrop-blur-sm border-b border-white/20"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
      >
        <button
          onClick={() =>
            setOpen((v) => {
              const next = !v;
              if (!next) {
                notifyMenuClosed();
              }
              return next;
            })
          }
          aria-label="Toggle menu"
          className="h-10 w-10 inline-flex items-center justify-center text-foreground/80 hover:text-foreground transition-colors"
        >
          {open ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path
                d="M4 7H20M4 12H20M4 17H20"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </header>

      <aside
        className={[
          "fixed z-30 inset-y-0 left-0 w-full md:w-72 lg:w-80",
          "bg-background/85 backdrop-blur-md md:bg-transparent md:backdrop-blur-none",
          "px-6 sm:px-8 md:px-12 pt-24 pb-10 md:py-14",
          "flex flex-col justify-between",
          "overflow-y-auto",
          "transition-transform duration-500 ease-out",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        <div>
          <a
            href="#top"
            className="block"
            onClick={(event) => {
              event.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
              window.history.replaceState(null, "", "#top");
              setOpen(false);
              if (isMobileViewport()) {
                notifyMenuClosed();
              }
            }}
          >
            <h1 className="font-serif text-3xl leading-[1.05] tracking-tight">
              emilie<br />lystberg
            </h1>
          </a>
        </div>

        <nav className="my-12 md:my-0">
          <ul className="space-y-5">
            {items.map((item) => {
              const active = activeId === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="group block py-1.5"
                    onClick={(event) => {
                      event.preventDefault();
                      scrollWithOffset(item.id);
                      setOpen(false);
                      if (isMobileViewport()) {
                        notifyMenuClosed();
                      }
                    }}
                  >
                    <div className="flex items-baseline gap-3">
                      <span
                        aria-hidden
                        className={[
                          "h-px transition-all duration-500",
                          active ? "w-8 bg-foreground" : "w-2 bg-foreground/40 group-hover:w-5",
                        ].join(" ")}
                      />
                      <span
                        className={[
                          "font-serif text-base leading-snug transition-colors",
                          active ? "text-foreground" : "text-foreground/55 group-hover:text-foreground",
                        ].join(" ")}
                      >
                        {item.label}
                        {item.year && (
                          <span className="ml-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground align-middle">
                            {item.year}
                          </span>
                        )}
                      </span>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

      </aside>
    </>
  );
}
