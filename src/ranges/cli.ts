#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadActiveKb } from "../kb/index.js";
import { CaseInputSchema, type CaseInput, type CaseOutput } from "./types.js";
import { applyReferenceRanges } from "./applier.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "../..");

/**
 * CLI para aplicar reference ranges a casos
 */
export function runCaseRanges(caseFilePath: string): void {
  try {
    console.log("🔍 Aplicando Reference Ranges...\n");

    // 1. Cargar KB activo
    console.log("📚 Cargando Knowledge Base activo...");
    const kb = loadActiveKb({ lint: false }); // Ya validado, skip validation
    console.log(`   ✅ KB versión ${kb.manifest.version} cargado\n`);

    // 2. Leer caso
    console.log(`📄 Leyendo caso: ${caseFilePath}`);
    const caseContent = readFileSync(caseFilePath, "utf-8");
    const caseData = JSON.parse(caseContent);
    const caseInput: CaseInput = CaseInputSchema.parse(caseData);
    console.log(`   ✅ Caso "${caseInput.case_id}" cargado (${caseInput.observations.length} observaciones)\n`);

    // 3. Aplicar reference ranges
    console.log("🔬 Aplicando reference ranges...");
    const { observations_enriched, qa_flags } = applyReferenceRanges(kb, caseInput);
    console.log(`   ✅ ${observations_enriched.length} observaciones procesadas`);

    if (qa_flags.length > 0) {
      console.log(`   ⚠️  ${qa_flags.length} flags de QA encontrados`);
    }
    console.log("");

    // 4. Generar output
    const output: CaseOutput = {
      kb_version: kb.manifest.version,
      case_id: caseInput.case_id,
      patient: {
        age: caseInput.patient.age,
        sex: normalizeSex(caseInput.patient.sex),
      },
      observations_enriched,
      qa_flags,
      trace: {
        ranges_applied: observations_enriched.length,
        observations_processed: observations_enriched.length,
        timestamp: new Date().toISOString(),
      },
    };

    // 5. Escribir archivo de salida
    const caseDir = dirname(caseFilePath);
    const caseBasename = basename(caseFilePath, extname(caseFilePath));
    const outputPath = join(caseDir, `${caseBasename}.ranges.json`);
    
    writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");
    console.log(`💾 Output guardado en: ${outputPath}\n`);

    // 6. Resumen
    console.log("📊 Resumen:");
    const statusCounts = observations_enriched.reduce((acc, obs) => {
      acc[obs.status] = (acc[obs.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    for (const [status, count] of Object.entries(statusCounts)) {
      const emoji = status === "normal" ? "✅" : status === "borderline" ? "⚠️" : status === "critical" ? "🔴" : "❌";
      console.log(`   ${emoji} ${status}: ${count}`);
    }

    if (qa_flags.length > 0) {
      console.log("\n⚠️  Flags de QA:");
      for (const flag of qa_flags) {
        const emoji = flag.severity === "error" ? "❌" : flag.severity === "warning" ? "⚠️" : "ℹ️";
        console.log(`   ${emoji} ${flag.type}: ${flag.message}`);
      }
    }

    console.log("\n✅ Proceso completado exitosamente");
  } catch (error) {
    console.error("\n❌ Error:");
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
      if (error.stack && process.env.DEBUG) {
        console.error("\nStack trace:");
        console.error(error.stack);
      }
    } else {
      console.error(String(error));
    }
    process.exit(1);
  }
}

function normalizeSex(sex: string): "male" | "female" {
  const normalized = sex.toLowerCase();
  if (normalized === "m" || normalized === "male") return "male";
  if (normalized === "f" || normalized === "female") return "female";
  return "male";
}

// CLI entry point
const caseFile = process.argv[2];

if (caseFile) {
  const caseFilePath = caseFile.startsWith("/") || caseFile.match(/^[A-Z]:/)
    ? caseFile
    : join(ROOT_DIR, caseFile);

  runCaseRanges(caseFilePath);
} else {
  console.error("❌ Error: Se requiere un archivo de caso como argumento");
  console.error("\nUso: npm run case:ranges <ruta_al_caso.json>");
  console.error("Ejemplo: npm run case:ranges cases/case_001.json");
  process.exit(1);
}

