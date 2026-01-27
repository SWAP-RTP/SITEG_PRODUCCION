import { sheetToRows, loadXLSX } from './sheetUtils';
import { identificarEncabezados, parsearFila, dedupeFilas } from './filaUtils';
import { fmtCell, dayColsMap } from './horarioUtils';

/**
 * Parsea una hoja de Excel, archivo o buffer a un arreglo de filas normalizadas.
 * Soporta archivos SheetJS, File, ArrayBuffer o arrays directos.
 * @param hoja - Puede ser un objeto SheetJS, File, ArrayBuffer o array de datos.
 * @param porHoja - Si es true, retorna un array por cada hoja.
 */
export async function parsearHojaCompleta(hoja: any, porHoja?: boolean): Promise<any[]> {
	let filasRaw: any[] = [];

	// 1) Si es un workbook SheetJS ya parseado
	if (hoja && typeof hoja === "object" && Array.isArray(hoja.SheetNames) && hoja.Sheets) {
		if (porHoja) {
			// Devuelve un array de objetos { nombre, filas } por cada hoja
			return hoja.SheetNames.map((name: string) => {
				const rawRows = sheetToRows(hoja.Sheets[name]);
				const { headers, startIdx } = identificarEncabezados(rawRows);
				const filas = [];
				for (let i = startIdx; i < rawRows.length; i++) {
					const fila = rawRows[i];
					const effectiveHeaders =
						headers && headers.length > 0
							? headers
							: Array.isArray(fila)
							? fila.map((_: any, idx: number) => `col${idx + 1}`)
							: Object.keys(fila || {});
					filas.push(parsearFila(fila, effectiveHeaders));
				}
				return { nombre: name, filas };
			});
		} else {
			// Junta todas las filas de todas las hojas
			for (const name of hoja.SheetNames) {
				filasRaw = filasRaw.concat(sheetToRows(hoja.Sheets[name]));
			}
		}
	}
	// 2) Si es un archivo File subido por el usuario
	else if (typeof File !== "undefined" && hoja instanceof File) {
		const name = (hoja.name || "").toLowerCase();
		if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
			const XLSX = await loadXLSX();
			if (!XLSX) {
				console.warn("parsearHojaCompleta: 'xlsx' no disponible para parsear .xlsx");
				return [];
			}
			try {
				const buffer = await hoja.arrayBuffer();
				const wb = XLSX.read(buffer, { type: "array" });
				if (porHoja) {
					return wb.SheetNames.map((nm: string) => {
						const rawRows = XLSX.utils && typeof XLSX.utils.sheet_to_json === "function"
							? XLSX.utils.sheet_to_json(wb.Sheets[nm], { header: 1, raw: true })
							: sheetToRows(wb.Sheets[nm]);
						const { headers, startIdx } = identificarEncabezados(rawRows);
						const filas = [];
						for (let i = startIdx; i < rawRows.length; i++) {
							const fila = rawRows[i];
							const effectiveHeaders =
								headers && headers.length > 0
									? headers
									: Array.isArray(fila)
									? fila.map((_: any, idx: number) => `col${idx + 1}`)
									: Object.keys(fila || {});
							filas.push(parsearFila(fila, effectiveHeaders));
						}
						return { nombre: nm, filas };
					});
				}
				for (const nm of wb.SheetNames) {
					const sheet = wb.Sheets[nm];
					const rows = XLSX.utils && typeof XLSX.utils.sheet_to_json === "function"
						? (XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true }) as any[])
						: sheetToRows(sheet);
					filasRaw = filasRaw.concat(rows);
				}
			} catch (e) {
				console.warn("parsearHojaCompleta: error parseando .xlsx:", e);
				return [];
			}
		}
		// Si es JSON o texto plano
		else {
			const text = await hoja.text();
			try {
				const parsed = JSON.parse(text);
				if (Array.isArray(parsed) || typeof parsed === "object") {
					return parsearHojaCompleta(parsed, porHoja);
				}
			} catch {
				console.warn("parsearHojaCompleta: archivo no soportado y no es texto JSON.");
				return [];
			}
		}
	}
	// 3) Si es un ArrayBuffer o Uint8Array
	else if (hoja && (hoja instanceof ArrayBuffer || hoja instanceof Uint8Array)) {
		const buffer = hoja instanceof Uint8Array ? hoja.buffer : hoja;
		const XLSX = await loadXLSX();
		if (XLSX) {
			try {
				const wb = XLSX.read(buffer, { type: "array" });
				if (porHoja) {
					return wb.SheetNames.map((nm: string) => {
						const rawRows = XLSX.utils && typeof XLSX.utils.sheet_to_json === "function"
							? XLSX.utils.sheet_to_json(wb.Sheets[nm], { header: 1, raw: true })
							: sheetToRows(wb.Sheets[nm]);
						const { headers, startIdx } = identificarEncabezados(rawRows);
						const filas = [];
						for (let i = startIdx; i < rawRows.length; i++) {
							const fila = rawRows[i];
							const effectiveHeaders =
								headers && headers.length > 0
									? headers
									: Array.isArray(fila)
									? fila.map((_: any, idx: number) => `col${idx + 1}`)
									: Object.keys(fila || {});
							filas.push(parsearFila(fila, effectiveHeaders));
						}
						return { nombre: nm, filas };
					});
				}
				for (const nm of wb.SheetNames) {
					const sheet = wb.Sheets[nm];
					const rows = XLSX.utils && typeof XLSX.utils.sheet_to_json === "function"
						? (XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true }) as any[])
						: sheetToRows(sheet);
					filasRaw = filasRaw.concat(rows);
				}
			} catch (e) {
				console.warn("parsearHojaCompleta: error parseando ArrayBuffer con XLSX:", e);
				try {
					const decoder = new TextDecoder("utf-8");
					const text = decoder.decode(buffer);
					console.warn("parsearHojaCompleta: ArrayBuffer binario sin XLSX disponible.");
					return [];
				} catch {
					return [];
				}
			}
		} else {
			try {
				const decoder = new TextDecoder("utf-8");
				const text = decoder.decode(buffer);
				console.warn("parsearHojaCompleta: ArrayBuffer binario sin XLSX disponible.");
				return [];
			} catch (e) {
				console.warn("parsearHojaCompleta: error decodificando ArrayBuffer:", e);
				return [];
			}
		}
	}
	// 4) Si es un array directo o { data: [...] }
	else {
		filasRaw = Array.isArray(hoja) ? hoja : hoja?.data ?? [];
	}

	// Normaliza las filas a objetos usando encabezados
	const resultados: any[] = [];
	const { headers, startIdx } = identificarEncabezados(filasRaw);
	for (let i = startIdx; i < filasRaw.length; i++) {
		const fila = filasRaw[i];
		const effectiveHeaders =
			headers && headers.length > 0
				? headers
				: Array.isArray(fila)
				? fila.map((_: any, idx: number) => `col${idx + 1}`)
				: Object.keys(fila || {});
		resultados.push(parsearFila(fila, effectiveHeaders));
	}

	return resultados;
}

