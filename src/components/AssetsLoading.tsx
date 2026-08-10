import { useEffect, useState } from "react";
import { CenterLoading } from "./Layout/CenterLoading";
import { preloadImages } from "src/lib/image-cache";

export function AssetsLoading({
  children,
  assets,
  prefix,
  loadingGradient,
  loadingColor,
}: React.PropsWithChildren<{
  assets: string[];
  prefix?: string;
  /**
   * Recolours the loading state so it doesn't flash the default cyan in the
   * middle of a themed funnel. Colours only — the markup is identical either
   * way, because theme predicates read localStorage and so resolve to the
   * default during SSR; a structural difference here would fail hydration.
   */
  loadingGradient?: string;
  loadingColor?: string;
}>) {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!isLoading) return;
    preloadImages(assets, prefix)
      .then(() => setIsLoading(false))
      .then(() => console.log("done loading assets"));
  }, []);
  if (isLoading) return <CenterLoading gradient={loadingGradient} color={loadingColor} />;
  return children;
}
