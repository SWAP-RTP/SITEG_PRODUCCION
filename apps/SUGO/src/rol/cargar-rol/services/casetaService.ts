// Servicio para consultar registros de caseta (pv_estados) por rango de fechas, eco y operador

import { envConfig } from '../../../config/envConfig';
import { CasetaRegistroParams } from '../interfaces/casetaRegistroParams.interface'; // Nueva interfaz modularizada

export async function getCasetaRegistros(params: CasetaRegistroParams) {
	const response = await fetch(`${envConfig.api}/api/caseta/registros`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(params)
	});
	if (!response.ok) return [];
	return await response.json();
}
