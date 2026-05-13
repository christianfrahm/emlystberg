import { useEffect, useState } from "react";

export type NavItem = { id: string; label: string; year?: string };

interface Props {
  items: NavItem[];
  activeId: string;
}

export function Sidebar({ items, activeId }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [activeId]);

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-sm border-b border-border/40">
        <a href="#top" className="font-serif text-lg italic">ida holm</a>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="text-xs uppercase tracking-[0.2em]"
        >
          {open ? "luk" : "menu"}
        </button>
      </header>

      <aside
        className={[
          "fixed z-30 inset-y-0 left-0 w-full md:w-72 lg:w-80",
          "bg-background/85 backdrop-blur-md md:bg-transparent md:backdrop-blur-none",
          "px-10 md:px-12 py-16 md:py-14",
          "flex flex-col justify-between",
          "transition-transform duration-500 ease-out",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        <div>
          <a href="#top" className="block">
            <h1 className="font-serif text-3xl leading-[1.05] tracking-tight">
              ida<br />holm
            </h1>
            <p className="mt-3 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
              visuel kunstner<br />&amp; poet
            </p>
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
                    className="group block"
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

        <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          © {new Date().getFullYear()} — Atelier København
        </div>
      </aside>
    </>
  );
}
