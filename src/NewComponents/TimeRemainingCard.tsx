import StopWatchIcon from "src/assets/stop-watch.svg";
import { useCountDown } from "src/hooks/useCountDown";

export function TimeRemainingCard({
  time,
  disabled,
  color = "#3A3A3A",
  callback = () => {},
  showSeconds = true,
}: {
  time: number;
  color?: string;
  disabled?: boolean;
  callback?: () => void;
  showSeconds?: boolean;
}) {
  const { countDown } = useCountDown(time, callback, disabled);
  return (
    <h4 className="max-w-28 f justify-end sm:scale-125 items-center gap-1.5" style={{ color, lineHeight: "24px" }}>
      <StopWatchIcon className="fill-current size-6" />
      {countDown} {showSeconds ? " sec" : ""}
    </h4>
  );
}
