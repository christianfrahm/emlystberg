import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { markImagePreloaded, preloadImage, waitForImageReady } from "@/lib/preload-images";

type CarouselRegistration = {
  getActiveIndex: () => number;
  getLength: () => number;
  goTo: (index: number) => void;
};

const carouselRegistry = new Map<string, CarouselRegistration>();
let carouselKeyListenerAttached = false;

function isCarouselInContext(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;

  const viewportCenter = window.innerHeight / 2;
  return rect.top <= viewportCenter && rect.bottom >= viewportCenter;
}

function getPrimaryVisibleCarousel() {
  const carousels = document.querySelectorAll<HTMLElement>("[data-image-carousel]");
  let best: HTMLElement | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const carousel of carousels) {
    if (!isCarouselInContext(carousel)) continue;
    const rect = carousel.getBoundingClientRect();
    const distance = Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = carousel;
    }
  }

  return best;
}

function handleCarouselKeyDown(event: KeyboardEvent) {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) return;

  const carouselEl = getPrimaryVisibleCarousel();
  if (!carouselEl) return;

  const sectionId = carouselEl.dataset.imageCarousel;
  if (!sectionId) return;

  const registration = carouselRegistry.get(sectionId);
  if (!registration || registration.getLength() <= 1) return;

  const index = registration.getActiveIndex();
  const length = registration.getLength();
  const nextIndex =
    event.key === "ArrowLeft"
      ? Math.max(0, index - 1)
      : Math.min(length - 1, index + 1);

  if (nextIndex === index) {
    event.preventDefault();
    return;
  }

  event.preventDefault();
  registration.goTo(nextIndex);
}

function registerCarousel(sectionId: string, registration: CarouselRegistration) {
  carouselRegistry.set(sectionId, registration);
  if (!carouselKeyListenerAttached && typeof window !== "undefined") {
    document.addEventListener("keydown", handleCarouselKeyDown, true);
    carouselKeyListenerAttached = true;
  }

  return () => {
    carouselRegistry.delete(sectionId);
  };
}

export type SectionImage = {
  src: string;
  alt: string;
  caption?: string;
  /** Optional aspect override e.g. "aspect-[4/5]" */
  aspect?: string;
};

