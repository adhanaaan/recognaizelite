import { createContext, ProviderProps, useCallback, useContext, useState } from "react";
import { DemoStep, GameNameKeys } from "src/types";

export type DemoContextDataType = {
  name: GameNameKeys;
  title: string;
  steps: DemoStep[];
  colors: Record<string, string>;
  texts: Record<string, string>;
};

export type DemoContextStateType = {
  currentStep: number;
  previousStep: number;
  hasMounted: boolean;
  step?: DemoStep;
};

export type DemoContextActionsType = {
  setCurrentStep: (step: number) => void;
  setHasMounted: (mounted: boolean) => void;
  moveToNextStep: () => void;
  moveToPreviousStep: () => void;
};

export type DemoContextType = {
  data: DemoContextDataType;
  state: DemoContextStateType;
  actions: DemoContextActionsType;
};

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ value, children }: ProviderProps<DemoContextDataType>) {
  const [currentStep, setCurrentStep] = useState(0);
  const [previousStep, setPreviousStep] = useState(-1);
  const [hasMounted, setHasMounted] = useState(false);

  const moveToNextStep = useCallback(() => {
    setHasMounted(false);
    setCurrentStep((x) => {
      window.dispatchEvent(new Event(`demo.next.${x}`));
      setPreviousStep(x);
      // Ignore bounds
      return x + 1;
    });
  }, []);

  const moveToPreviousStep = useCallback(() => {
    setHasMounted(false);
    setCurrentStep((x) => {
      window.dispatchEvent(new Event(`demo.prev.${x}`));
      setPreviousStep(x);
      // Ignore bounds
      return x - 1;
    });
  }, []);

  return (
    <DemoContext.Provider
      value={{
        data: value,
        state: { currentStep, hasMounted, step: value.steps[currentStep], previousStep },
        actions: { setCurrentStep, setHasMounted, moveToNextStep, moveToPreviousStep },
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoContext() {
  const value = useContext(DemoContext);
  if (!value) throw new Error("useDemoContext must be used within a DemoProvider");
  return value;
}

export function useDemoContextOptional() {
  return useContext(DemoContext);
}

export const useIsDemoPage = () => {
  const context = useDemoContextOptional();
  return !!context;
};
