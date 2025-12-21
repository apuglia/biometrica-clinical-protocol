import type { ReferenceRange, KnowledgeBase } from "../kb/types.js";
import type { CaseInput, EnrichedObservation, QAFlag } from "./types.js";
import { parseRange, valueMatchesRange } from "./range-parser.js";

/**
 * Aplica reference ranges a las observaciones de un caso
 */
export function applyReferenceRanges(
  kb: KnowledgeBase,
  caseInput: CaseInput
): {
  observations_enriched: EnrichedObservation[];
  qa_flags: QAFlag[];
} {
  const observations_enriched: EnrichedObservation[] = [];
  const qa_flags: QAFlag[] = [];

  // Normalizar sexo (M/F -> male/female)
  const normalizedSex = normalizeSex(caseInput.patient.sex);

  // Crear mapa de biomarkers para búsqueda rápida
  const biomarkerMap = new Map(
    kb.biomarkers.biomarkers.map((b) => [b.id, b])
  );

  // Crear mapa de reference ranges por biomarker
  const rangeMap = new Map<string, ReferenceRange>();
  for (const range of kb.referenceRanges.reference_ranges) {
    rangeMap.set(range.biomarker, range);
  }

  for (const observation of caseInput.observations) {
    const biomarkerId = observation.biomarker;

    // Verificar que el biomarker existe
    const biomarker = biomarkerMap.get(biomarkerId);
    if (!biomarker) {
      qa_flags.push({
        type: "unknown_biomarker",
        message: `Biomarker desconocido: "${biomarkerId}"`,
        biomarker: biomarkerId,
        severity: "error",
      });
      observations_enriched.push(createUnknownObservation(observation));
      continue;
    }

    // Verificar unit (si está especificado)
    if (observation.unit && observation.unit !== biomarker.unit) {
      qa_flags.push({
        type: "unit_mismatch",
        message: `Unidad no coincide para "${biomarkerId}": esperado "${biomarker.unit}", recibido "${observation.unit}"`,
        biomarker: biomarkerId,
        severity: "warning",
      });
    }

    // Buscar reference range para este biomarker
    const referenceRange = rangeMap.get(biomarkerId);
    if (!referenceRange) {
      qa_flags.push({
        type: "missing_range",
        message: `No se encontró rango de referencia para biomarker: "${biomarkerId}"`,
        biomarker: biomarkerId,
        severity: "warning",
      });
      observations_enriched.push(createUnknownObservation(observation));
      continue;
    }

    // Aplicar rangos y encontrar el match
    const match = findMatchingRange(observation.value, referenceRange, normalizedSex);
    
    observations_enriched.push({
      biomarker: biomarkerId,
      value: observation.value,
      unit: observation.unit || biomarker.unit,
      status: match.status,
      range_label: match.label,
      ref_text: match.rangeText,
      trace: {
        range_applied: match.rangeText,
        label_found: match.label,
      },
    });
  }

  return { observations_enriched, qa_flags };
}

/**
 * Normaliza el sexo del paciente
 */
function normalizeSex(sex: string): "male" | "female" {
  const normalized = sex.toLowerCase();
  if (normalized === "m" || normalized === "male") return "male";
  if (normalized === "f" || normalized === "female") return "female";
  return "male"; // default
}

/**
 * Encuentra el rango que corresponde a un valor
 */
function findMatchingRange(
  value: number,
  referenceRange: ReferenceRange,
  sex: "male" | "female"
): {
  label: string;
  rangeText: string;
  status: "normal" | "borderline" | "abnormal" | "critical";
} {
  // Prioridad de búsqueda: primero rangos específicos por sexo, luego genéricos
  // Buscar TODOS los rangos disponibles en el objeto
  const matches: Array<{ label: string; rangeText: string; priority: number }> = [];
  
  for (const key in referenceRange) {
    if (key === "biomarker") continue;
    
    const rangeText = (referenceRange as any)[key];
    if (typeof rangeText === "string") {
      const parsed = parseRange(rangeText);
      if (parsed && valueMatchesRange(value, parsed)) {
        // Calcular prioridad: rangos específicos por sexo tienen mayor prioridad
        let priority = 0;
        if (sex === "male" && key.includes("_male")) priority = 2;
        else if (sex === "female" && key.includes("_female")) priority = 2;
        else if (key.includes("_male") || key.includes("_female")) priority = -1; // Otro sexo, ignorar
        else priority = 1; // Genérico
        
        matches.push({ label: key, rangeText, priority });
      }
    }
  }

  // Si hay matches, ordenar por prioridad y retornar el primero
  if (matches.length > 0) {
    matches.sort((a, b) => b.priority - a.priority);
    const bestMatch = matches[0];
    return {
      label: bestMatch.label,
      rangeText: bestMatch.rangeText,
      status: determineStatus(bestMatch.label),
    };
  }

  // Si no hay match, retornar unknown
  return {
    label: "unknown",
    rangeText: "No match found",
    status: "abnormal",
  };
}

/**
 * Determina el status basado en el label del rango
 */
function determineStatus(label: string): "normal" | "borderline" | "abnormal" | "critical" {
  // Normal
  if (label.includes("normal") || label.includes("optimal") || 
      label.includes("sufficient") || label === "desirable" || 
      label === "low_risk") {
    return "normal";
  }

  // Borderline
  if (label.includes("borderline") || label.includes("near_optimal") || 
      label === "moderate_risk" || label === "mildly_reduced" ||
      label === "prediabetes" || label === "insufficient") {
    return "borderline";
  }

  // Critical
  if (label.includes("critical") || label === "very_high" || 
      label === "kidney_failure" || label === "severely_reduced") {
    return "critical";
  }

  // Abnormal (default)
  return "abnormal";
}

/**
 * Crea una observación "unknown" cuando no se puede procesar
 */
function createUnknownObservation(observation: { biomarker: string; value: number; unit?: string }): EnrichedObservation {
  return {
    biomarker: observation.biomarker,
    value: observation.value,
    unit: observation.unit,
    status: "unknown",
    range_label: null,
    ref_text: null,
    trace: {
      range_applied: "N/A",
      label_found: null,
    },
  };
}

