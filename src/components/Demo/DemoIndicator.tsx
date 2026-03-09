import { t } from "src/lib/translations";

export function DemoIndicator() {
  return (
    <div
      className="font-bold rounded-full c"
      style={{ height: 34, width: 70, border: "1.5px solid #3A3A3A", color: "#3A3A3A" }}
    >
      {t.GAME_SPECIFIC.Demo}
    </div>
  );
}
