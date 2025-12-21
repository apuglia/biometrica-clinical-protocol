/**
 * Parser para rangos de referencia en formato de texto
 * Soporta: "< 100", "100-129", ">= 190", "> 1.8"
 */

export interface ParsedRange {
  min?: number;
  max?: number;
  minInclusive: boolean;
  maxInclusive: boolean;
  type: "less_than" | "greater_than" | "between" | "greater_equal" | "less_equal";
}

/**
 * Parsea un string de rango (ej: "< 100", "100-129", ">= 190")
 */
export function parseRange(rangeText: string): ParsedRange | null {
  const trimmed = rangeText.trim();

  // Menor que: "< 100"
  const lessThanMatch = trimmed.match(/^<\s*([\d.]+)$/);
  if (lessThanMatch) {
    return {
      max: parseFloat(lessThanMatch[1]),
      maxInclusive: false,
      minInclusive: false,
      type: "less_than",
    };
  }

  // Menor o igual: "<= 100"
  const lessEqualMatch = trimmed.match(/^<=\s*([\d.]+)$/);
  if (lessEqualMatch) {
    return {
      max: parseFloat(lessEqualMatch[1]),
      maxInclusive: true,
      minInclusive: false,
      type: "less_equal",
    };
  }

  // Mayor que: "> 100"
  const greaterThanMatch = trimmed.match(/^>\s*([\d.]+)$/);
  if (greaterThanMatch) {
    return {
      min: parseFloat(greaterThanMatch[1]),
      minInclusive: false,
      maxInclusive: false,
      type: "greater_than",
    };
  }

  // Mayor o igual: ">= 100"
  const greaterEqualMatch = trimmed.match(/^>=\s*([\d.]+)$/);
  if (greaterEqualMatch) {
    return {
      min: parseFloat(greaterEqualMatch[1]),
      minInclusive: true,
      maxInclusive: false,
      type: "greater_equal",
    };
  }

  // Rango entre: "100-129" o "100 - 129"
  const betweenMatch = trimmed.match(/^([\d.]+)\s*-\s*([\d.]+)$/);
  if (betweenMatch) {
    const min = parseFloat(betweenMatch[1]);
    const max = parseFloat(betweenMatch[2]);
    return {
      min: Math.min(min, max),
      max: Math.max(min, max),
      minInclusive: true,
      maxInclusive: true,
      type: "between",
    };
  }

  return null;
}

/**
 * Verifica si un valor numérico cumple con un rango parseado
 */
export function valueMatchesRange(value: number, parsedRange: ParsedRange): boolean {
  if (parsedRange.min !== undefined) {
    if (parsedRange.minInclusive) {
      if (value < parsedRange.min) return false;
    } else {
      if (value <= parsedRange.min) return false;
    }
  }

  if (parsedRange.max !== undefined) {
    if (parsedRange.maxInclusive) {
      if (value > parsedRange.max) return false;
    } else {
      if (value >= parsedRange.max) return false;
    }
  }

  return true;
}

