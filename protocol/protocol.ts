import { Rule } from "../lib/types";

export const protocolRules: Rule[] = [
  // ========== RED FLAGS ==========
  {
    id: "redflag_glucose_critical",
    enabled: true,
    name: "Glucosa críticamente alta",
    when: {
      all: [{ biomarker: "glucose", op: ">=", value: 400 }],
    },
    then: {
      severity: "red",
      headline: "Glucosa críticamente elevada: requiere atención inmediata",
      why: "Los niveles de glucosa superan 400 mg/dL, lo cual puede indicar una emergencia médica",
      doNext: [
        "Busca atención médica urgente",
        "No conduzcas ni realices actividades que requieran concentración",
        "Mantente hidratado con agua",
        "Si tienes diabetes, contacta a tu endocrinólogo inmediatamente",
      ],
      doctorQuestions: [
        "¿Tienes síntomas de cetoacidosis o hiperglucemia hiperosmolar?",
        "¿Estás tomando medicamentos para la diabetes?",
        "¿Has tenido episodios previos similares?",
      ],
      tags: ["emergencia", "glucosa", "diabetes"],
    },
  },
  {
    id: "redflag_potassium_critical",
    enabled: true,
    name: "Potasio críticamente alto",
    when: {
      all: [{ biomarker: "potassium", op: ">=", value: 6.5 }],
    },
    then: {
      severity: "red",
      headline: "Potasio críticamente elevado: riesgo cardíaco",
      why: "Los niveles de potasio superan 6.5 mEq/L, lo cual puede causar arritmias cardíacas peligrosas",
      doNext: [
        "Busca atención médica urgente",
        "No tomes suplementos de potasio",
        "Evita alimentos altos en potasio hasta consultar con médico",
        "Informa sobre medicamentos que puedas estar tomando (IECA, ARA-II, diuréticos ahorradores de potasio)",
      ],
      doctorQuestions: [
        "¿Tienes síntomas como debilidad muscular o palpitaciones?",
        "¿Tienes función renal alterada?",
        "¿Estás tomando medicamentos que afecten el potasio?",
      ],
      tags: ["emergencia", "electrolitos", "cardíaco"],
    },
  },
  {
    id: "redflag_creatinine_critical",
    enabled: true,
    name: "Función renal críticamente alterada",
    when: {
      all: [{ biomarker: "creatinine", op: ">=", value: 3.0 }],
    },
    then: {
      severity: "red",
      headline: "Función renal severamente alterada",
      why: "La creatinina está muy elevada, indicando posible insuficiencia renal aguda o crónica avanzada",
      doNext: [
        "Consulta con un nefrólogo urgentemente",
        "Revisa medicamentos que puedan afectar la función renal",
        "Mantén una hidratación adecuada (si no hay restricción médica)",
        "Monitorea presión arterial regularmente",
      ],
      doctorQuestions: [
        "¿Tienes antecedentes de enfermedad renal?",
        "¿Has tenido cambios en la producción de orina?",
        "¿Estás tomando medicamentos nefrotóxicos?",
      ],
      tags: ["emergencia", "renal", "función-renal"],
    },
  },

  // ========== LÍPIDOS ==========
  {
    id: "ldl_very_high",
    enabled: true,
    name: "LDL muy elevado",
    when: {
      all: [{ biomarker: "ldl_c", op: ">=", value: 190 }],
    },
    then: {
      severity: "orange",
      headline: "Colesterol LDL muy elevado: requiere evaluación y posible tratamiento",
      why: "LDL ≥ 190 mg/dL se asocia con alto riesgo cardiovascular",
      doNext: [
        "Discute con tu médico sobre estrategias para reducir el LDL",
        "Considera cambios en dieta (reducir grasas saturadas y trans)",
        "Evalúa actividad física regular",
        "Tu médico puede recomendar medicamentos según tu riesgo cardiovascular total",
        "Repite el perfil lipídico en 3-6 meses para evaluar respuesta",
      ],
      tags: ["lípidos", "cardiovascular", "ldl"],
    },
  },
  {
    id: "ldl_high",
    enabled: true,
    name: "LDL elevado",
    when: {
      all: [{ biomarker: "ldl_c", op: "between", value1: 160, value2: 189 }],
    },
    then: {
      severity: "yellow",
      headline: "Colesterol LDL elevado: considera optimización",
      why: "LDL entre 160-189 mg/dL está por encima del óptimo",
      doNext: [
        "Discute con tu médico tu riesgo cardiovascular global",
        "Considera ajustes dietéticos y estilo de vida",
        "Mantén o aumenta actividad física regular",
        "Repite el perfil lipídico en 6 meses para seguimiento",
      ],
      tags: ["lípidos", "ldl"],
    },
  },
  {
    id: "hdl_low",
    enabled: true,
    name: "HDL bajo",
    when: {
      all: [{ biomarker: "hdl_c", op: "<", value: 40 }],
    },
    then: {
      severity: "yellow",
      headline: "Colesterol HDL bajo: factor de riesgo cardiovascular",
      why: "HDL < 40 mg/dL se considera un factor de riesgo cardiovascular",
      doNext: [
        "Aumenta actividad física aeróbica regular",
        "Considera cambios dietéticos (grasas saludables, reducción de carbohidratos refinados)",
        "Si fumas, considera dejar de fumar",
        "Discute con tu médico sobre estrategias para elevar HDL",
      ],
      tags: ["lípidos", "cardiovascular", "hdl"],
    },
  },
  {
    id: "triglycerides_very_high",
    enabled: true,
    name: "Triglicéridos muy elevados",
    when: {
      all: [{ biomarker: "triglycerides", op: ">=", value: 500 }],
    },
    then: {
      severity: "orange",
      headline: "Triglicéridos muy elevados: riesgo de pancreatitis",
      why: "Triglicéridos ≥ 500 mg/dL aumentan el riesgo de pancreatitis aguda",
      doNext: [
        "Consulta con tu médico sobre tratamiento inmediato",
        "Reduce significativamente el consumo de alcohol",
        "Limita azúcares y carbohidratos refinados",
        "Considera medicamentos si tu médico lo indica",
        "Repite la prueba en 1-2 meses para evaluar respuesta",
      ],
      tags: ["lípidos", "triglicéridos", "pancreatitis"],
    },
  },
  {
    id: "triglycerides_high",
    enabled: true,
    name: "Triglicéridos elevados",
    when: {
      all: [{ biomarker: "triglycerides", op: "between", value1: 200, value2: 499 }],
    },
    then: {
      severity: "yellow",
      headline: "Triglicéridos elevados: optimiza estilo de vida",
      why: "Triglicéridos entre 200-499 mg/dL están elevados",
      doNext: [
        "Reduce consumo de azúcares y carbohidratos refinados",
        "Limita o elimina alcohol",
        "Aumenta actividad física regular",
        "Discute con tu médico si necesitas medicamentos",
        "Repite la prueba en 3-6 meses",
      ],
      tags: ["lípidos", "triglicéridos"],
    },
  },

  // ========== GLUCOSA Y DIABETES ==========
  {
    id: "glucose_high",
    enabled: true,
    name: "Glucosa elevada (no crítica)",
    when: {
      all: [{ biomarker: "glucose", op: "between", value1: 126, value2: 399 }],
    },
    then: {
      severity: "orange",
      headline: "Glucosa elevada: posible diabetes o prediabetes",
      why: "Glucosa ≥ 126 mg/dL en ayunas sugiere diabetes o prediabetes",
      doNext: [
        "Consulta con tu médico para confirmar el diagnóstico (puede requerir prueba repetida o hemoglobina glicosilada)",
        "Considera cambios en dieta (reducir azúcares y carbohidratos refinados)",
        "Aumenta actividad física regular",
        "Si ya tienes diagnóstico de diabetes, revisa tu plan de tratamiento",
      ],
      tags: ["glucosa", "diabetes", "metabolismo"],
    },
  },
  {
    id: "glucose_borderline",
    enabled: true,
    name: "Glucosa en rango límite",
    when: {
      all: [{ biomarker: "glucose", op: "between", value1: 100, value2: 125 }],
    },
    then: {
      severity: "yellow",
      headline: "Glucosa en rango límite: monitoreo recomendado",
      why: "Glucosa entre 100-125 mg/dL en ayunas se considera prediabetes",
      doNext: [
        "Discute con tu médico sobre seguimiento",
        "Considera prueba de hemoglobina glicosilada (A1C)",
        "Optimiza dieta y actividad física para prevenir progresión a diabetes",
        "Repite glucosa en ayunas en 3-6 meses",
      ],
      tags: ["glucosa", "prediabetes"],
    },
  },
  {
    id: "a1c_diabetes",
    enabled: true,
    name: "A1C en rango de diabetes",
    when: {
      all: [{ biomarker: "a1c", op: ">=", value: 6.5 }],
    },
    then: {
      severity: "orange",
      headline: "Hemoglobina A1C elevada: posible diabetes",
      why: "A1C ≥ 6.5% es diagnóstico de diabetes",
      doNext: [
        "Consulta con tu médico para confirmar diagnóstico y establecer plan de tratamiento",
        "Considera cambios en dieta y estilo de vida",
        "Monitorea glucosa regularmente si tu médico lo indica",
        "Evalúa riesgo de complicaciones con tu médico",
      ],
      tags: ["diabetes", "a1c", "metabolismo"],
    },
  },
  {
    id: "a1c_prediabetes",
    enabled: true,
    name: "A1C en rango de prediabetes",
    when: {
      all: [{ biomarker: "a1c", op: "between", value1: 5.7, value2: 6.4 }],
    },
    then: {
      severity: "yellow",
      headline: "A1C en rango de prediabetes: intervención temprana recomendada",
      why: "A1C entre 5.7-6.4% indica prediabetes",
      doNext: [
        "Discute con tu médico estrategias para prevenir progresión a diabetes",
        "Considera programa de cambio de estilo de vida",
        "Optimiza dieta (reducir azúcares y carbohidratos refinados)",
        "Aumenta actividad física regular",
        "Repite A1C en 6 meses para seguimiento",
      ],
      tags: ["prediabetes", "a1c"],
    },
  },

  // ========== TIROIDES ==========
  {
    id: "tsh_high",
    enabled: true,
    name: "TSH elevado (posible hipotiroidismo)",
    when: {
      all: [{ biomarker: "tsh", op: ">=", value: 4.5 }],
    },
    then: {
      severity: "yellow",
      headline: "TSH elevado: posible hipotiroidismo",
      why: "TSH ≥ 4.5 mUI/L sugiere posible hipotiroidismo, especialmente si FT4 está bajo",
      doNext: [
        "Consulta con tu médico o endocrinólogo para evaluación completa",
        "Si FT4 está bajo, puede ser necesario tratamiento con hormona tiroidea",
        "Repite pruebas de función tiroidea en 6-12 semanas para confirmar",
        "Menciona síntomas como fatiga, aumento de peso, estreñimiento, sensación de frío",
      ],
      tags: ["tiroides", "tsh", "hipotiroidismo"],
    },
  },
  {
    id: "tsh_low",
    enabled: true,
    name: "TSH suprimido (posible hipertiroidismo)",
    when: {
      all: [{ biomarker: "tsh", op: "<", value: 0.4 }],
    },
    then: {
      severity: "yellow",
      headline: "TSH suprimido: posible hipertiroidismo",
      why: "TSH < 0.4 mUI/L sugiere posible hipertiroidismo, especialmente si FT4 está elevado",
      doNext: [
        "Consulta con tu médico o endocrinólogo para evaluación",
        "Si FT4 está elevado, puede requerir tratamiento",
        "Menciona síntomas como palpitaciones, ansiedad, pérdida de peso, sudoración excesiva",
        "Repite pruebas de función tiroidea para confirmar",
      ],
      tags: ["tiroides", "tsh", "hipertiroidismo"],
    },
  },
  {
    id: "ft4_low",
    enabled: true,
    name: "FT4 bajo",
    when: {
      all: [{ biomarker: "ft4", op: "<", value: 0.8 }],
    },
    then: {
      severity: "orange",
      headline: "Tiroxina libre (FT4) baja: hipotiroidismo confirmado o severo",
      why: "FT4 < 0.8 ng/dL indica hipotiroidismo, especialmente si TSH está elevado",
      doNext: [
        "Consulta urgentemente con endocrinólogo",
        "Probablemente requieras tratamiento con levotiroxina",
        "Monitorea síntomas de hipotiroidismo",
        "Repite pruebas después de iniciar tratamiento según indique tu médico",
      ],
      tags: ["tiroides", "ft4", "hipotiroidismo"],
    },
  },

  // ========== VITAMINA D ==========
  {
    id: "vitamin_d_deficient",
    enabled: true,
    name: "Vitamina D deficiente",
    when: {
      all: [{ biomarker: "vitamin_d_25oh", op: "<", value: 20 }],
    },
    then: {
      severity: "yellow",
      headline: "Vitamina D deficiente: suplementación recomendada",
      why: "Vitamina D < 20 ng/mL se considera deficiencia",
      doNext: [
        "Discute con tu médico sobre suplementación con vitamina D",
        "Considera aumentar exposición solar segura (15-20 min/día)",
        "Incluye alimentos ricos en vitamina D en tu dieta",
        "Repite la prueba después de 3 meses de suplementación para evaluar respuesta",
      ],
      tags: ["vitamina-d", "nutrición"],
    },
  },
  {
    id: "vitamin_d_insufficient",
    enabled: true,
    name: "Vitamina D insuficiente",
    when: {
      all: [{ biomarker: "vitamin_d_25oh", op: "between", value1: 20, value2: 29.9 }],
    },
    then: {
      severity: "green",
      headline: "Vitamina D en rango insuficiente: optimización recomendada",
      why: "Vitamina D entre 20-29.9 ng/mL se considera insuficiente (óptimo: ≥30)",
      doNext: [
        "Considera suplementación moderada con tu médico",
        "Aumenta exposición solar segura",
        "Incluye alimentos ricos en vitamina D",
        "Repite la prueba en 6 meses",
      ],
      tags: ["vitamina-d"],
    },
  },

  // ========== ANEMIA ==========
  {
    id: "hemoglobin_low",
    enabled: true,
    name: "Hemoglobina baja (posible anemia)",
    when: {
      all: [{ biomarker: "hemoglobin", op: "<", value: 12 }],
    },
    then: {
      severity: "yellow",
      headline: "Hemoglobina baja: posible anemia",
      why: "Hemoglobina < 12 g/dL sugiere anemia (umbral típico para mujeres, considerar 13 g/dL para hombres)",
      doNext: [
        "Consulta con tu médico para determinar la causa",
        "Si es por deficiencia de hierro, puede requerir suplementación",
        "Considera dieta rica en hierro (carnes, legumbres, vegetales de hoja verde)",
        "Repite hemograma completo en 1-3 meses después de intervención",
      ],
      tags: ["anemia", "hemoglobina"],
    },
  },
  {
    id: "ferritin_low",
    enabled: true,
    name: "Ferritina baja (deficiencia de hierro)",
    when: {
      all: [{ biomarker: "ferritin", op: "<", value: 15 }],
    },
    then: {
      severity: "yellow",
      headline: "Ferritina baja: depósitos de hierro agotados",
      why: "Ferritina < 15 ng/mL indica deficiencia de hierro",
      doNext: [
        "Consulta con tu médico sobre suplementación con hierro",
        "Considera dieta rica en hierro",
        "Si tienes sangrado menstrual abundante, discútelo con tu ginecólogo",
        "Repite ferritina después de 2-3 meses de suplementación",
      ],
      tags: ["anemia", "hierro", "ferritina"],
    },
  },

  // ========== INFLAMACIÓN ==========
  {
    id: "hs_crp_high_risk",
    enabled: true,
    name: "hs-CRP elevado (alto riesgo cardiovascular)",
    when: {
      all: [{ biomarker: "hs_crp", op: ">", value: 3.0 }],
    },
    then: {
      severity: "orange",
      headline: "hs-CRP elevado: mayor riesgo cardiovascular",
      why: "hs-CRP > 3.0 mg/L se asocia con mayor riesgo cardiovascular",
      doNext: [
        "Discute con tu médico sobre estrategias de reducción de riesgo cardiovascular",
        "Optimiza otros factores de riesgo (lípidos, presión arterial, glucosa)",
        "Considera cambios en estilo de vida (dieta antiinflamatoria, ejercicio, manejo de estrés)",
        "Tu médico puede considerar estatinas según tu riesgo total",
      ],
      tags: ["inflamación", "cardiovascular", "hs-crp"],
    },
  },
  {
    id: "hs_crp_moderate_risk",
    enabled: true,
    name: "hs-CRP riesgo moderado",
    when: {
      all: [{ biomarker: "hs_crp", op: "between", value1: 1.0, value2: 3.0 }],
    },
    then: {
      severity: "yellow",
      headline: "hs-CRP en rango de riesgo moderado",
      why: "hs-CRP entre 1.0-3.0 mg/L indica riesgo cardiovascular moderado",
      doNext: [
        "Considera optimizar factores de riesgo cardiovascular",
        "Mantén estilo de vida saludable (dieta, ejercicio, no fumar)",
        "Repite hs-CRP en 6-12 meses si hay otros factores de riesgo",
      ],
      tags: ["inflamación", "cardiovascular"],
    },
  },

  // ========== RENAL ==========
  {
    id: "egfr_reduced",
    enabled: true,
    name: "eGFR reducido (función renal alterada)",
    when: {
      all: [{ biomarker: "egfr", op: "<", value: 60 }],
    },
    then: {
      severity: "orange",
      headline: "Función renal reducida: requiere evaluación",
      why: "eGFR < 60 mL/min/1.73m² indica función renal reducida (estadios 3-5 de ERC)",
      doNext: [
        "Consulta con nefrólogo para evaluación completa",
        "Revisa medicamentos que puedan afectar la función renal",
        "Monitorea presión arterial regularmente",
        "Considera restricciones dietéticas según indique tu médico (proteínas, fósforo, potasio)",
        "Repite función renal en 3-6 meses",
      ],
      tags: ["renal", "egfr", "función-renal"],
    },
  },
  {
    id: "creatinine_elevated",
    enabled: true,
    name: "Creatinina elevada (no crítica)",
    when: {
      all: [{ biomarker: "creatinine", op: "between", value1: 1.2, value2: 2.9 }],
    },
    then: {
      severity: "yellow",
      headline: "Creatinina elevada: función renal alterada",
      why: "Creatinina entre 1.2-2.9 mg/dL sugiere función renal alterada",
      doNext: [
        "Consulta con tu médico para evaluación",
        "Revisa medicamentos que puedan afectar la función renal",
        "Monitorea presión arterial",
        "Mantén hidratación adecuada (si no hay restricción médica)",
        "Repite función renal en 3-6 meses",
      ],
      tags: ["renal", "creatinina"],
    },
  },
];

