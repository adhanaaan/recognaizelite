import { ResultType } from "src/types";
import CorrectCircleIcon from "src/assets/correct-circle.svg";
import WrongCircleIcon from "src/assets/wrong-circle.svg";

export function ResultOverlay({ result }: { result: ResultType }) {
  if (!result) return null;

  function getResultIcon() {
    if (result === "success") return <CorrectCircleIcon className="size-48" />;
    else if (result === "error") return <WrongCircleIcon className="size-48" />;
    else return null;
  }

  return <div className="absolute inset-0 z-50 c">{getResultIcon()}</div>;
}
