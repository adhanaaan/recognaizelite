import { useEffect, useState } from "react";
import { CenterLoading } from "./Layout/CenterLoading";
import { preloadImages } from "src/lib/image-cache";

export function AssetsLoading({
  children,
  assets,
  prefix,
}: React.PropsWithChildren<{ assets: string[]; prefix?: string }>) {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!isLoading) return;
    preloadImages(assets, prefix)
      .then(() => setIsLoading(false))
      .then(() => console.log("done loading assets"));
  }, []);
  if (isLoading) return <CenterLoading />;
  return children;
}
