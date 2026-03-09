export type ResultType = "success" | "error" | "timeout" | "";
export type LanguageType = "ENGLISH" | "BAHASA" | "MANDARIN" | "MALAY" | "TAGALOG" | "MALAYALAM";

export type DemoElement = {
  id: string;
  className?: string;
  instructionClassName?: string;
  onClick?: () => void;
  instruction?: string;
  arrow?: boolean;
  arrowStyle?: React.CSSProperties;
  showNextBtn?: boolean;
  showPreviousBtn?: boolean;
  side?: "bottom" | "top";
  style?: React.CSSProperties;
  children?: React.ReactNode;
  texts?: Record<string, string>;
};

export type DemoStep = {
  delay?: number;
  voiceover?: string;
  hideOverlay?: boolean;
  elements: DemoElement[];
  interactive?: boolean;
  demoNextEvent?: string;
};

declare global {
  interface Window {
    demoInteractive?: boolean;
    demoCurrentStep?: number;
  }
}

export interface GameProps {
  currLevel: number;
  totalLevel: number;
}

export type GameNameKeys = "SM" | "TM" | "AG" | "GS" | "GF";
