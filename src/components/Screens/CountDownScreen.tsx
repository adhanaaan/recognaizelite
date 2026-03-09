import React, { useState } from "react";
import { PcScreen } from "src/components/Layout/PcScreen";
import { useCountDown } from "src/hooks/useCountDown";

interface CountDownScreenProps extends React.PropsWithChildren {
  color: string;
  backgroundColor: string;
  time?: number;
}

export const CountDownScreen: React.FC<CountDownScreenProps> = ({ time = 3, children, color, backgroundColor }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const { countDown } = useCountDown(time, () => setIsCompleted(true));

  if (!isCompleted)
    return (
      <PcScreen>
        <div className="w-full h-full c" style={{ backgroundColor }}>
          <div className="flex space-x-10">
            {[...new Array(time)].map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-full w-9 h-9"
                style={{
                  backgroundColor: idx <= time - countDown ? color : undefined,
                }}
              />
            ))}
          </div>
        </div>
      </PcScreen>
    );

  return children;
};
