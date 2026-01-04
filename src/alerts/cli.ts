#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadKnowledgeBase } from "../kb/index.js";
import { RangesOutputSchema, type AlertsOutput } from "./types.js";
import { evaluateCriticalAlerts } from "./evaluator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "../..");

/**
 * CLI para evaluar alertas críticas en un caso
 */
export function runCaseAlerts(rangesFilePath: string): void {
  try {
    console.log("🔴 Evaluando Alertas Críticas...\n");

    // 1. Leer el archivo ranges (output del Hito 2)
    console.log(`📄 Leyendo caso ranges: ${rangesFilePath}`);
    const rangesContent = readFileSync(rangesFilePath, "utf-8");
    const rangesData = JSON.parse(rangesContent);
    const rangesOutput = RangesOutputSchema.parse(rangesData);
    console.log(`   ✅ Caso "${rangesOutput.case_id}" cargado (KB ${rangesOutput.kb_version})`);
    console.log(`   📊 ${rangesOutput.observations_enriched.length} observaciones\n`);

    // 2. Cargar KB de la versión del caso
    console.log(`📚 Cargando Knowledge Base versión ${rangesOutput.kb_version}...`);
    const kb = loadKnowledgeBase(rangesOutput.kb_version, { lint: false });
    console.log(`   ✅ KB cargado\n`);

    // 3. Evaluar alertas críticas
    console.log("🔍 Evaluando alertas críticas...");
    const redFlags = evaluateCriticalAlerts(kb.criticalAlerts.red_flags, rangesOutput);
    console.log(`   ✅ ${kb.criticalAlerts.red_flags.length} alertas evaluadas`);
    console.log(`   🔴 ${redFlags.length} alerta(s) crítica(s) disparada(s)\n`);

    // 4. Generar output
    const output: AlertsOutput = {
      kb_version: rangesOutput.kb_version,
      case_id: rangesOutput.case_id,
      patient: rangesOutput.patient,
      red_flags: redFlags,
      trace: {
        alerts_evaluated: kb.criticalAlerts.red_flags.length,
        alerts_fired: redFlags.length,
        timestamp: new Date().toISOString(),
      },
    };

    // 5. Escribir archivo de salida
    const rangesDir = dirname(rangesFilePath);
    const rangesBasename = basename(rangesFilePath, extname(rangesFilePath));
    // Remover .ranges del nombre si existe
    const caseBasename = rangesBasename.replace(/\.ranges$/, "");
    const outputPath = join(rangesDir, `${caseBasename}.alerts.json`);

    writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");
    console.log(`💾 Output guardado en: ${outputPath}\n`);

    // 6. Resumen
    if (redFlags.length > 0) {
      console.log("🔴 Alertas Críticas Disparadas:");
      for (const flag of redFlags) {
        console.log(`\n   ⚠️  ${flag.headline}`);
        console.log(`      ID: ${flag.alert_id}`);
        if (flag.why) {
          console.log(`      Por qué: ${flag.why}`);
        }
        console.log(`      Acciones: ${flag.actions.length}`);
        if (flag.doctor_questions && flag.doctor_questions.length > 0) {
          console.log(`      Preguntas para médico: ${flag.doctor_questions.length}`);
        }
      }
      console.log("");
    } else {
      console.log("✅ No se dispararon alertas críticas\n");
    }

    console.log("✅ Proceso completado exitosamente");
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

// CLI entry point
const rangesFile = process.argv[2];

if (rangesFile) {
  const rangesFilePath = rangesFile.startsWith("/") || rangesFile.match(/^[A-Z]:/)
    ? rangesFile
    : join(ROOT_DIR, rangesFile);

  runCaseAlerts(rangesFilePath);
} else {
  console.error("❌ Error: Se requiere un archivo ranges como argumento");
  console.error("\nUso: npm run case:alerts <ruta_al_caso.ranges.json>");
  console.error("Ejemplo: npm run case:alerts cases/case_001.ranges.json");
  process.exit(1);
}



