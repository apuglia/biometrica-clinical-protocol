import { z } from "zod";

// ========== Case Input Schema ==========
export const CaseInputSchema = z.object({
  case_id: z.string(),
  patient: z.object({
    age: z.number(),
    sex: z.enum(["male", "female", "M", "F"]),
  }),
  observations: z.array(
    z.object({
      biomarker: z.string(),
      value: z.number(),
      unit: z.string().optional(),
    })
  ),
});

export type CaseInput = z.infer<typeof CaseInputSchema>;

// ========== Range Match Result ==========
export interface RangeMatch {
  label: string;
  rangeText: string;
  status: "normal" | "borderline" | "abnormal" | "critical";
  matched: boolean;
}

// ========== Enriched Observation ==========
export interface EnrichedObservation {
  biomarker: string;
  value: number;
  unit?: string;
  status: "normal" | "borderline" | "abnormal" | "critical" | "unknown";
  range_label: string | null;
  ref_text: string | null;
  trace: {
    range_applied: string;
    label_found: string | null;
  };
}

// ========== QA Flag ==========
export interface QAFlag {
  type: "missing_biomarker" | "unknown_biomarker" | "unit_mismatch" | "missing_range";
  message: string;
  biomarker?: string;
  severity: "info" | "warning" | "error";
}

// ========== Case Output Schema ==========
export interface CaseOutput {
  kb_version: string;
  case_id: string;
  patient: {
    age: number;
    sex: "male" | "female";
  };
  observations_enriched: EnrichedObservation[];
  qa_flags: QAFlag[];
  trace: {
    ranges_applied: number;
    observations_processed: number;
    timestamp: string;
  };
}

