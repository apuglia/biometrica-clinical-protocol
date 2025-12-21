"use client";

import { useState } from "react";
import { protocolRules } from "../../../protocol/protocol";
import { generateReport } from "../../../lib/engine";
import { LabInput } from "../../../lib/types";
import normalFixture from "../../../fixtures/normal.json";
import cardioRiskFixture from "../../../fixtures/cardio_risk.json";
import thyroidFixture from "../../../fixtures/thyroid.json";
import inflammationFixture from "../../../fixtures/inflammation.json";
import anemiaFixture from "../../../fixtures/anemia.json";
import redflagFixture from "../../../fixtures/redflag.json";

const fixtures = {
  normal: normalFixture as LabInput,
  cardio_risk: cardioRiskFixture as LabInput,
  thyroid: thyroidFixture as LabInput,
  inflammation: inflammationFixture as LabInput,
  anemia: anemiaFixture as LabInput,
  redflag: redflagFixture as LabInput,
};

const fixtureLabels: Record<keyof typeof fixtures, string> = {
  normal: "Normal",
  cardio_risk: "Riesgo Cardiovascular",
  thyroid: "Tiroides",
  inflammation: "Inflamación",
  anemia: "Anemia",
  redflag: "Red Flags (Emergencia)",
};

const severityColors: Record<string, { bg: string; text: string; border: string }> = {
  red: { bg: "#fee2e2", text: "#991b1b", border: "#dc2626" },
  orange: { bg: "#fed7aa", text: "#9a3412", border: "#ea580c" },
  yellow: { bg: "#fef3c7", text: "#78350f", border: "#d97706" },
  green: { bg: "#d1fae5", text: "#065f46", border: "#10b981" },
};

export default function PlaygroundPage() {
  const [selectedFixture, setSelectedFixture] = useState<keyof typeof fixtures>("normal");

  const currentInput = fixtures[selectedFixture];
  const report = generateReport(currentInput, protocolRules);

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Clinical Rules Engine — Playground
      </h1>

      <div style={{ marginBottom: "2rem" }}>
        <label htmlFor="fixture-select" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
          Selecciona un fixture:
        </label>
        <select
          id="fixture-select"
          value={selectedFixture}
          onChange={(e) => setSelectedFixture(e.target.value as keyof typeof fixtures)}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            minWidth: "250px",
          }}
        >
          {Object.entries(fixtureLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
        {/* Input JSON */}
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>Input JSON</h2>
          <pre
            style={{
              background: "#f5f5f5",
              padding: "1rem",
              borderRadius: "4px",
              overflow: "auto",
              fontSize: "0.875rem",
              border: "1px solid #ddd",
              maxHeight: "400px",
            }}
          >
            {JSON.stringify(currentInput, null, 2)}
          </pre>
        </div>

        {/* Stats */}
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>Estadísticas</h2>
          <div style={{ background: "#f9fafb", padding: "1rem", borderRadius: "4px", border: "1px solid #ddd" }}>
            <p>
              <strong>Reglas disparadas:</strong> {report.priorities.length}
            </p>
            <p>
              <strong>Severidad máxima:</strong>{" "}
              {report.priorities[0]?.then.severity || "ninguna"}
            </p>
            <p>
              <strong>Biomarcadores presentes:</strong> {Object.keys(currentInput.labs).length}
            </p>
          </div>
        </div>
      </div>

      {/* Priorities */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>Prioridades</h2>
        {report.priorities.length === 0 ? (
          <p style={{ color: "#666", fontStyle: "italic" }}>No se dispararon reglas</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {report.priorities.map((rule) => {
              const severity = rule.then.severity;
              const colors = severityColors[severity];
              return (
                <div
                  key={rule.id}
                  style={{
                    border: `2px solid ${colors.border}`,
                    borderRadius: "8px",
                    padding: "1rem",
                    background: colors.bg,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <span
                      style={{
                        background: colors.border,
                        color: "white",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "4px",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        textTransform: "uppercase",
                      }}
                    >
                      {severity}
                    </span>
                    <span style={{ fontSize: "0.875rem", color: "#666" }}>{rule.name}</span>
                  </div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem", color: colors.text }}>
                    {rule.then.headline}
                  </h3>
                  {rule.then.why && (
                    <p style={{ marginBottom: "0.75rem", color: "#555" }}>{rule.then.why}</p>
                  )}
                  <div style={{ marginBottom: "0.75rem" }}>
                    <strong style={{ display: "block", marginBottom: "0.25rem" }}>Acciones recomendadas:</strong>
                    <ul style={{ marginLeft: "1.5rem", color: "#444" }}>
                      {rule.then.doNext.map((action, idx) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </ul>
                  </div>
                  <details style={{ marginTop: "0.5rem" }}>
                    <summary style={{ cursor: "pointer", color: "#666", fontSize: "0.875rem" }}>
                      Why it fired (debug)
                    </summary>
                    <ul style={{ marginLeft: "1.5rem", marginTop: "0.5rem", fontSize: "0.875rem", color: "#555" }}>
                      {rule.firedBecause.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </details>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Plan */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>Plan de Acción</h2>
        {report.actions.length === 0 ? (
          <p style={{ color: "#666", fontStyle: "italic" }}>No hay acciones recomendadas</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
            {report.actions.map((action, idx) => {
              const colors = severityColors[action.severity];
              return (
                <div
                  key={idx}
                  style={{
                    border: `1px solid ${colors.border}`,
                    borderRadius: "8px",
                    padding: "1rem",
                    background: colors.bg,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <span
                      style={{
                        background: colors.border,
                        color: "white",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        textTransform: "uppercase",
                      }}
                    >
                      {action.severity}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.75rem", color: colors.text }}>
                    {action.headline}
                  </h3>
                  <ul style={{ marginLeft: "1.5rem", fontSize: "0.875rem", color: "#444" }}>
                    {action.bullets.map((bullet, bulletIdx) => (
                      <li key={bulletIdx} style={{ marginBottom: "0.25rem" }}>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

