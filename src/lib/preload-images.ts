const loadedSources = new Set<string>();
const inflightLoads = new Map<string, Promise<void>>();

export function isImagePreloaded(src: string) {
  return loadedSources.has(src);
}

export function markImagePreloaded(src: string) {
  loadedSources.add(src);
}

export function preloadImage(src: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (loadedSources.has(src)) return Promise.resolve();

  const inflight = inflightLoads.get(src);
  if (inflight) return inflight;

  const promise = new Promise<void>((resolve) => {
    const img = new Image();

    const finish = () => {
      loadedSources.add(src);
      inflightLoads.delete(src);
      resolve();
    };

    img.onload = () => {
      void (async () => {
        try {
          if ("decode" in img) await img.decode();
        } catch {
          /* decode can reject for unsupported formats; image may still paint */
        }
        finish();
      })();
    };

    img.onerror = finish;
    img.src = src;
  });

  inflightLoads.set(src, promise);
  return promise;
}

export function preloadImages(sources: readonly string[]) {
  return Promise.all(sources.map((source) => preloadImage(source)));
}

export async function waitForImageReady(
  src: string,
  domImage?: HTMLImageElement | null,
): Promise<void> {
  if (domImage?.complete && domImage.naturalWidth > 0) {
    markImagePreloaded(src);
    try {
      if ("decode" in domImage) await domImage.decode();
    } catch {
      /* decode can reject for unsupported formats; image may still paint */
    }
    return;
  }

  await preloadImage(src);

  if (!domImage) return;

  if (!domImage.complete) {
    await new Promise<void>((resolve) => {
      const finish = () => resolve();
      domImage.addEventListener("load", finish, { once: true });
      domImage.addEventListener("error", finish, { once: true });
    });
  }

  try {
    if ("decode" in domImage) await domImage.decode();
  } catch {
    /* decode can reject for unsupported formats; image may still paint */
  }

  markImagePreloaded(src);
}
