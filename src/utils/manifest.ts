export function updateManifestURL(url: string) {
  if (typeof window === "undefined") {
    return;
  }

  const manifest = document.querySelector("link[rel=manifest]");

  if (!manifest) {
    return;
  }

  manifest.setAttribute("href", url);
}

export function createManifestURL(x: any) {
  const manifest = {
    name: "reCOGnAIze",
    short_name: "reCOGnAIze",
    start_url: "/",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    display: "standalone",
    background_color: "#fff",
    theme_color: "#1C64F2",
    orientation: "portrait",
    scope: "/",
    ...x,
  };

  return URL.createObjectURL(
    new Blob([JSON.stringify(manifest)], {
      type: "text/plain",
    })
  );
}
