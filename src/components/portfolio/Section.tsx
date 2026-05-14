import { useEffect, useRef, useState, type ReactNode } from "react";

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
  title?: ReactNode;
  caption?: string;
  body?: ReactNode;
  bodyByImage?: ReactNode[];
  images?: SectionImage[];
  /** Layout variant for image/text composition */
  variant?: "fullscreen" | "spread" | "gallery" | "text" | "split";
  /** Places image column on right side at md+ sizes */
  imageOnRight?: boolean;
  /** Hide built-in image next/prev controls */
  showImageNavigation?: boolean;
  /** Force transition key for externally controlled content (e.g. events carousel) */
  transitionKey?: string | number;
  /** Additional image URLs to preload for smooth transitions */
  preloadImageSources?: string[];
  onEnter?: (id: string, bg: string) => void;
  /** Replaces default vertical padding when set (e.g. tighter intro on mobile) */
  sectionClassName?: string;
  /** Below md: no min-screen height, content starts from top so e.g. menu + bio fit together */
  naturalHeightOnMobile?: boolean;
}

export function Section({
  id,
  bg,
  eyebrow,
  title,
  caption,
  body,
  bodyByImage,
  images = [],
  variant = "spread",
  imageOnRight = false,
  showImageNavigation = true,
  transitionKey,
  preloadImageSources,
  onEnter,
  sectionClassName,
  naturalHeightOnMobile = false,
}: SectionProps) {
  const ref = useRef<HTMLElement | null>(null);
  const preloadedSourcesRef = useRef<Set<string>>(new Set());
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const currentImage = images[activeImageIndex] ?? images[0];
  const currentBody = bodyByImage?.[activeImageIndex] ?? body;
  const imageTransitionKey = transitionKey ?? activeImageIndex;
  const shouldAnimateBody = transitionKey !== undefined || Boolean(bodyByImage);
  const bodyTransitionKey = transitionKey ?? activeImageIndex;
  const hasTextContent = Boolean(eyebrow || title || caption || currentBody);
  const hasImage = Boolean(currentImage);

  const showPrevImage = () => {
    if (images.length <= 1) return;
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const showNextImage = () => {
    if (images.length <= 1) return;
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  useEffect(() => {
    setActiveImageIndex((prev) => {
      if (images.length === 0) return 0;
      return Math.min(prev, images.length - 1);
    });
  }, [images.length]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const sources = preloadImageSources ?? images.map((image) => image.src);
    if (sources.length <= 1) return;

    for (const source of sources) {
      if (preloadedSourcesRef.current.has(source)) continue;
      const preloadImage = new Image();
      preloadImage.decoding = "async";
      preloadImage.src = source;
      preloadedSourcesRef.current.add(source);
    }
  }, [images, preloadImageSources]);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            if (entry.intersectionRatio > 0.45) onEnter?.(id, bg);
          } else {
            entry.target.classList.remove("in-view");
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
      className={[
        "relative w-full px-5 sm:px-6 md:px-16 lg:px-24 flex flex-col",
        naturalHeightOnMobile
          ? "max-md:min-h-0 max-md:justify-start md:min-h-screen md:justify-center"
          : "min-h-screen justify-center",
        sectionClassName ?? "py-24 sm:py-28 md:py-40",
      ].join(" ")}
    >
      <div
        className={
          hasImage && hasTextContent
            ? "grid md:grid-cols-12 gap-8 md:gap-16 items-center"
            : "flex justify-center"
        }
      >
        {hasImage && (
          <div
            className={`fade-up ${hasTextContent ? "md:col-span-7" : "w-full max-w-3xl"} ${
              hasTextContent && imageOnRight ? "md:order-2" : "md:order-1"
            }`}
          >
            <figure
              key={`image-${id}-${imageTransitionKey}`}
              className={`${currentImage.aspect ?? ""} content-swap`}
            >
              <img
                src={currentImage.src}
                alt={currentImage.alt}
                loading={images.length > 1 || transitionKey !== undefined ? "eager" : "lazy"}
                className="w-full h-[52vh] sm:h-[60vh] md:h-[80vh] object-contain"
              />
              {currentImage.caption && (
                <figcaption className="mt-3 max-w-3xl whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
                  {currentImage.caption}
                </figcaption>
              )}
            </figure>

            {showImageNavigation && images.length > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={showPrevImage}
                  className="px-4 py-2 border border-foreground/40 font-sans text-xs uppercase tracking-[0.18em] cursor-pointer transition-colors hover:bg-foreground/5"
                  aria-label="Forrige billede"
                >
                  ← Forrige
                </button>
                <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground font-sans">
                  {activeImageIndex + 1} / {images.length}
                </p>
                <button
                  type="button"
                  onClick={showNextImage}
                  className="px-4 py-2 border border-foreground/40 font-sans text-xs uppercase tracking-[0.18em] cursor-pointer transition-colors hover:bg-foreground/5"
                  aria-label="Næste billede"
                >
                  Næste →
                </button>
              </div>
            )}
          </div>
        )}

        {hasTextContent && (
          <aside
            className={`fade-up font-serif text-base md:text-lg leading-[1.7] text-foreground/85 space-y-5 md:space-y-6 ${
              hasImage ? "md:col-span-5" : "w-full max-w-3xl"
            } ${hasImage && imageOnRight ? "md:order-1" : "md:order-2"}`}
          >
            {eyebrow && (
              <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground font-sans">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
                {title}
              </h2>
            )}
            {caption && <p className="font-serif italic text-foreground/70">{caption}</p>}
            {currentBody && (
              <div
                key={shouldAnimateBody ? `body-${id}-${bodyTransitionKey}` : undefined}
                className={`space-y-5 text-[0.94rem] ${shouldAnimateBody ? "content-swap" : ""}`}
              >
                {currentBody}
              </div>
            )}
          </aside>
        )}
      </div>
    </section>
  );
}
