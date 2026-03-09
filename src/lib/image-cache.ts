import { APP_LANG, isServer } from "src/constants";

const IMAGES: Record<string, string | undefined> = {};

export async function preloadImage(name: string, src: string) {
  try {
    const res = await fetch(src);
    // const x = await res.blob();
    // return (IMAGES[name] = URL.createObjectURL(x));
  } catch (error) {
    return console.warn(error);
  }
}

export function preloadImages(sources: string[], prefix?: string) {
  if (isServer) return Promise.resolve();

  sources = sources.filter((x) => !IMAGES[x]);
  return Promise.allSettled(
    sources.map((src) => {
      const name = src.replace("$lang", APP_LANG);
      return preloadImage(name, prefix + name);
    })
  );
}

export function setCachedImageName(name: string, src: string) {
  IMAGES[name] = getCachedImage(src);
}

export function getCachedImage(src: string) {
  // console.log("[cache]:", src);

  return IMAGES[src];
}
