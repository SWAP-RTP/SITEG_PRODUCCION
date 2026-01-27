/**
 * Convierte un número decimal de Excel a string hora "HH:mm".
 * Ejemplo: 0.5 -> "12:00"
 */
/**
 * Convierte un número decimal de Excel a string hora "HH:mm".
 *
 * Ejemplo: 0.5 -> "12:00"
 *
 * @param val Valor decimal de Excel
 * @returns Hora en formato HH:mm o null
 */
export const excelTimeToHHMM = (val: any): string | null => {
	// val: número decimal de Excel (por ejemplo 0.5 -> 12:00). Si es >=1 toma la fracción.
	if (val === null || val === undefined) return null;
	if (typeof val !== "number") {
		// si ya es string con formato hora devuélvelo
		return String(val);
	}
	const frac = val - Math.floor(val);
	const totalMinutes = Math.round(frac * 24 * 60);
	let hours = Math.floor(totalMinutes / 60);
	let minutes = totalMinutes % 60;
	// corregir
	if (minutes === 60) {
		hours = (hours + 1) % 24;
		minutes = 0;
	}
	const hh = String(hours).padStart(2, "0");
	const mm = String(minutes).padStart(2, "0");
	return `${hh}:${mm}`;
};

/**
 * Formatea una celda: si es número pequeño lo interpreta como hora, si no lo convierte a string.
 */
/**
 * Formatea una celda: si es número pequeño lo interpreta como hora, si no lo convierte a string.
 *
 * @param v Valor de la celda
 * @returns Valor formateado (hora o string)
 */
export const fmtCell = (v: any) => {
	if (v === null || v === undefined) return null;
	if (typeof v === "number") {
		// considerar números pequeños como tiempos (fracción de día)
		if (v >= 0 && v < 2) return excelTimeToHHMM(v);
		return v;
	}
	return String(v);
};

/**
 * Mapa de columnas de días a sus abreviaturas.
 */
/**
 * Mapa de columnas de días a sus abreviaturas.
 *
 * Relaciona el índice de columna con la abreviatura del día de la semana.
 */
export const dayColsMap: Record<string, string> = {
	col8: "L",
	col9: "M",
	col10: "Mi",
	col11: "J",
	col12: "V",
	col13: "S",
	col14: "D",
};