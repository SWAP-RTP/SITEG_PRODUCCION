// ----------------------------------------------------
// Servicio: RolesCargadosPorPeriodo
// Consulta los roles cargados por periodo desde la API.
// ----------------------------------------------------

import { envConfig } from '../../../config/envConfig';
import { IRolCargado } from '../interfaces/RolesCargados.interface';

// Función principal para consultar roles por periodo
export async function RolesCargadosPorPeriodo(periodo: number): Promise<IRolCargado[]> {
  try {
    // Realiza petición POST a la API
    const response = await fetch(`${envConfig.api}/api/rol/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ periodoId: periodo })
    });
    if (!response.ok) {
      throw new Error('Error al cargar roles');
    }
    // Parsea la respuesta
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw new Error('Error al cargar roles');
  }
}
