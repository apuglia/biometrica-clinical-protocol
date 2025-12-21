import { z } from "zod";

// ========== Ranges Output Schema (Input del Hito 3) ==========
export const EnrichedObservationSchema = z.object({
  biomarker: z.string(),
  value: z.number(),
  unit: z.string().optional(),
  status: z.enum(["normal", "borderline", "abnormal", "critical", "unknown"]),
  range_label: z.string().nullable(),
  ref_text: z.string().nullable(),
  trace: z.object({
    range_applied: z.string(),
    label_found: z.string().nullable(),
  }),
});

export const RangesOutputSchema = z.object({
  kb_version: z.string(),
  case_id: z.string(),
  patient: z.object({
    age: z.number(),
    sex: z.enum(["male", "female"]),
  }),
  observations_enriched: z.array(EnrichedObservationSchema),
  qa_flags: z.array(z.any()),
  trace: z.object({
    ranges_applied: z.number(),
    observations_processed: z.number(),
    timestamp: z.string(),
  }),
});

export type RangesOutput = z.infer<typeof RangesOutputSchema>;
export type EnrichedObservation = z.infer<typeof EnrichedObservationSchema>;

// ========== Red Flag Output ==========
export interface RedFlagFired {
  alert_id: string;
  name: string;
  headline: string;
  why?: string;
  actions: string[];
  doctor_questions?: string[];
  tags?: string[];
  trace: {
    fired_because: string[];
    conditions_met: Array<{
      biomarker: string;
      condition: string;
      value: number;
    }>;
  };
}

// ========== Alerts Output Schema ==========
export interface AlertsOutput {
  kb_version: string;
  case_id: string;
  patient: {
    age: number;
    sex: "male" | "female";
  };
  red_flags: RedFlagFired[];
  trace: {
    alerts_evaluated: number;
    alerts_fired: number;
    timestamp: string;
  };
}