export type SectionVideo = {
  src: string;
  /** Optional aspect override on the outer figure */
  aspect?: string;
  /** How the video fills the artwork frame (default: cover to match 3:4 paintings) */
  objectFit?: "contain" | "cover";
  /**
   * Size video in the same 3:4 frame as portrait artworks (default: true).
   * Portrait phone footage is narrower than paintings and looks smaller with contain.
   */
  artworkFrame?: boolean;
  /** Full viewport width on mobile (default: true for artwork-framed videos) */
  edgeToEdgeOnMobile?: boolean;
  /** Hide the section from md breakpoint and up */
  mobileOnly?: boolean;
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
  video?: SectionVideo;
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
  /** Content-sized height at all breakpoints (e.g. last section before footer) */
  naturalHeight?: boolean;
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
  video,
  variant = "spread",
  imageOnRight = false,
  showImageNavigation = true,
  transitionKey,
  preloadImageSources,
  onEnter,
  sectionClassName,
  naturalHeightOnMobile = false,
  naturalHeight = false,
}: SectionProps) {
  const ref = useRef<HTMLElement | null>(null);
  const enterDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const touchLastRef = useRef<{ x: number; t: number } | null>(null);
  const dragAxisRef = useRef<"x" | "y" | null>(null);
  const dragOffsetRef = useRef(0);
  const carouselFrameRef = useRef<HTMLDivElement | null>(null);
  const carouselTransitionRef = useRef(false);
  const carouselNavRef = useRef({
    activeImageIndex: 0,
    imagesLength: 0,
    goTo: (_index: number) => {},
  });
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [carouselDirection, setCarouselDirection] = useState<1 | -1 | null>(null);
  const [carouselInstant, setCarouselInstant] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const currentImage = images[activeImageIndex] ?? images[0];
  const currentBody = bodyByImage?.[activeImageIndex] ?? body;
  const shouldAnimateBody = transitionKey !== undefined || Boolean(bodyByImage);
  const bodyTransitionKey = transitionKey ?? activeImageIndex;
  const imageSrcFingerprint = images.map((image) => image.src).join("|");
  const preloadFingerprint = preloadImageSources?.join("|") ?? "";
  const hasTextContent = Boolean(eyebrow || title || caption || currentBody);
  const hasImage = Boolean(currentImage);
  const hasVideo = Boolean(video);
  const hasMedia = hasImage || hasVideo;
  const mediaAspect = currentImage?.aspect ?? video?.aspect ?? "";
  const mediaFrameClassName =
    "w-full max-md:aspect-[3/4] max-md:h-auto md:h-[80vh]";
  const mediaFitClassName = "block h-full w-full object-contain";
  const videoFitClassName =
    video?.objectFit === "contain"
      ? "block h-full w-full object-contain"
      : "block h-full w-full object-cover";
  const useArtworkVideoFrame = video?.artworkFrame ?? true;
  const edgeToEdgeOnMobile =
    video?.edgeToEdgeOnMobile ?? (useArtworkVideoFrame && !hasTextContent);
  const mediaColumnClassName = "w-full md:col-span-7";
  const artworkFrameClassName = edgeToEdgeOnMobile
    ? "w-full overflow-hidden max-md:aspect-[3/4] max-md:h-auto md:mx-auto md:h-[80vh] md:w-auto md:max-w-full md:aspect-[3/4]"
    : "mx-auto h-[52vh] sm:h-[60vh] md:h-[80vh] w-auto max-w-full aspect-[3/4] overflow-hidden";

  const loadImage = useCallback((src: string) => preloadImage(src), []);

  const getCarouselImageElement = useCallback((src: string) => {
    return carouselFrameRef.current?.querySelector<HTMLImageElement>(
      `img[src="${CSS.escape(src)}"]`,
    );
  }, []);

  const getCarouselDirection = useCallback((from: number, to: number, length: number): 1 | -1 => {
    if (length <= 1) return 1;
    const delta = to - from;
    if (delta === 0) return 1;
    if (Math.abs(delta) <= length / 2) return delta > 0 ? 1 : -1;
    return delta > 0 ? -1 : 1;
  }, []);

  const goToImageIndex = useCallback(
    (index: number) => {
      if (index === activeImageIndex || carouselTransitionRef.current) return;
      const image = images[index];
      if (!image) return;

      const direction = getCarouselDirection(activeImageIndex, index, images.length);
      const wrapsAround =
        (activeImageIndex === images.length - 1 && index === 0) ||
        (activeImageIndex === 0 && index === images.length - 1);
      carouselTransitionRef.current = true;

      void waitForImageReady(image.src, getCarouselImageElement(image.src)).then(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setCarouselDirection(direction);
            if (wrapsAround) {
              // Avoid sliding through the whole strip when looping ends.
              setCarouselInstant(true);
              setActiveImageIndex(index);
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  setCarouselInstant(false);
                  carouselTransitionRef.current = false;
                });
              });
              return;
            }

            setActiveImageIndex(index);
            window.setTimeout(() => {
              carouselTransitionRef.current = false;
            }, 720);
          });
        });
      });
    },
    [activeImageIndex, getCarouselDirection, getCarouselImageElement, images],
  );

  carouselNavRef.current = {
    activeImageIndex,
    imagesLength: images.length,
    goTo: goToImageIndex,
  };

  useEffect(() => {
    if (images.length <= 1) return;

    return registerCarousel(id, {
      getActiveIndex: () => carouselNavRef.current.activeImageIndex,
      getLength: () => carouselNavRef.current.imagesLength,
      goTo: (index) => carouselNavRef.current.goTo(index),
    });
  }, [id, images.length]);

  useEffect(() => {
    const frame = carouselFrameRef.current;
    if (!frame || images.length <= 1) return;

    const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

    const resetDrag = () => {
      touchStartRef.current = null;
      touchLastRef.current = null;
      dragAxisRef.current = null;
      dragOffsetRef.current = 0;
      setIsDragging(false);
      setDragOffset(0);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (!isMobile() || carouselTransitionRef.current) return;
      const touch = event.touches[0];
      if (!touch) return;
      touchStartRef.current = { x: touch.clientX, y: touch.clientY, t: performance.now() };
      touchLastRef.current = { x: touch.clientX, t: performance.now() };
      dragAxisRef.current = null;
      dragOffsetRef.current = 0;
      setDragOffset(0);
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!touchStartRef.current || !isMobile()) return;
      const touch = event.touches[0];
      if (!touch) return;

      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      if (!dragAxisRef.current) {
        if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) return;
        dragAxisRef.current = Math.abs(deltaX) > Math.abs(deltaY) ? "x" : "y";
        if (dragAxisRef.current === "x") {
          setIsDragging(true);
        }
      }

      if (dragAxisRef.current !== "x") return;

      event.preventDefault();
      touchLastRef.current = { x: touch.clientX, t: performance.now() };

      // Rubber-band slightly at ends before wrap decision
      const atStart = activeImageIndex === 0 && deltaX > 0;
      const atEnd = activeImageIndex === images.length - 1 && deltaX < 0;
      const offset = atStart || atEnd ? deltaX * 0.35 : deltaX;
      dragOffsetRef.current = offset;
      setDragOffset(offset);
    };

    const settleToIndex = (nextIndex: number) => {
      const width = frame.clientWidth || 1;
      const wrapsAround =
        (activeImageIndex === images.length - 1 && nextIndex === 0) ||
        (activeImageIndex === 0 && nextIndex === images.length - 1);

      if (wrapsAround) {
        resetDrag();
        goToImageIndex(nextIndex);
        return;
      }

      const direction = nextIndex > activeImageIndex ? 1 : -1;
      setCarouselDirection(direction);
      carouselTransitionRef.current = true;
      setIsDragging(false);
      // Animate remaining distance to the neighboring slide, then snap index.
      setDragOffset(direction > 0 ? -width : width);

      window.setTimeout(() => {
        setCarouselInstant(true);
        setActiveImageIndex(nextIndex);
        dragOffsetRef.current = 0;
        setDragOffset(0);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setCarouselInstant(false);
            carouselTransitionRef.current = false;
          });
        });
      }, 280);
    };

    const onTouchEnd = () => {
      if (!touchStartRef.current || !isMobile()) return;

      if (dragAxisRef.current !== "x") {
        resetDrag();
        return;
      }

      const width = frame.clientWidth || 1;
      const deltaX = dragOffsetRef.current;
      const start = touchStartRef.current;
      const last = touchLastRef.current;
      const elapsed = last && start ? Math.max(last.t - start.t, 1) : 1;
      const velocity = last && start ? (last.x - start.x) / elapsed : 0;

      const distanceThreshold = Math.min(72, width * 0.2);
      const velocityThreshold = 0.45;
      let nextIndex = activeImageIndex;

      if (deltaX < -distanceThreshold || velocity < -velocityThreshold) {
        // Swipe left → next image (no wrap past the last)
        if (activeImageIndex < images.length - 1) {
          nextIndex = activeImageIndex + 1;
        }
      } else if (deltaX > distanceThreshold || velocity > velocityThreshold) {
        // Swipe right → previous image (no wrap before the first)
        if (activeImageIndex > 0) {
          nextIndex = activeImageIndex - 1;
        }
      }

      if (nextIndex === activeImageIndex) {
        setIsDragging(false);
        setDragOffset(0);
        dragOffsetRef.current = 0;
        touchStartRef.current = null;
        touchLastRef.current = null;
        dragAxisRef.current = null;
        return;
      }

      settleToIndex(nextIndex);
      touchStartRef.current = null;
      touchLastRef.current = null;
      dragAxisRef.current = null;
    };

    frame.addEventListener("touchstart", onTouchStart, { passive: true });
    frame.addEventListener("touchmove", onTouchMove, { passive: false });
    frame.addEventListener("touchend", onTouchEnd);
    frame.addEventListener("touchcancel", resetDrag);

    return () => {
      frame.removeEventListener("touchstart", onTouchStart);
      frame.removeEventListener("touchmove", onTouchMove);
      frame.removeEventListener("touchend", onTouchEnd);
      frame.removeEventListener("touchcancel", resetDrag);
    };
  }, [activeImageIndex, goToImageIndex, images.length]);

  useEffect(() => {
    setActiveImageIndex((prev) => {
      if (images.length === 0) return 0;
      return Math.min(prev, images.length - 1);
    });
  }, [images.length]);

  useLayoutEffect(() => {
    if (images.length <= 1) return;

    const sources = preloadImageSources ?? images.map((image) => image.src);
    for (const source of sources) {
      void loadImage(source);
    }
  }, [imageSrcFingerprint, preloadFingerprint, images.length, loadImage]); // eslint-disable-line react-hooks/exhaustive-deps -- fingerprints replace unstable array refs

  useLayoutEffect(() => {
    const src = currentImage?.src;
    if (!src) return;
    void waitForImageReady(src, getCarouselImageElement(src));
  }, [currentImage?.src, getCarouselImageElement]);

  useEffect(() => {
    if (images.length <= 1) return;

    const next = images[(activeImageIndex + 1) % images.length];
    const prev = images[(activeImageIndex - 1 + images.length) % images.length];
    if (next) void loadImage(next.src);
    if (prev) void loadImage(prev.src);
  }, [activeImageIndex, images, loadImage]);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    const sectionObserver = onEnter
      ? new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting || entry.intersectionRatio <= 0.45) continue;
              if (enterDebounceRef.current) clearTimeout(enterDebounceRef.current);
              enterDebounceRef.current = setTimeout(() => {
                if (!el.isConnected) return;
                const rect = el.getBoundingClientRect();
                const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
                if (visibleHeight / Math.max(rect.height, 1) > 0.45) {
                  onEnter(id, bg);
                }
              }, 120);
            }
          },
          { threshold: [0.15, 0.5, 0.75], rootMargin: "-10% 0px -10% 0px" },
        )
      : null;

    sectionObserver?.observe(el);
    el.querySelectorAll<HTMLElement>(".fade-up").forEach((node) => revealObserver.observe(node));

    return () => {
      if (enterDebounceRef.current) clearTimeout(enterDebounceRef.current);
      revealObserver.disconnect();
      sectionObserver?.disconnect();
    };
  }, [id, bg, onEnter]);

  return (
    <section
      ref={ref}
      id={id}
      className={[
        "relative w-full flex flex-col",
        edgeToEdgeOnMobile && hasVideo
          ? "max-md:px-0 px-5 sm:px-6 md:px-16 lg:px-24"
          : "px-5 sm:px-6 md:px-16 lg:px-24",
        video?.mobileOnly ? "md:hidden" : "",
        naturalHeight
          ? "min-h-0 justify-start"
          : naturalHeightOnMobile
            ? "max-md:min-h-0 max-md:justify-start md:min-h-screen md:justify-center"
            : "min-h-screen justify-center",
        sectionClassName ?? "py-24 sm:py-28 md:py-40",
      ].join(" ")}
    >
      <div
        data-subsection-content
        className={
          hasMedia
            ? "grid md:grid-cols-12 gap-8 md:gap-16 items-center"
            : "flex justify-center"
        }
      >
        {hasVideo && (
          <div
            className={`fade-up ${mediaColumnClassName} ${
              hasTextContent && imageOnRight ? "md:order-2" : "md:order-1"
            }`}
          >
            <figure className={mediaAspect}>
              <div className={useArtworkVideoFrame ? artworkFrameClassName : mediaFrameClassName}>
                <video
                  src={video.src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-hidden="true"
                  className={useArtworkVideoFrame ? videoFitClassName : mediaFitClassName}
                />
              </div>
            </figure>
          </div>
        )}

        {hasImage && (
          <div
            className={`${mediaColumnClassName} ${
              hasTextContent && imageOnRight ? "md:order-2" : "md:order-1"
            }`}
          >
            <div data-image-carousel={images.length > 1 ? id : undefined}>
            <figure
              className={`fade-up ${mediaAspect} ${images.length > 1 ? "max-md:touch-pan-y" : ""}`.trim()}
            >
              <div
                ref={carouselFrameRef}
                className={`${mediaFrameClassName}${images.length > 1 ? " relative overflow-hidden group/carousel" : ""}`.trim()}
              >
                {images.length > 1 ? (
                  <>
                  <div
                    className={[
                      "carousel-track",
                      carouselInstant || isDragging ? "carousel-track-instant" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{
                      transform: `translate3d(calc(-${activeImageIndex} * (100% + var(--carousel-gap, 0px)) + ${dragOffset}px), 0, 0)`,
                    }}
                    data-carousel-direction={carouselDirection ?? undefined}
                  >
                    {images.map((image, index) => {
                      const isActive = index === activeImageIndex;
                      return (
                        <div key={image.src} className="carousel-slide">
                          <img
                            src={image.src}
                            alt={isActive ? image.alt : ""}
                            aria-hidden={isActive ? undefined : true}
                            loading="eager"
                            decoding="async"
                            onLoad={() => markImagePreloaded(image.src)}
                            className={mediaFitClassName}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    className="carousel-hit carousel-hit-prev"
                    aria-label="Forrige billede"
                    onClick={() => {
                      if (activeImageIndex <= 0) return;
                      goToImageIndex(activeImageIndex - 1);
                    }}
                  >
                    <span className="carousel-hit-arrow" aria-hidden>
                      <svg viewBox="0 0 24 24" className="h-5 w-5">
                        <path
                          d="M15 18l-6-6 6-6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="carousel-hit carousel-hit-next"
                    aria-label="Næste billede"
                    onClick={() => {
                      if (activeImageIndex >= images.length - 1) return;
                      goToImageIndex(activeImageIndex + 1);
                    }}
                  >
                    <span className="carousel-hit-arrow" aria-hidden>
                      <svg viewBox="0 0 24 24" className="h-5 w-5">
                        <path
                          d="M9 18l6-6-6-6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>
                  </>
                ) : (
                  <img
                    src={currentImage.src}
                    alt={currentImage.alt}
                    loading="lazy"
                    decoding="async"
                    className={mediaFitClassName}
                  />
                )}
              </div>
            </figure>
            {currentImage.caption && (
              <figcaption className="mt-3 max-w-3xl whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
                {currentImage.caption}
              </figcaption>
            )}

            {showImageNavigation && images.length > 1 && (
              <div
                className="mt-6 flex items-center justify-center gap-2.5"
                role="group"
                aria-label="Billednavigation"
              >
                {images.map((image, index) => (
                  <button
                    key={image.src}
                    type="button"
                    onClick={() => goToImageIndex(index)}
                    className={[
                      "rounded-full transition-all duration-300 ease-out cursor-pointer",
                      index === activeImageIndex
                        ? "h-2 w-6 bg-foreground"
                        : "h-2 w-2 bg-foreground/25 hover:bg-foreground/40",
                    ].join(" ")}
                    aria-label={`Billede ${index + 1} af ${images.length}`}
                    aria-current={index === activeImageIndex ? "true" : undefined}
                  />
                ))}
              </div>
            )}
            </div>
          </div>
        )}

        {hasTextContent && (
          <aside
            className={`fade-up font-serif text-base md:text-lg leading-[1.7] text-foreground/85 space-y-5 md:space-y-6 ${
              hasMedia ? "md:col-span-5" : "w-full max-w-3xl"
            } ${hasMedia && imageOnRight ? "md:order-1" : "md:order-2"}`}
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
