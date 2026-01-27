/**
 * Convierte letras de columna de Excel (ej. 'A', 'AB') a índice numérico base 0.
 */
/**
 * Convierte letras de columna de Excel (ej. 'A', 'AB') a índice numérico base 0.
 *
 * @param letters Letras de columna (ej. 'A', 'AB')
 * @returns Índice numérico base 0
 */
export const columnLetterToIndex = (letters: string): number => {
  let col = 0;
  for (let i = 0; i < letters.length; i++) {
    col = col * 26 + (letters.charCodeAt(i) - 64);
  }
  return col - 1;
};

/**
 * Convierte una hoja de SheetJS a un arreglo de filas (arrays).
 * Intenta usar el rango !ref para obtener el tamaño real de la hoja.
 */
/**
 * Convierte una hoja de SheetJS a un arreglo de filas (arrays).
 *
 * Intenta usar el rango !ref para obtener el tamaño real de la hoja.
 *
 * @param sheet Hoja de SheetJS
 * @returns Arreglo de filas (arrays)
 */
export const sheetToRows = (sheet: any): any[] => {
  if (!sheet || typeof sheet !== "object") return [];
  const cells = Object.keys(sheet).filter((k) => k[0] !== "!");
  if (cells.length === 0) return [];

  // intentar usar !ref para construir rango
  const range = sheet["!ref"];
  if (range) {
    const [start, end] = range.split(":");
    const sm = start.match(/^([A-Z]+)(\d+)$/);
    const em = end.match(/^([A-Z]+)(\d+)$/);
    if (sm && em) {
      const startRow = parseInt(sm[2], 10);
      const endRow = parseInt(em[2], 10);
      const startCol = columnLetterToIndex(sm[1]);
      const endCol = columnLetterToIndex(em[1]);
      const numRows = endRow - startRow + 1;
      const numCols = endCol - startCol + 1;
      const rows = Array.from({ length: numRows }, () => Array(numCols).fill(null));
      for (const addr of cells) {
        const m = addr.match(/^([A-Z]+)(\d+)$/);
        if (!m) continue;
        const colIdx = columnLetterToIndex(m[1]) - startCol;
        const rowIdx = parseInt(m[2], 10) - startRow;
        const cell = sheet[addr];
        rows[rowIdx][colIdx] = cell?.v ?? cell?.w ?? null;
      }
      return rows;
    }
  }

  // fallback: inferir tamaño por keys
  let maxRow = 0;
  let maxCol = 0;
  const map: Record<string, any> = {};
  for (const addr of cells) {
    const m = addr.match(/^([A-Z]+)(\d+)$/);
    if (!m) continue;
    const col = columnLetterToIndex(m[1]);
    const row = parseInt(m[2], 10) - 1;
    maxRow = Math.max(maxRow, row);
    maxCol = Math.max(maxCol, col);
    map[`${row}_${col}`] = sheet[addr]?.v ?? sheet[addr]?.w ?? null;
  }
  const rows = Array.from({ length: maxRow + 1 }, () => Array(maxCol + 1).fill(null));
  for (const k of Object.keys(map)) {
    const [r, c] = k.split("_").map(Number);
    rows[r][c] = map[k];
  }
  return rows;
};

/**
 * Carga dinámicamente la librería SheetJS (xlsx) si no está cargada globalmente.
 * Devuelve el módulo XLSX o null si no está disponible.
 */
/**
 * Carga dinámicamente la librería SheetJS (xlsx) si no está cargada globalmente.
 *
 * @returns Promesa con el módulo XLSX o null si no está disponible
 */
export const loadXLSX = async (): Promise<any | null> => {
  if ((globalThis as any).XLSX) return (globalThis as any).XLSX;
  try {
    const mod = await import("xlsx");
    const X = (mod && (mod as any).default) ? (mod as any).default : mod;
    (globalThis as any).XLSX = X;
    return X;
  } catch (e) {
    // no disponible -> fallback a CSV/texto
    console.warn("loadXLSX: no se pudo cargar 'xlsx' dinámicamente:", e);
    return null;
  }
};