/**
 * Representa la información asociada a un turno/credencial de una fila.
 *
 * - `value`: valor bruto extraído (por ejemplo: código o etiqueta de turno).
 * - `descansos`: lista opcional de etiquetas de días que corresponden a descansos
 *   extraídos de la sección H..N de la plantilla.
 */
export interface CredencialTurno {
  value: any;
  descansos?: string[]; // etiquetas de días extraídas de H..N (por ejemplo: 'L', 'M', 'Mi', ...)
}

/**
 * Map de credenciales por nombre de turno ('1er Turno', '2do Turno', ...)
 */
export type CredencialMap = Record<string, CredencialTurno>;

/**
 * Representa un registro (fila) del rol.
 *
 * Campos principales:
 * - `no`: número de fila/orden en el rol (puede venir como string si la plantilla lo contiene así).
 * - `economico`, `sistema`: campos opcionales con metadatos del servicio.
 * - `credencial`: map con la información de los tres turnos y sus descansos.
 * - `Lunes a Viernes`, `Sabado`, `Domingo`: bloques horarios organizados por turnos.
 */
export interface Registro {
  no: number | string;
  economico?: any;
  sistema?: any;
  credencial?: CredencialMap;
  "Lunes a Viernes"?: Record<string, any>;
  Sabado?: Record<string, any>;
  Domingo?: Record<string, any>;
}

/**
 * Mapa de encabezado -> lista de valores para el bloque "cubredescansos".
 */
export type Cubredescansos = Record<string, any[]>;

/**
 * Tipo genérico para representar una fila de jornada excepcional.
 */
export type Jornada = Record<string, any>;

/**
 * Resultado devuelto por `parsearHojaCompleta`.
 *
 * - `infoGeneral`: objeto con valores fijos del encabezado (periodo, ruta, origen,
 *    modalidad, destino, modulo). Contiene adicionalmente `notas` (combinadas)
 *    cuando se detectan, y es la única fuente pública para notas.
 * - `servicios`: array de `Registro` con los servicios/filas del rol.
 * - `cubredescansos`: mapa del bloque de cubredescansos (encabezado -> valores).
 * - `jornadas`: array con las jornadas excepcionales detectadas.
 * - `warnings`: lista opcional de advertencias generadas durante el parseo.
 *
 * Nota: las propiedades `porEncabezados` y `notasRaw` no se exponen aquí para
 * evitar duplicidades; si se necesita el raw original, usar utilidades internas
 * o solicitar explícitamente los datos por hoja (`resultadosPorHoja` en el hook).
 */
export interface ResultadoParse {
  infoGeneral: Record<string, any>;
  servicios: Registro[];
  cubredescansos: Cubredescansos;
  jornadas: Jornada[];
  // porEncabezados y notas han sido normalizadas: usar infoGeneral para notas
  warnings?: string[];
}
