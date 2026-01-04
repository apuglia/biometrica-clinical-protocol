import type { CriticalAlert, Condition } from "../kb/types.js";
import type { RangesOutput, EnrichedObservation, RedFlagFired } from "./types.js";

/**
 * Obtiene el valor de un biomarker desde las observaciones enriquecidas
 */
function getBiomarkerValue(
  observations: EnrichedObservation[],
  biomarkerId: string
): number | null {
  const observation = observations.find((obs) => obs.biomarker === biomarkerId);
  if (!observation) return null;
  return observation.value;
}

/**
 * Evalúa una condición individual contra las observaciones
 */
function evaluateCondition(
  condition: Condition,
  observations: EnrichedObservation[]
): { ok: boolean; reason: string } {
  const { biomarker, operator } = condition;
  const value = getBiomarkerValue(observations, biomarker);

  if (operator === "exists") {
    const exists = value !== null;
    return {
      ok: exists,
      reason: exists
        ? `${biomarker} está presente (valor: ${value})`
        : `${biomarker} no está presente`,
    };
  }

  if (value === null) {
    return {
      ok: false,
      reason: `${biomarker} no está presente en las observaciones`,
    };
  }

  if (operator === "between") {
    const { value1, value2 } = condition;
    if (value1 === undefined || value2 === undefined) {
      return { ok: false, reason: "Rango 'between' requiere value1 y value2" };
    }
    const min = Math.min(value1, value2);
    const max = Math.max(value1, value2);
    const ok = value >= min && value <= max;
    return {
      ok,
      reason: ok
        ? `${biomarker} (${value}) está entre ${min} y ${max}`
        : `${biomarker} (${value}) NO está entre ${min} y ${max}`,
    };
  }

  // Operadores de comparación: >, >=, <, <=
  const { value: threshold } = condition;
  if (threshold === undefined) {
    return { ok: false, reason: `Operador ${operator} requiere un valor threshold` };
  }

  let ok = false;
  let comparison = "";

  switch (operator) {
    case ">":
      ok = value > threshold;
      comparison = "mayor que";
      break;
    case ">=":
      ok = value >= threshold;
      comparison = "mayor o igual que";
      break;
    case "<":
      ok = value < threshold;
      comparison = "menor que";
      break;
    case "<=":
      ok = value <= threshold;
      comparison = "menor o igual que";
      break;
  }

  return {
    ok,
    reason: `${biomarker} (${value}) ${ok ? "es" : "NO es"} ${comparison} ${threshold}`,
  };
}

/**
 * Evalúa una alerta crítica y retorna si se disparó
 */
export function evaluateCriticalAlert(
  alert: CriticalAlert,
  observations: EnrichedObservation[]
): RedFlagFired | null {
  if (!alert.enabled) {
    return null;
  }

  const { all, any } = alert.when;
  const firedBecause: string[] = [];
  const conditionsMet: Array<{ biomarker: string; condition: string; value: number }> = [];
  let alertFired = false;

  // Evalúa condiciones "all"
  if (all && all.length > 0) {
    const allResults = all.map((cond) => evaluateCondition(cond, observations));
    const allOk = allResults.every((r) => r.ok);
    
    allResults.forEach((r, idx) => {
      firedBecause.push(r.reason);
      if (r.ok) {
        const cond = all[idx];
        const value = getBiomarkerValue(observations, cond.biomarker);
        if (value !== null) {
          conditionsMet.push({
            biomarker: cond.biomarker,
            condition: `${cond.operator} ${cond.value ?? ""}`,
            value,
          });
        }
      }
    });

    if (!allOk) {
      return null; // Si "all" falla, la alerta no se dispara
    }
    alertFired = true;
  }

  // Evalúa condiciones "any"
  if (any && any.length > 0) {
    const anyResults = any.map((cond) => evaluateCondition(cond, observations));
    const anyOk = anyResults.some((r) => r.ok);
    
    anyResults.forEach((r, idx) => {
      firedBecause.push(r.reason);
      if (r.ok) {
        const cond = any[idx];
        const value = getBiomarkerValue(observations, cond.biomarker);
        if (value !== null) {
          conditionsMet.push({
            biomarker: cond.biomarker,
            condition: `${cond.operator} ${cond.value ?? ""}`,
            value,
          });
        }
      }
    });

    if (anyOk) {
      alertFired = true;
    } else if (!all) {
      // Si no hay "all" y "any" falla, la alerta no se dispara
      return null;
    }
  }

  if (!alertFired) {
    return null;
  }

  return {
    alert_id: alert.id,
    name: alert.name,
    headline: alert.then.headline,
    why: alert.then.why,
    actions: alert.then.actions,
    doctor_questions: alert.then.doctor_questions,
    tags: alert.then.tags,
    trace: {
      fired_because: firedBecause,
      conditions_met: conditionsMet,
    },
  };
}

/**
 * Evalúa todas las alertas críticas contra un caso
 */
export function evaluateCriticalAlerts(
  alerts: CriticalAlert[],
  rangesOutput: RangesOutput
): RedFlagFired[] {
  const firedFlags: RedFlagFired[] = [];

  for (const alert of alerts) {
    const result = evaluateCriticalAlert(alert, rangesOutput.observations_enriched);
    if (result) {
      firedFlags.push(result);
    }
  }

  return firedFlags;
}



