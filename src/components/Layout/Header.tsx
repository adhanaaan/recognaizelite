import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import React from "react";
import { Background } from "src/components/Layout/Background";

interface Props {
  color?: string;
  title?: string;
  isHideBack?: boolean;
  goBackToPrevious?: boolean;
}

export const Header: React.FC<Props> = ({ title, isHideBack, goBackToPrevious }) => {
  const router = useRouter();

  const handleBack = () => {
    if (goBackToPrevious) {
      router.back();
    } else {
      router.push("/");
    }
  };

  if (isHideBack) return null;

  return (
    <button
      onClick={handleBack}
      className="fixed z-10 flex items-center w-auto gap-2 px-4 py-2 font-semibold transition bg-white rounded-full hover:opacity-90 top-8 left-5 md:top-12 md:left-12 lg:top-16 lg:left-16 backdrop-blur text-m md:text-base"
    >
      <Icon icon="ion:arrow-back" className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
      <span>Back</span>
    </button>
  );
};

export function HeaderWrapper({
  children,
  color,
  title = "",
  isHideBack,
  goBackToPrevious,
  ...props
}: Props & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Background {...props}>
      <Header
        color={color}
        title={title}
        isHideBack={isHideBack}
        goBackToPrevious={goBackToPrevious} // <-- add this line
      />
      {children}
    </Background>
  );
}
