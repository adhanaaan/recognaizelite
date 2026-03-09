import Router from "next/router";
import BackIcon from "src/assets/back.svg";
import { t } from "src/lib/translations";

export function BackButton({ backUrl }: { backUrl?: string }) {
  return (
    <button
      className="items-center justify-center px-3 py-1.5 bg-white rounded-full f font-semibold"
      onClick={backUrl ? () => Router.replace(backUrl) : Router.back}
    >
      <BackIcon className="mr-2 size-4" /> {t.GENERAL.Back}
    </button>
  );
}
