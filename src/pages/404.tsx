/* eslint-disable react/no-unescaped-entities */
import { NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Background } from "src/components/Layout/Background";
import { Button } from "src/ui/Button";

const Error404: NextPage = ({}) => {
  const [show404, setShow404] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => {
      setShow404(true);
    }, 500);
  }, []);

  return (
    <Background className="r cc full">
      <div className={`select-none opacity-10 filter transition duration-200 ${show404 ? "blur-sm" : "blur-none"}`}>
        <h1 style={{ fontSize: "15vw" }}>404</h1>
      </div>
      <div
        className={`flex absolute z-10 flex-col items-center justify-center space-y-6 transition ${
          show404 ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex w-[380px] flex-col items-center justify-center space-y-3 text-center">
          <h3 className="text-2xl text-accent">Looking for something? 🔍</h3>
          <p>We couldn't find the page that you're looking for!</p>
        </div>
        <Link href="/">
          <Button btn="accent" className="font-semibold" size="md">
            Go Home
          </Button>
        </Link>
      </div>
    </Background>
  );
};

export default Error404;
