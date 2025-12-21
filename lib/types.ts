export type Severity = "green" | "yellow" | "orange" | "red";

export type Operator = ">" | ">=" | "<" | "<=" | "between" | "exists";

export type Condition =
  | { biomarker: string; op: "exists" }
  | { biomarker: string; op: "between"; value1: number; value2: number }
  | { biomarker: string; op: ">" | ">=" | "<" | "<="; value: number };

export interface Rule {
  id: string;
  enabled: boolean;
  name: string;
  when: {
    all?: Condition[];
    any?: Condition[];
  };
  then: {
    severity: Severity;
    headline: string;
    why?: string;
    doNext: string[];
    doctorQuestions?: string[];
    tags?: string[];
  };
}

export interface LabInput {
  patient: {
    sex: "M" | "F";
    age: number;
  };
  labs: Record<string, number | null | undefined>;
}

export interface FiredRule extends Rule {
  firedBecause: string[];
}

export interface ActionItem {
  severity: Severity;
  headline: string;
  bullets: string[];
}

export interface ReportOutput {
  priorities: FiredRule[];
  actions: ActionItem[];
}

