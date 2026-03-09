import { useState } from "react";
import { am } from "src/lib/audio-manager";
import { ResultType } from "src/types";

export function useResult(cb = (x: ResultType) => {}) {
  const [result, setResult] = useState<ResultType>("");

  return {
    result,
    setResult(x: ResultType) {
      if (result) return result;

      cb(x);
      setResult(x);

      if (x === "success") am.play("correct");
      else if (x === "error") am.play("wrong");
    },
    resetResult() {
      setResult("");
    },
  };
}
