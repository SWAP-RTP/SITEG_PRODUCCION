/**
 * Identifica los encabezados de una tabla de filas.
 * Devuelve los headers y el índice donde empiezan los datos.
 */
export const identificarEncabezados = (filas: any[]): { headers: string[]; startIdx: number } => {
  if (!filas || filas.length === 0) return { headers: [], startIdx: 0 };

  const primera = filas[0];

  // Caso 1: la primera fila es un array de strings -> es encabezado
  if (Array.isArray(primera) && primera.every((c) => typeof c === "string")) {
    return { headers: primera.map((h) => (h ? String(h).trim() : "")), startIdx: 1 };
  }

  // Caso 2: la fila es un objeto -> usar sus keys como headers
  if (!Array.isArray(primera) && typeof primera === "object") {
    return { headers: Object.keys(primera), startIdx: 0 };
  }

  // Caso 3: no hay encabezado explícito -> generar col1, col2, ...
  const maxLen = Math.max(
    0,
    ...filas.map((r) => (Array.isArray(r) ? r.length : Object.keys(r || {}).length))
  );
  const headers = Array.from({ length: Math.max(1, maxLen) }, (_, i) => `col${i + 1}`);
  return { headers, startIdx: 0 };
};

/**
 * Normaliza una fila (array u objeto) a un objeto con los headers dados.
 */
export const parsearFila = (fila: any, headers: string[]): Record<string, any> => {
  const salida: Record<string, any> = {};

  if (Array.isArray(fila)) {
    for (let i = 0; i < headers.length; i++) {
      salida[headers[i]] = i < fila.length ? fila[i] : null;
    }
    return salida;
  }

  if (fila && typeof fila === "object") {
    // Rellenar según headers, si falta la key se pone null
    for (const h of headers) {
      if (h in fila) salida[h] = fila[h];
      else {
        // intentar buscar por coincidencia insensible a mayúsculas
        const foundKey = Object.keys(fila).find((k) => k.toLowerCase() === h.toLowerCase());
        salida[h] = foundKey ? fila[foundKey] : null;
      }
    }
    // incluir keys extras que no formen parte de headers
    for (const k of Object.keys(fila)) {
      if (!headers.includes(k)) salida[k] = fila[k];
    }
    return salida;
  }

  return salida;
};

/**
 * Elimina filas duplicadas exactas (por JSON.stringify) manteniendo el orden.
 */
export const dedupeFilas = (rows: any[]) => {
  const seen = new Set<string>();
  const out: any[] = [];
  for (const r of rows) {
    let key: string;
    try {
      // normalizar undefined -> null para evitar diferencias por ausencia
      key = JSON.stringify(r, (_, v) => (v === undefined ? null : v));
    } catch {
      // si no se puede stringify, fallback a push (raro)
      out.push(r);
      continue;
    }
    if (!seen.has(key)) {
      seen.add(key);
      out.push(r);
    }
  }
  return out;
};