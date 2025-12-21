import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import {
  LatestSchema,
  ManifestSchema,
  BiomarkerDictionarySchema,
  ReferenceRangesSchema,
  CriticalAlertsSchema,
  ProtocolRulesSchema,
  RecommendationLibrarySchema,
  EvidenceLibrarySchema,
  DisclaimerTextsSchema,
  KnowledgeBaseSchema,
  type KnowledgeBase,
  type Latest,
} from "./types.js";
import { validateKnowledgeBase } from "./validator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "../..");

interface LoadOptions {
  lint?: boolean;
}

/**
 * Carga el archivo latest.yaml y retorna la versión activa
 */
export function loadLatest(): Latest {
  const latestPath = join(ROOT_DIR, "clinical_kb", "latest.yaml");
  
  try {
    const content = readFileSync(latestPath, "utf-8");
    const data = parseYaml(content);
    return LatestSchema.parse(data);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      throw new Error(`❌ No se encontró el archivo latest.yaml en: ${latestPath}`);
    }
    throw new Error(`❌ Error al parsear latest.yaml: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Carga todos los archivos YAML de una versión específica
 */
export function loadKnowledgeBase(version: string, options: LoadOptions = {}): KnowledgeBase {
  const versionPath = join(ROOT_DIR, "clinical_kb", "versions", version);

  // 1. Load manifest
  const manifestPath = join(versionPath, "01_kb_manifest.yaml");
  const manifest = loadYamlFile(manifestPath, "Manifest", ManifestSchema);

  // 2. Load biomarkers
  const biomarkersPath = join(versionPath, "02_biomarker_dictionary.yaml");
  const biomarkers = loadYamlFile(biomarkersPath, "Biomarker Dictionary", BiomarkerDictionarySchema);

  // 3. Load reference ranges
  const referenceRangesPath = join(versionPath, "03_reference_ranges.yaml");
  const referenceRanges = loadYamlFile(referenceRangesPath, "Reference Ranges", ReferenceRangesSchema);

  // 4. Load critical alerts
  const criticalAlertsPath = join(versionPath, "04_critical_alerts.yaml");
  const criticalAlerts = loadYamlFile(criticalAlertsPath, "Critical Alerts", CriticalAlertsSchema);

  // 5. Load protocol rules
  const protocolRulesPath = join(versionPath, "05_protocol_rules.yaml");
  const protocolRules = loadYamlFile(protocolRulesPath, "Protocol Rules", ProtocolRulesSchema);

  // 6. Load recommendation library
  const recommendationLibraryPath = join(versionPath, "06_recommendation_library.yaml");
  const recommendationLibrary = loadYamlFile(
    recommendationLibraryPath,
    "Recommendation Library",
    RecommendationLibrarySchema
  );

  // 7. Load evidence library
  const evidenceLibraryPath = join(versionPath, "07_evidence_library.yaml");
  const evidenceLibrary = loadYamlFile(evidenceLibraryPath, "Evidence Library", EvidenceLibrarySchema);

  // 8. Load disclaimer texts
  const disclaimerTextsPath = join(versionPath, "08_disclaimer_texts.yaml");
  const disclaimerTexts = loadYamlFile(disclaimerTextsPath, "Disclaimer Texts", DisclaimerTextsSchema);

  const kb: KnowledgeBase = {
    manifest,
    biomarkers,
    referenceRanges,
    criticalAlerts,
    protocolRules,
    recommendationLibrary,
    evidenceLibrary,
    disclaimerTexts,
  };

  // Validate consistency
  if (options.lint !== false) {
    validateKnowledgeBase(kb);
  }

  return kb;
}

/**
 * Carga la versión activa del knowledge base
 */
export function loadActiveKb(options: LoadOptions = {}): KnowledgeBase {
  const latest = loadLatest();
  return loadKnowledgeBase(latest.active_version, options);
}

/**
 * Helper para cargar y validar un archivo YAML
 */
function loadYamlFile<T>(
  filePath: string,
  displayName: string,
  schema: import("zod").ZodSchema<T>
): T {
  try {
    const content = readFileSync(filePath, "utf-8");
    const data = parseYaml(content);
    return schema.parse(data);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      throw new Error(`❌ No se encontró el archivo ${displayName} en: ${filePath}`);
    }
    
    // Zod validation errors
    if (error && typeof error === "object" && "issues" in error) {
      const zodError = error as { issues: Array<{ path: (string | number)[]; message: string }> };
      const issues = zodError.issues.map((issue) => {
        const path = issue.path.join(".");
        return `  - ${path ? `${path}: ` : ""}${issue.message}`;
      }).join("\n");
      
      throw new Error(
        `❌ Error de validación en ${displayName}:\n${issues}\n\nArchivo: ${filePath}`
      );
    }
    
    throw new Error(
      `❌ Error al parsear ${displayName}: ${error instanceof Error ? error.message : String(error)}\n\nArchivo: ${filePath}`
    );
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}` || process.argv.includes("--lint")) {
  try {
    console.log("🔍 Validando Knowledge Base...\n");
    
    const kb = loadActiveKb({ lint: true });
    
    console.log("✅ Knowledge Base válido!");
    console.log(`\n📊 Estadísticas:`);
    const latest = loadLatest();
    console.log(`   - Versión activa: ${latest.active_version}`);
    console.log(`   - Versión manifest: ${kb.manifest.version}`);
    console.log(`   - Biomarcadores: ${kb.biomarkers.biomarkers.length}`);
    console.log(`   - Rangos de referencia: ${kb.referenceRanges.reference_ranges.length}`);
    console.log(`   - Alertas críticas: ${kb.criticalAlerts.red_flags.length}`);
    console.log(`   - Reglas de protocolo: ${kb.protocolRules.rules.length}`);
    console.log(`   - Acciones recomendadas: ${kb.recommendationLibrary.actions.length}`);
    console.log(`   - Entradas de evidencia: ${kb.evidenceLibrary.evidence.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error de validación:\n");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

