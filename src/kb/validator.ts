import type {
  KnowledgeBase,
  Biomarker,
  ReferenceRange,
  Action,
  Rule,
  CriticalAlert,
} from "./types.js";

export interface ValidationError {
  message: string;
  context?: string;
}

/**
 * Valida la consistencia del knowledge base completo
 */
export function validateKnowledgeBase(kb: KnowledgeBase): void {
  const errors: ValidationError[] = [];

  // 1. Validar IDs únicos
  validateUniqueIds(kb, errors);

  // 2. Validar referencias a biomarkers
  validateBiomarkerReferences(kb, errors);

  // 3. Validar referencias a actions
  validateActionReferences(kb, errors);

  // 4. Validar referencias en evidence
  validateEvidenceReferences(kb, errors);

  // 5. Validar referencias en depends_on (biomarkers calculados)
  validateCalculatedBiomarkers(kb, errors);

  // Si hay errores, lanzarlos
  if (errors.length > 0) {
    const errorMessages = errors.map((err) => {
      if (err.context) {
        return `  ❌ ${err.message}\n     Contexto: ${err.context}`;
      }
      return `  ❌ ${err.message}`;
    }).join("\n\n");

    throw new Error(
      `\n❌ Errores de consistencia encontrados:\n\n${errorMessages}\n`
    );
  }
}

/**
 * Valida que todos los IDs sean únicos dentro de sus categorías
 */
function validateUniqueIds(kb: KnowledgeBase, errors: ValidationError[]): void {
  // Biomarkers
  const biomarkerIds = new Set<string>();
  for (const biomarker of kb.biomarkers.biomarkers) {
    if (biomarkerIds.has(biomarker.id)) {
      errors.push({
        message: `ID duplicado en biomarkers: "${biomarker.id}"`,
        context: `Biomarker: ${biomarker.name}`,
      });
    }
    biomarkerIds.add(biomarker.id);
  }

  // Actions
  const actionIds = new Set<string>();
  for (const action of kb.recommendationLibrary.actions) {
    if (actionIds.has(action.id)) {
      errors.push({
        message: `ID duplicado en actions: "${action.id}"`,
        context: `Action: ${action.text}`,
      });
    }
    actionIds.add(action.id);
  }

  // Rules
  const ruleIds = new Set<string>();
  for (const rule of kb.protocolRules.rules) {
    if (ruleIds.has(rule.id)) {
      errors.push({
        message: `ID duplicado en rules: "${rule.id}"`,
        context: `Rule: ${rule.name}`,
      });
    }
    ruleIds.add(rule.id);
  }

  // Critical Alerts
  const alertIds = new Set<string>();
  for (const alert of kb.criticalAlerts.red_flags) {
    if (alertIds.has(alert.id)) {
      errors.push({
        message: `ID duplicado en critical alerts: "${alert.id}"`,
        context: `Alert: ${alert.name}`,
      });
    }
    alertIds.add(alert.id);
  }

  // Verificar que rules y alerts no tengan IDs duplicados entre sí
  for (const rule of kb.protocolRules.rules) {
    if (alertIds.has(rule.id)) {
      errors.push({
        message: `ID "${rule.id}" está duplicado entre rules y critical alerts`,
        context: `Rule: ${rule.name}`,
      });
    }
  }
}

/**
 * Valida que todas las referencias a biomarkers existan
 */
function validateBiomarkerReferences(kb: KnowledgeBase, errors: ValidationError[]): void {
  const biomarkerIds = new Set(kb.biomarkers.biomarkers.map((b) => b.id));

  // Validar en reference ranges
  for (const range of kb.referenceRanges.reference_ranges) {
    if (!biomarkerIds.has(range.biomarker)) {
      errors.push({
        message: `Reference range referencia biomarker inexistente: "${range.biomarker}"`,
        context: `Reference Range para: ${range.biomarker}`,
      });
    }
  }

  // Validar en rules
  for (const rule of kb.protocolRules.rules) {
    const conditions = [
      ...(rule.when.all || []),
      ...(rule.when.any || []),
    ];
    for (const condition of conditions) {
      if (condition.operator !== "exists" && !biomarkerIds.has(condition.biomarker)) {
        errors.push({
          message: `Rule "${rule.id}" referencia biomarker inexistente: "${condition.biomarker}"`,
          context: `Rule: ${rule.name}`,
        });
      }
    }
  }

  // Validar en critical alerts
  for (const alert of kb.criticalAlerts.red_flags) {
    const conditions = [
      ...(alert.when.all || []),
      ...(alert.when.any || []),
    ];
    for (const condition of conditions) {
      if (condition.operator !== "exists" && !biomarkerIds.has(condition.biomarker)) {
        errors.push({
          message: `Critical alert "${alert.id}" referencia biomarker inexistente: "${condition.biomarker}"`,
          context: `Alert: ${alert.name}`,
        });
      }
    }
  }
}

/**
 * Valida que todas las referencias a actions existan
 */
function validateActionReferences(kb: KnowledgeBase, errors: ValidationError[]): void {
  const actionIds = new Set(kb.recommendationLibrary.actions.map((a) => a.id));

  // Validar en rules
  for (const rule of kb.protocolRules.rules) {
    for (const actionRef of rule.then.actions) {
      // Las acciones pueden tener formato "id" o "id:param"
      const actionId = actionRef.split(":")[0];
      if (!actionIds.has(actionId)) {
        errors.push({
          message: `Rule "${rule.id}" referencia action inexistente: "${actionId}"`,
          context: `Rule: ${rule.name}, Action ref: ${actionRef}`,
        });
      }
    }
  }

  // Validar en critical alerts
  for (const alert of kb.criticalAlerts.red_flags) {
    for (const actionRef of alert.then.actions) {
      const actionId = actionRef.split(":")[0];
      if (!actionIds.has(actionId)) {
        errors.push({
          message: `Critical alert "${alert.id}" referencia action inexistente: "${actionId}"`,
          context: `Alert: ${alert.name}, Action ref: ${actionRef}`,
        });
      }
    }
  }
}

/**
 * Valida que todas las referencias en evidence apunten a rules o alerts existentes
 */
function validateEvidenceReferences(kb: KnowledgeBase, errors: ValidationError[]): void {
  const ruleIds = new Set(kb.protocolRules.rules.map((r) => r.id));
  const alertIds = new Set(kb.criticalAlerts.red_flags.map((a) => a.id));
  const allIds = new Set([...ruleIds, ...alertIds]);

  for (const evidence of kb.evidenceLibrary.evidence) {
    if (!allIds.has(evidence.rule_id)) {
      errors.push({
        message: `Evidence referencia rule/alert inexistente: "${evidence.rule_id}"`,
        context: `Evidence para: ${evidence.rule_id}`,
      });
    }
  }
}

/**
 * Valida que los biomarkers calculados referencien biomarkers existentes
 */
function validateCalculatedBiomarkers(kb: KnowledgeBase, errors: ValidationError[]): void {
  const biomarkerIds = new Set(kb.biomarkers.biomarkers.map((b) => b.id));

  for (const biomarker of kb.biomarkers.biomarkers) {
    if (biomarker.calculated && biomarker.depends_on) {
      for (const depId of biomarker.depends_on) {
        if (!biomarkerIds.has(depId)) {
          errors.push({
            message: `Biomarker calculado "${biomarker.id}" depende de biomarker inexistente: "${depId}"`,
            context: `Biomarker: ${biomarker.name}, Método: ${biomarker.calculation_method || "N/A"}`,
          });
        }
      }
    }
  }
}

