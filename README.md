# Biometrica Clinical Protocol — V1

Clinical Rules Engine + Playground para probar fixtures de laboratorio.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install
# o
pnpm install

# Iniciar servidor de desarrollo
npm run dev
# o
pnpm dev
```

Abre [http://localhost:3000/playground](http://localhost:3000/playground) en tu navegador.

## 📁 Estructura del Proyecto

```
biometrica-clinical-protocol/
├── lib/
│   ├── types.ts        # Definiciones de tipos TypeScript
│   └── engine.ts       # Motor de evaluación de reglas
├── protocol/
│   └── protocol.ts     # ⭐ Archivo único que edita el cofounder
├── fixtures/
│   ├── normal.json
│   ├── cardio_risk.json
│   ├── thyroid.json
│   ├── inflammation.json
│   ├── anemia.json
│   └── redflag.json
└── src/app/
    └── playground/
        └── page.tsx    # Interfaz del playground
```

## ✏️ Cómo Editar Reglas (Para el Cofounder)

**El cofounder solo necesita editar un archivo: `protocol/protocol.ts`**

Este archivo exporta un array `protocolRules` con todas las reglas clínicas. Cada regla sigue esta estructura:

```typescript
{
  id: "identificador_unico",
  enabled: true,
  name: "Nombre descriptivo de la regla",
  when: {
    all: [{ biomarker: "glucose", op: ">=", value: 126 }],  // Todas deben cumplirse
    any: [{ biomarker: "tsh", op: ">=", value: 4.5 }]       // Al menos una debe cumplirse (opcional)
  },
  then: {
    severity: "orange",  // "green" | "yellow" | "orange" | "red"
    headline: "Título breve (≤120 caracteres)",
    why: "Explicación opcional del porqué",
    doNext: [
      "Acción 1",
      "Acción 2",
      // Máximo 5 bullets
    ],
    doctorQuestions: ["Pregunta opcional para el médico"],
    tags: ["tag1", "tag2"]  // Opcional
  }
}
```

### Operadores Disponibles

- `">"`, `">="`, `"<"`, `"<="`: Comparaciones numéricas
- `"between"`: Requiere `value1` y `value2` (ej: `{ biomarker: "ldl_c", op: "between", value1: 160, value2: 189 }`)
- `"exists"`: Verifica que el biomarcador esté presente (sin valor numérico)

### Ejemplo: Agregar una Nueva Regla

```typescript
{
  id: "nueva_regla_ejemplo",
  enabled: true,
  name: "Colesterol total elevado",
  when: {
    all: [{ biomarker: "total_cholesterol", op: ">=", value: 240 }],
  },
  then: {
    severity: "yellow",
    headline: "Colesterol total elevado: considera optimización",
    doNext: [
      "Discute con tu médico sobre tu perfil lipídico completo",
      "Considera cambios en dieta",
      "Evalúa actividad física regular",
    ],
    tags: ["lípidos"],
  },
},
```

## 📊 Cómo Agregar un Fixture

Los fixtures son casos de prueba en `fixtures/*.json`. Cada fixture incluye:

```json
{
  "patient": {
    "sex": "M" | "F",
    "age": 35
  },
  "labs": {
    "glucose": 92,
    "ldl_c": 110,
    "tsh": 2.1,
    // ... más biomarcadores
  }
}
```

**Pasos para agregar un fixture:**

1. Crea un nuevo archivo en `fixtures/` (ej: `mi_fixture.json`)
2. Usa el formato JSON mostrado arriba
3. Importa el fixture en `src/app/playground/page.tsx` y agrégalo al objeto `fixtures` y `fixtureLabels`

### Biomarcadores Comunes Disponibles

- Lípidos: `ldl_c`, `hdl_c`, `triglycerides`, `total_cholesterol`
- Glucosa: `glucose`, `a1c`
- Tiroides: `tsh`, `ft4`
- Vitamina D: `vitamin_d_25oh`
- Anemia: `hemoglobin`, `ferritin`
- Inflamación: `hs_crp`
- Renal: `creatinine`, `egfr`
- Electrolytes: `potassium`, `sodium`

**Nota:** Usa nombres en `snake_case` para consistencia.

## 📋 Guía de Estilo del Texto Clínico

### ⚠️ Restricciones Importantes

1. **NO hacer diagnóstico**: El texto debe sugerir, no diagnosticar
2. **NO prescribir tratamiento**: Evitar instrucciones médicas específicas
3. **NO reemplazar atención médica**: Siempre dirigir a consultar con un médico

### ✅ Lenguaje Recomendado

- ✅ "Discute con tu médico sobre..."
- ✅ "Considera..."
- ✅ "Puede requerir..."
- ✅ "Recomendamos consultar..."
- ✅ "Seguimiento recomendado..."
- ✅ "Repite la prueba..."

### ❌ Lenguaje a Evitar

- ❌ "Tienes diabetes" → ✅ "Glucosa elevada: posible diabetes o prediabetes"
- ❌ "Toma este medicamento" → ✅ "Tu médico puede recomendar medicamentos"
- ❌ "Estás enfermo" → ✅ "Estos valores requieren evaluación médica"

### Headlines

- Máximo ~120 caracteres
- Claro y directo
- Incluye severidad cuando sea relevante
- Ejemplo: "Glucosa críticamente elevada: requiere atención inmediata"

### DoNext (Acciones)

- Máximo 5 bullets
- Orden de prioridad (más importante primero)
- Accionable para el paciente
- Siempre incluir "consultar con médico" cuando sea necesario

## 🎨 Playground

El playground (`/playground`) permite:

1. **Seleccionar un fixture** del dropdown
2. **Ver el input JSON** del caso
3. **Ver las reglas disparadas** (prioridades) con:
   - Badge de severidad
   - Headline
   - Why (si está definido)
   - DoNext (acciones recomendadas)
   - Details expandible con `firedBecause` (debug)
4. **Ver el plan de acción** como tarjetas agrupadas por severidad

## 🧪 Testing Local

```bash
# Build de producción
npm run build

# Ejecutar build de producción
npm start
```

## 📝 Notas Técnicas

- El engine evalúa reglas de forma "suave": no lanza excepciones por datos raros
- Las reglas se ordenan por severidad: `red > orange > yellow > green`
- Los biomarcadores ausentes (`null`, `undefined`, `NaN`) se tratan como no presentes
- Las condiciones `all` deben cumplirse todas; `any` requiere al menos una
- Si una regla tiene `enabled: false`, no se evalúa

## 🔧 Desarrollo

Este proyecto usa:
- Next.js 16 (App Router)
- TypeScript
- Sin dependencias externas de UI (estilos inline)

---

**Versión:** V1  
**Última actualización:** 2025
