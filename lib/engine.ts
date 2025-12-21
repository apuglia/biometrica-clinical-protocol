import { Condition, LabInput, Rule, FiredRule, ReportOutput, Severity } from "./types";

/**
 * Obtiene el valor numérico de un biomarcador, o null si está ausente/inválido
 */
export function getValue(input: LabInput, biomarker: string): number | null {
  const value = input.labs[biomarker];
  if (value === null || value === undefined || typeof value !== "number" || isNaN(value)) {
    return null;
  }
  return value;
}

/**
 * Evalúa una condición individual y retorna si se cumple y por qué
 */
export function evalCondition(
  input: LabInput,
  condition: Condition
): { ok: boolean; because: string } {
  const { biomarker, op } = condition;
  const value = getValue(input, biomarker);

  if (op === "exists") {
    const exists = value !== null;
    return {
      ok: exists,
      because: exists
        ? `${biomarker} está presente (valor: ${value})`
        : `${biomarker} no está presente`,
    };
  }

  if (value === null) {
    return {
      ok: false,
      because: `${biomarker} no está presente`,
    };
  }

  if (op === "between") {
    const { value1, value2 } = condition;
    const min = Math.min(value1, value2);
    const max = Math.max(value1, value2);
    const ok = value >= min && value <= max;
    return {
      ok,
      because: ok
        ? `${biomarker} (${value}) está entre ${min} y ${max}`
        : `${biomarker} (${value}) NO está entre ${min} y ${max}`,
    };
  }

  // Operadores de comparación: >, >=, <, <=
  const { value: threshold } = condition;
  let ok = false;
  let comparison = "";

  switch (op) {
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
    because: `${biomarker} (${value}) ${ok ? "es" : "NO es"} ${comparison} ${threshold}`,
  };
}

/**
 * Evalúa una regla completa y retorna si se disparó y por qué
 */
export function evalRule(input: LabInput, rule: Rule): FiredRule | null {
  if (!rule.enabled) {
    return null;
  }

  const { all, any } = rule.when;
  const firedBecause: string[] = [];
  let ruleFired = false;

  // Evalúa condiciones "all"
  if (all && all.length > 0) {
    const allResults = all.map((cond) => evalCondition(input, cond));
    const allOk = allResults.every((r) => r.ok);
    allResults.forEach((r) => firedBecause.push(r.because));
    if (!allOk) {
      return null; // Si "all" falla, la regla no se dispara
    }
    ruleFired = true;
  }

  // Evalúa condiciones "any"
  if (any && any.length > 0) {
    const anyResults = any.map((cond) => evalCondition(input, cond));
    const anyOk = anyResults.some((r) => r.ok);
    anyResults.forEach((r) => firedBecause.push(r.because));
    if (anyOk) {
      ruleFired = true;
    } else if (!all) {
      // Si no hay "all" y "any" falla, la regla no se dispara
      return null;
    }
  }

  if (!ruleFired) {
    return null;
  }

  return {
    ...rule,
    firedBecause,
  };
}

/**
 * Orden de severidad para ordenamiento
 */
const severityOrder: Record<Severity, number> = {
  red: 4,
  orange: 3,
  yellow: 2,
  green: 1,
};

/**
 * Genera un reporte a partir de input y reglas
 */
export function generateReport(input: LabInput, rules: Rule[]): ReportOutput {
  // Evalúa todas las reglas
  const firedRules: FiredRule[] = [];
  for (const rule of rules) {
    const result = evalRule(input, rule);
    if (result) {
      firedRules.push(result);
    }
  }

  // Ordena por severidad (red > orange > yellow > green)
  firedRules.sort((a, b) => {
    return severityOrder[b.then.severity] - severityOrder[a.then.severity];
  });

  // Construye acciones desde las reglas disparadas
  const actions = firedRules.map((rule) => ({
    severity: rule.then.severity,
    headline: rule.then.headline,
    bullets: rule.then.doNext,
  }));

  return {
    priorities: firedRules,
    actions,
  };
}

