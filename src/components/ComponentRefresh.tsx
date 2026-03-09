import React, { useState } from "react";

export interface ChildProp {
  onRefresh: () => void;
}

export const ComponentRefresh = (Children: any) => {
  function Out() {
    const [key, setKey] = useState(1);

    return (
      <React.Fragment key={key}>
        <Children onRefresh={() => setKey(key * -1)} />
      </React.Fragment>
    );
  }

  return Out;
};