/**
 * Convierte un arreglo de filas normalizadas en la estructura de datos esperada por la app.
 * Extrae encabezados, servicios, cubredescansos y jornadas excepcionales.
 * @param filas - Arreglo de filas normalizadas.
 */
export function estructurarDatosDesdeFilas(filas: any[]): any {
	// Elimina filas duplicadas exactas
	filas = dedupeFilas(filas);

	const infoGeneral: any = {
		periodo: [],
		ruta: [],
		origen: [],
		modalidad: [],
		destino: [],
		modulo: [],
		notas: {},
		impar: [],
		par: [],
	};

	// detectar listas de fechas largas (para impar/par) y notas
	const dateLists: string[] = [];
	const isDateList = (s: string) => {
		// Requisitos mínimos:
		// - contener comas (separador típico de listas de días)
		// - contener al menos 3 números (evita cadenas que solo mencionan "1" o "2")
		// - no contener horas con ':'
		if (!s || typeof s !== "string") return false;
		if (s.includes(":")) return false;
		if (!/,/.test(s)) return false;
		const nums = s.match(/\d{1,2}/g) ?? [];
		return nums.length >= 3;
	};

	// Intento explícito: buscar renglones que mencionen "PRIMER TURNO" + "IMPAR"
	// o "SEGUNDO TURNO" + "PAR" y extraer la lista de días (aparece "hasta abajo" en el Excel).
	let explicitImpar: string | null = null;
	let explicitPar: string | null = null;

	const extractDateListFromText = (text: string): string | null => {
		if (!text || typeof text !== "string") return null;
		// normalizar espacios y mayúsculas
		const t = text.replace(/\s+/g, " ").trim();
		// patrón robusto para secuencias de días/fechas con comas y posibles 'Y' y '/':
		const m = t.match(/(\d{1,2}(?:\/\d{1,2})?)(?:\s*(?:,|Y)\s*(\d{1,2}(?:\/\d{1,2})?))+/i);
		if (m) {
			// devolver la secuencia completa (buscar la subcadena que contiene comas)
			const found = (t.match(/(?:\d{1,2}(?:\/\d{1,2})?(?:\s*(?:,|Y)\s*))+[\d{1,2}(?:\/\d{1,2})?]*/i) || [null])[0];
			return found ? found.replace(/\s*,\s*/g, ", ").trim() : m[0].trim();
		}
		return null;
	};

	// recorrer con índice para poder mirar filas siguientes (la etiqueta puede estar en una fila y la lista en la siguiente)
	for (let i = 0; i < filas.length; i++) {
		const row = filas[i];
		const rowText = Object.values(row || {})
			.filter((v) => v !== null && v !== undefined)
			.join(" ")
			.toString()
			.replace(/\s+/g, " ")
			.trim();
		if (!rowText) continue;
		const up = rowText.toUpperCase();

		// buscar IMPAR
		if (!explicitImpar && /\bIMPAR\b/.test(up)) {
			// 1) intentar extraer de la misma fila
			let found = extractDateListFromText(rowText);
			// 2) si no, revisar hasta 3 filas siguientes (concatenando por si la lista ocupa más de una celda)
			if (!found) {
				for (let j = i + 1; j <= Math.min(i + 3, filas.length - 1); j++) {
					const nxt = Object.values(filas[j] || {})
						.filter((v) => v !== null && v !== undefined)
						.join(" ")
						.toString()
						.replace(/\s+/g, " ")
						.trim();
					if (!nxt) continue;
					const f = extractDateListFromText(nxt);
					if (f) {
						found = f;
						break;
					}
				}
			}
			if (found) explicitImpar = found;
		}

		// buscar PAR
		if (!explicitPar && /\bPAR\b/.test(up)) {
			let found = extractDateListFromText(rowText);
			if (!found) {
				for (let j = i + 1; j <= Math.min(i + 3, filas.length - 1); j++) {
					const nxt = Object.values(filas[j] || {})
						.filter((v) => v !== null && v !== undefined)
						.join(" ")
						.toString()
						.replace(/\s+/g, " ")
						.trim();
					if (!nxt) continue;
					const f = extractDateListFromText(nxt);
					if (f) {
						found = f;
						break;
					}
				}
			}
			if (found) explicitPar = found;
		}

		if (explicitImpar && explicitPar) break;
	}

	// Extrae encabezados generales de la hoja
	for (const r of filas) {
		if (r?.col2 === "PERIODO:" && r?.col3) infoGeneral.periodo.push(String(r.col3).trim());
		if (r?.col2 === "RUTA:" && r?.col3) infoGeneral.ruta.push(String(r.col3).trim());
		if (r?.col9 === "ORIGEN:" && r?.col10) infoGeneral.origen.push(String(r.col10).trim());
		if (r?.col9 === "MODALIDAD:" && r?.col10) infoGeneral.modalidad.push(String(r.col10).trim());
		if (r?.col16 === "DESTINO:" && r?.col17) infoGeneral.destino.push(String(r.col17).trim());
		if (r?.col16 === "MODULO:" && r?.col17 !== undefined) infoGeneral.modulo.push(r.col17);

		// notas: línea larga que contenga texto identificable
		for (const k of Object.keys(r)) {
			const v = r[k];
			if (typeof v === "string" && v.length > 40 && v.includes("SOLO SE PAGARÁ")) {
				infoGeneral.notas["NOTAS:"] = v;
			}
			// detectar listas de fechas (ej. "08, 10, 12 ..." o "07, 09, 11 ...")
			if (typeof v === "string" && isDateList(v)) {
				// solo añadir si no coincide con lo que ya extrajimos explícitamente
				if (!dateLists.includes(v)) dateLists.push(v);
			}
		}
	}

	// asignar IMPAR/PAR: priorizar detección explícita; si no existe, usar heurística por orden
	if (explicitImpar) infoGeneral.impar = [explicitImpar];
	else if (dateLists.length > 0) infoGeneral.impar = [dateLists[0]];

	if (explicitPar) infoGeneral.par = [explicitPar];
	else if (dateLists.length > 1) infoGeneral.par = [dateLists[1]];

	// Extrae servicios solo del primer bloque de la tabla principal
	const servicios: any[] = [];
	let foundFirstServicio = false;
	for (const r of filas) {
		const no = r?.col2;
		if (no === undefined || no === null) {
			if (foundFirstServicio) break;
			continue;
		}
		const noNum = Number(no);
		if (!Number.isNaN(noNum) && no !== "No") {
			foundFirstServicio = true;
			const servicio: any = {
				no: noNum,
				economico: r?.col3 ?? null,
				sistema: r?.col4 ?? null,
			};

			const descansos: string[] = [];
			for (const ck of Object.keys(dayColsMap)) {
				if (r?.[ck] === "D") descansos.push(dayColsMap[ck]);
			}

			servicio.turno_operadores = {};
			if (r?.col5 !== undefined) servicio.turno_operadores["Turno 1"] = { credencial: r.col5, descansos: descansos.slice() };
			if (r?.col6 !== undefined) servicio.turno_operadores["Turno 2"] = { credencial: r.col6, descansos: descansos.slice() };
			if (r?.col7 !== undefined) servicio.turno_operadores["Turno 3"] = { credencial: r.col7, descansos: descansos.slice() };

			// Lunes a Viernes
			servicio["Lunes a Viernes"] = {
				"1er Turno": {
					["Hora inicio Turno 1"]: fmtCell(r?.col15),
					["Hora inicio en CC"]: fmtCell(r?.col16),
					["Lugar Inicio 1"]: r?.col17 ?? null,
					["Hora termino Turno 1"]: fmtCell(r?.col18),
				},
				"2do Turno": {
					["Lugar Inicio 2"]: r?.col19 ?? null,
					["Hora inicio 2"]: fmtCell(r?.col20),
					["Hora termino Turno 2"]: fmtCell(r?.col21),
				},
				"3er Turno": {
					["Lugar Inicio 3"]: r?.col22 ?? null,
					["Hora Inicio Turno 3"]: fmtCell(r?.col23),
				},
				"Termino": {
					["Hora Termino en CC"]: fmtCell(r?.col24),
					["Lugar de termino CC"]: r?.col25 ?? null,
					["Termino en Modulo"]: fmtCell(r?.col26),
					["Termino del Turno"]: fmtCell(r?.col27),
				},
			};

			// Sábado
			servicio["Sabado"] = {
				"1er Turno": {
					["Hora inicio Turno"]: fmtCell(r?.col28),
					["Hora inicio CC"]: fmtCell(r?.col29),
					["Lugar Inicio"]: r?.col30 ?? null,
					["Hora termino Turno"]: fmtCell(r?.col31),
				},
				"2do Turno": {
					["Lugar Inicio"]: r?.col32 ?? null,
					["Hora inicio"]: fmtCell(r?.col33),
					["Hora termino Turno"]: fmtCell(r?.col34),
				},
				"3er Turno": {
					["Lugar Inicio"]: r?.col35 ?? null,
					["Hora Inicio Turno"]: fmtCell(r?.col36),
				},
				"Termino": {
					["Hora Termino en CC"]: fmtCell(r?.col37),
					["Lugar de termino CC"]: r?.col38 ?? null,
					["Termino en Modulo"]: fmtCell(r?.col39),
					["Termino del Turno"]: fmtCell(r?.col40),
				},
			};

			// Domingo
			servicio["Domingo"] = {
				"1er Turno": {
					["Hora inicio Turno"]: fmtCell(r?.col41),
					["Hora inicio CC"]: fmtCell(r?.col42),
					["Lugar Inicio"]: r?.col43 ?? null,
					["Hora termino Turno"]: fmtCell(r?.col44),
				},
				"2do Turno": {
					["Lugar Inicio"]: r?.col45 ?? null,
					["Hora inicio"]: fmtCell(r?.col46),
					["Hora termino Turno"]: fmtCell(r?.col47),
				},
				"3er Turno": {
					["Lugar Inicio"]: r?.col48 ?? null,
					["Hora Inicio Turno"]: fmtCell(r?.col49),
					["Hora Termino en CC"]: fmtCell(r?.col50),
				},
				"Termino": {
					["Lugar de termino CC"]: r?.col51 ?? null,
					["Termino en Modulo"]: fmtCell(r?.col52),
					["Termino del Turno"]: fmtCell(r?.col53),
				},
			};

			servicios.push(servicio);
		} else {
			if (foundFirstServicio) break;
		}
	}

	// deduplicar servicios por número 'no' (mantener la primera aparición)
	const serviciosMap = new Map<any, any>();
	for (const s of servicios) {
		if (s?.no === undefined || s?.no === null) {
			// incluir si no tiene número (raro)
			serviciosMap.set(Symbol() as any, s);
			continue;
		}
		if (!serviciosMap.has(s.no)) serviciosMap.set(s.no, s);
	}
	const serviciosUnicos = Array.from(serviciosMap.values());

	// Extrae cubredescansos (por credencial A..Z)
	const cubredescansos: Record<string, Record<string, any>> = {};
	for (const r of filas) {
		// aceptar solo filas cuya col2 sea una letra única A..Z (evita encabezados y textos)
		const raw = r?.col2;
		if (typeof raw === "string") {
			const v = raw.trim();
			if (/^[A-Z]$/.test(v)) {
				const key = v;
				const item: Record<string, any> = {
					No: v,
					"Económico": r.col3 ?? null,
					"Sistema": r.col4 ?? null,
					"1er Turno": r.col5 ?? null,
					"2do Turno": r.col6 ?? null,
					"3er Turno": r.col7 ?? null,
					L: r.col8 ?? null,
					M: r.col9 ?? null,
					Mi: r.col10 ?? null,
					J: r.col11 ?? null,
					V: r.col12 ?? null,
					S: r.col13 ?? null,
					D: r.col14 ?? null,
				};
				cubredescansos[key] = item;
			}
		}
	}

	// Extrae jornadas excepcionales (MOD)
	const jornadasExcepcionales: any[] = [];
	for (const r of filas) {
		if (r?.col3 === "MOD" && r?.col2) {
			jornadasExcepcionales.push({
				Credencial: r.col2,
				Lugar: r.col3,
				["Hora de Inicio"]: fmtCell(r.col4),
				["Hora de Termino"]: fmtCell(r.col5),
				L: r?.col6 ?? null,
				M: r?.col7 ?? null,
				Mi: r?.col8 ?? null,
				J: r?.col9 ?? null,
				V: r.col10 ?? null,
				S: r?.col11 ?? null,
				D: r?.col12 ?? null,
			});
		}
	}

	// Deduplica encabezados generales
	infoGeneral.periodo = Array.from(new Set(infoGeneral.periodo));
	infoGeneral.ruta = Array.from(new Set(infoGeneral.ruta));
	infoGeneral.origen = Array.from(new Set(infoGeneral.origen));
	infoGeneral.modalidad = Array.from(new Set(infoGeneral.modalidad));
	infoGeneral.destino = Array.from(new Set(infoGeneral.destino));
	infoGeneral.modulo = Array.from(new Set(infoGeneral.modulo));

	// Devuelve la estructura final
	return {
		encabezado: infoGeneral,
		servicios: serviciosUnicos,
		cubredescansos,
		jornadasExcepcionales,
		warnings: [],
	};
}