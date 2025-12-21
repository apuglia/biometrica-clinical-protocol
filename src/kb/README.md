# KB Loader & Validator

Este módulo carga y valida el Knowledge Base clínico desde los archivos YAML.

## Uso

### Como módulo

```typescript
import { loadActiveKb } from "./kb/index.js";

// Carga la versión activa del KB
const kb = loadActiveKb();

// Acceso a los datos
console.log(kb.biomarkers.biomarkers.length);
console.log(kb.protocolRules.rules.length);
```

### CLI de validación

```bash
npm run kb:lint
```

Este comando:
1. Lee `clinical_kb/latest.yaml` para obtener la versión activa
2. Carga todos los 8 archivos YAML de esa versión
3. Valida la estructura y consistencia
4. Muestra estadísticas si todo está correcto
5. Muestra errores claros si hay problemas

## Validaciones realizadas

- ✅ **Estructura**: Todos los archivos YAML tienen el formato correcto
- ✅ **IDs únicos**: No hay IDs duplicados dentro de cada categoría
- ✅ **Referencias de biomarkers**: Todas las referencias a biomarkers existen
- ✅ **Referencias de actions**: Todas las referencias a actions existen
- ✅ **Referencias de evidence**: Todas las referencias a rules/alerts existen
- ✅ **Biomarkers calculados**: Los `depends_on` referencian biomarkers existentes

## Mensajes de error

Los mensajes de error están diseñados para ser claros tanto para desarrolladores como para médicos:

- **Errores de estructura**: Indican el archivo y la línea del problema
- **Errores de validación**: Indican qué campo tiene el problema y qué se esperaba
- **Errores de consistencia**: Indican qué referencia está rota y en qué contexto

## Estructura esperada

```
clinical_kb/
  latest.yaml                    # Versión activa
  versions/
    0.1.0/
      01_kb_manifest.yaml        # Metadata de versión
      02_biomarker_dictionary.yaml
      03_reference_ranges.yaml
      04_critical_alerts.yaml
      05_protocol_rules.yaml
      06_recommendation_library.yaml
      07_evidence_library.yaml
      08_disclaimer_texts.yaml
```

