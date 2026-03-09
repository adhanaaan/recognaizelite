export type Severity = "Low" | "Medium" | "High";

export type DomainReport = {
  title: string;
  percentile: number;
  severity: Severity;
  definition: string;
  affects: string[];
  improve: string[];
  maintain: string[];
};
