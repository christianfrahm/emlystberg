import { useEffect, useRef, type ReactNode } from "react";

export type SectionImage = {
  src: string;
  alt: string;
  caption?: string;
  /** Optional aspect override e.g. "aspect-[4/5]" */
  aspect?: string;
};

export interface SectionProps {
  id: string;
  /** CSS color (use var(--xxx)) used as the section background while in view */
  bg: string;
  eyebrow?: string;
  title?: string;
  caption?: string;
  body?: ReactNode;
  images?: SectionImage[];
  /** Layout variant for image/text composition */
  variant?: "fullscreen" | "spread" | "gallery" | "text" | "split";
  onEnter?: (id: string, bg: string) => void;
}

export function Section({
  id,
  bg,
  eyebrow,
  title,
  caption,
  body,
  images = [],
  variant = "spread",
  onEnter,
}: SectionProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            if (entry.intersectionRatio > 0.45) onEnter?.(id, bg);
          }
        }
      },
      { threshold: [0.15, 0.5, 0.75], rootMargin: "-10% 0px -10% 0px" },
    );
    io.observe(el);
    el.querySelectorAll<HTMLElement>(".fade-up").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [id, bg, onEnter]);

  return (
    <section
      ref={ref}
      id={id}
      className="relative min-h-screen w-full px-8 md:px-16 lg:px-24 py-32 md:py-40 flex flex-col justify-center"
    >
      {(eyebrow || title || caption) && (
        <header className="fade-up max-w-3xl mb-16 md:mb-24">
          {eyebrow && (
            <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground mb-6">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
              {title}
            </h2>
          )}
          {caption && (
            <p className="mt-6 font-serif italic text-lg text-foreground/70 max-w-xl">
              {caption}
            </p>
          )}
        </header>
      )}

      {variant === "fullscreen" && images[0] && (
        <figure className="fade-up mx-auto w-full max-w-5xl">
          <img
            src={images[0].src}
            alt={images[0].alt}
            loading="lazy"
            className="w-full h-auto object-cover shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)]"
          />
          {images[0].caption && (
            <figcaption className="mt-4 text-xs uppercase tracking-[0.24em] text-muted-foreground">
              {images[0].caption}
            </figcaption>
          )}
        </figure>
      )}

      {variant === "spread" && (
        <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-start">
          {images[0] && (
            <figure className={`fade-up md:col-span-7 ${images[0].aspect ?? ""}`}>
              <img
                src={images[0].src}
                alt={images[0].alt}
                loading="lazy"
                className="w-full h-auto object-cover"
              />
              {images[0].caption && (
                <figcaption className="mt-3 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  {images[0].caption}
                </figcaption>
              )}
            </figure>
          )}
          {body && (
            <div className="fade-up md:col-span-4 md:col-start-9 md:pt-24 font-serif text-lg leading-[1.7] text-foreground/80 space-y-5">
              {body}
            </div>
          )}
        </div>
      )}

      {variant === "split" && (
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          {images[0] && (
            <figure className="fade-up">
              <img
                src={images[0].src}
                alt={images[0].alt}
                loading="lazy"
                className="w-full h-auto object-cover grayscale"
              />
              {images[0].caption && (
                <figcaption className="mt-3 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  {images[0].caption}
                </figcaption>
              )}
            </figure>
          )}
          {body && (
            <div className="fade-up font-serif text-lg leading-[1.8] text-foreground/85 space-y-5 max-w-md">
              {body}
            </div>
          )}
        </div>
      )}

      {variant === "gallery" && images.length > 0 && (
        <div className="grid md:grid-cols-12 gap-6 md:gap-10">
          {images.map((img, i) => (
            <figure
              key={i}
              className={[
                "fade-up",
                i % 3 === 0 ? "md:col-span-7" : i % 3 === 1 ? "md:col-span-5 md:mt-24" : "md:col-span-6 md:col-start-4",
              ].join(" ")}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="w-full h-auto object-cover"
              />
              {img.caption && (
                <figcaption className="mt-3 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      {variant === "text" && body && (
        <div className="fade-up max-w-2xl mx-auto font-serif text-2xl md:text-3xl leading-[1.5] text-foreground/85 space-y-8">
          {body}
        </div>
      )}
    </section>
  );
}
