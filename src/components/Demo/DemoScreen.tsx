import { Fragment } from "react";
import { PcScreen } from "src/components/Layout/PcScreen";
import { Demo } from "./Demo";

export function DemoScreen({ children }: React.PropsWithChildren) {
  return (
    <PcScreen>
      <Fragment>
        {/* adding this element for attaching demo card in center with overlay */}
        <div id="demo-center" className="absolute top-1/2 left-1/2 -z-50 size-0" />
        <Demo />
        {children}
      </Fragment>
    </PcScreen>
  );
}
