import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { isMobileViewport, scrollToSection, scrollToTop } from "@/lib/section-scroll";

export type NavItem = { id: string; label: string; year?: string; scrollTargetId?: string };

interface Props {
  items: NavItem[];
  activeId: string;
  backgroundColor?: string;
  onMenuClose?: () => void;
  onMenuStateChange?: (isOpen: boolean) => void;
}

export function Sidebar({
  items,
  activeId,
  backgroundColor = "var(--background)",
  onMenuClose,
  onMenuStateChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const notifyMenuClosed = useCallback(() => {
    requestAnimationFrame(() => onMenuClose?.());
  }, [onMenuClose]);

  const scrollWithOffset = useCallback(
    (targetId: string) => {
      scrollToSection(targetId);
      notifyMenuClosed();
    },
    [notifyMenuClosed],
  );

  const scrollToItem = useCallback(
    (item: NavItem) => {
      scrollWithOffset(item.scrollTargetId ?? item.id);
    },
    [scrollWithOffset],
  );

  useEffect(() => {
    setOpen(false);
    if (isMobileViewport()) {
      notifyMenuClosed();
    }
  }, [activeId, isMobileViewport, notifyMenuClosed]);

  useEffect(() => {
    onMenuStateChange?.(open);
  }, [open, onMenuStateChange]);

  return (
    <>
      <nav
        aria-label="Afsnit"
        className="md:hidden w-full px-5 pb-8 pt-[calc(env(safe-area-inset-top)+5rem)]"
      >
        <ul className="space-y-7 font-serif text-lg leading-snug tracking-tight">
          {items.map((item) => {
            const active = activeId === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={[
                    "block py-0.5 text-left transition-colors",
                    active ? "text-foreground" : "text-foreground/55",
                  ].join(" ")}
                  onClick={() => {
                    scrollToItem(item);
                    notifyMenuClosed();
                  }}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <aside
        className={[
          "hidden md:sticky md:top-0 md:self-start md:shrink-0 md:z-30 md:flex md:w-72 md:h-screen lg:w-80",
          "mobile-menu-panel",
          "md:px-12 md:py-14",
          "flex-col justify-between",
          "overflow-y-auto",
        ].join(" ")}
        style={
          {
            "--mobile-menu-background": backgroundColor,
          } as CSSProperties
        }
      >
        <div>
          <button
            type="button"
            className="block text-left"
            onClick={() => {
              scrollToTop();
              setOpen(false);
              if (isMobileViewport()) {
                notifyMenuClosed();
              }
            }}
          >
            <h1 className="font-serif text-3xl leading-[1.05] tracking-tight">
              emilie
              <br />
              lystberg
            </h1>
          </button>
        </div>

        <nav className="my-12 md:my-0">
          <ul className="space-y-5">
            {items.map((item) => {
              const active = activeId === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className="group block py-1.5 text-left"
                    onClick={() => {
                      scrollToItem(item);
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
                          active
                            ? "text-foreground"
                            : "text-foreground/55 group-hover:text-foreground",
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
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
