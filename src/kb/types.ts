import { z } from "zod";

// ========== Latest.yaml schema ==========
export const LatestSchema = z.object({
  active_version: z.string(),
}).or(z.object({
  version: z.string(), // Legacy format
  path: z.string().optional(),
  status: z.string().optional(),
  last_updated: z.string().optional(),
})).transform((data) => {
  if ("active_version" in data) {
    return {
      active_version: data.active_version,
    };
  }
  return {
    active_version: data.version,
  };
});

export type Latest = { active_version: string };

// ========== Manifest schema ==========
export const ManifestSchema = z.object({
  version: z.string(),
  release_date: z.string(),
  status: z.string(),
  description: z.string().optional(),
  last_updated: z.string().optional(),
  maintainer: z.string().optional(),
  license: z.string().optional(),
});

export type Manifest = z.infer<typeof ManifestSchema>;

// ========== Biomarker schema ==========
export const BiomarkerSchema = z.object({
  id: z.string(),
  name: z.string(),
  unit: z.string(),
  category: z.string(),
  description: z.string(),
  calculated: z.boolean().optional(),
  depends_on: z.array(z.string()).optional(),
  calculation_method: z.string().optional(),
  formula: z.string().optional(),
});

export const BiomarkerDictionarySchema = z.object({
  biomarkers: z.array(BiomarkerSchema),
});

export type Biomarker = z.infer<typeof BiomarkerSchema>;
export type BiomarkerDictionary = z.infer<typeof BiomarkerDictionarySchema>;

// ========== Reference Range schema ==========
export const ReferenceRangeSchema = z.object({
  biomarker: z.string(),
  optimal: z.string().optional(),
  near_optimal: z.string().optional(),
  borderline_high: z.string().optional(),
  high: z.string().optional(),
  very_high: z.string().optional(),
  low: z.string().optional(),
  normal: z.string().optional(),
  borderline: z.string().optional(),
  suppressed: z.string().optional(),
  elevated: z.string().optional(),
  deficient: z.string().optional(),
  insufficient: z.string().optional(),
  sufficient: z.string().optional(),
  normal_male: z.string().optional(),
  normal_female: z.string().optional(),
  optimal_male: z.string().optional(),
  optimal_female: z.string().optional(),
  low_male: z.string().optional(),
  low_female: z.string().optional(),
});

export const ReferenceRangesSchema = z.object({
  reference_ranges: z.array(ReferenceRangeSchema),
});

export type ReferenceRange = z.infer<typeof ReferenceRangeSchema>;
export type ReferenceRanges = z.infer<typeof ReferenceRangesSchema>;

// ========== Action schema ==========
export const ActionSchema = z.object({
  id: z.string(),
  text: z.string(),
  priority: z.string().optional(),
  category: z.string().optional(),
});

export const RecommendationLibrarySchema = z.object({
  actions: z.array(ActionSchema),
});

export type Action = z.infer<typeof ActionSchema>;
export type RecommendationLibrary = z.infer<typeof RecommendationLibrarySchema>;

// ========== Condition schema ==========
export const ConditionSchema = z.object({
  biomarker: z.string(),
  operator: z.enum([">", ">=", "<", "<=", "between", "exists"]),
  value: z.number().optional(),
  value1: z.number().optional(),
  value2: z.number().optional(),
});

// ========== Rule schema ==========
export const RuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  when: z.object({
    all: z.array(ConditionSchema).optional(),
    any: z.array(ConditionSchema).optional(),
  }),
  then: z.object({
    severity: z.enum(["green", "yellow", "orange", "red"]),
    headline: z.string(),
    why: z.string().optional(),
    actions: z.array(z.string()),
    tags: z.array(z.string()).optional(),
  }),
});

export const ProtocolRulesSchema = z.object({
  rules: z.array(RuleSchema),
});

export type Rule = z.infer<typeof RuleSchema>;
export type ProtocolRules = z.infer<typeof ProtocolRulesSchema>;

// ========== Critical Alert schema ==========
export const CriticalAlertSchema = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  when: z.object({
    all: z.array(ConditionSchema).optional(),
    any: z.array(ConditionSchema).optional(),
  }),
  then: z.object({
    severity: z.literal("red"),
    headline: z.string(),
    why: z.string().optional(),
    actions: z.array(z.string()),
    doctor_questions: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const CriticalAlertsSchema = z.object({
  red_flags: z.array(CriticalAlertSchema),
});

export type CriticalAlert = z.infer<typeof CriticalAlertSchema>;
export type CriticalAlerts = z.infer<typeof CriticalAlertsSchema>;

// ========== Evidence schema ==========
export const EvidenceSourceSchema = z.object({
  type: z.string(),
  citation: z.string(),
  year: z.number().optional(),
});

export const EvidenceEntrySchema = z.object({
  rule_id: z.string(),
  sources: z.array(EvidenceSourceSchema),
});

export const EvidenceLibrarySchema = z.object({
  evidence: z.array(EvidenceEntrySchema),
});

export type EvidenceLibrary = z.infer<typeof EvidenceLibrarySchema>;

// ========== Disclaimer schema ==========
export const DisclaimerTextsSchema = z.object({
  disclaimers: z.record(z.object({
    text: z.string(),
    priority: z.string(),
  })),
  language_guidelines: z.object({
    must_use: z.array(z.string()).optional(),
    must_not_use: z.array(z.string()).optional(),
    tone: z.array(z.string()).optional(),
  }).optional(),
});

export type DisclaimerTexts = z.infer<typeof DisclaimerTextsSchema>;

// ========== Complete KB schema ==========
export const KnowledgeBaseSchema = z.object({
  manifest: ManifestSchema,
  biomarkers: BiomarkerDictionarySchema,
  referenceRanges: ReferenceRangesSchema,
  criticalAlerts: CriticalAlertsSchema,
  protocolRules: ProtocolRulesSchema,
  recommendationLibrary: RecommendationLibrarySchema,
  evidenceLibrary: EvidenceLibrarySchema,
  disclaimerTexts: DisclaimerTextsSchema,
});

export type KnowledgeBase = z.infer<typeof KnowledgeBaseSchema>;

