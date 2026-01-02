# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Biometrica Clinical Protocol is a TypeScript-based clinical knowledge base (KB) system for biomarker analysis. It processes patient lab results through reference ranges and critical alerts using versioned YAML-based clinical rules.

## Commands

```bash
# Validate KB structure, schemas, and cross-references
npm run kb:lint

# Apply reference ranges to a patient case (outputs .ranges.json)
npm run case:ranges cases/case_001.json

# Evaluate critical alerts from enriched case (outputs .alerts.json)
npm run case:alerts cases/case_001.ranges.json
```

## Architecture

**Processing Pipeline**: Case JSON → Reference Ranges → Enriched Observations → Critical Alerts

### Source Modules (`src/`)

- **`kb/`** - Knowledge Base loader and validator
  - `loader.ts` - Loads versioned YAML files, exports `loadActiveKb()` and `loadKnowledgeBase(version)`
  - `validator.ts` - Cross-reference validation (biomarker refs, action refs, evidence refs)
  - `types.ts` - Zod schemas for all KB entities

- **`ranges/`** - Reference range application
  - `applier.ts` - Matches observations to KB ranges, determines status (normal/borderline/critical)
  - `range-parser.ts` - Parses range expressions like `">200"`, `"100-150"`, `"<70"`

- **`alerts/`** - Critical alert evaluation
  - `evaluator.ts` - Evaluates rule conditions against enriched observations
  - Supports operators: `>`, `>=`, `<`, `<=`, `between`, `exists`

### Clinical Knowledge Base (`clinical_kb/`)

```
clinical_kb/
  latest.yaml                    # Points to active version
  versions/0.1.0/
    01_kb_manifest.yaml          # Version metadata
    02_biomarker_dictionary.yaml # Biomarker definitions
    03_reference_ranges.yaml     # Normal/borderline/critical thresholds
    04_critical_alerts.yaml      # Red flag conditions (severity: red)
    05_protocol_rules.yaml       # Clinical rules with actions
    06_recommendation_library.yaml
    07_evidence_library.yaml
    08_disclaimer_texts.yaml
```

### Case Files (`cases/`)

Input format (`.json`):
```json
{
  "case_id": "case_001",
  "patient": { "age": 34, "sex": "male" },
  "observations": [
    { "biomarker": "ldl_c", "value": 165, "unit": "mg/dL" }
  ]
}
```

## Key Patterns

- All schemas use Zod with strict validation
- KB uses versioning via `latest.yaml` → `versions/{version}/`
- Sex-specific ranges use suffixes: `optimal_male`, `optimal_female`, etc.
- Alert rules use `when.all`/`when.any` condition groups with `then.severity`/`actions`
