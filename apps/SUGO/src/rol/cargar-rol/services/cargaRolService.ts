import { envConfig } from '../../../config/envConfig';

/**
 * Servicio para enviar la carga completa de roles al backend.
 *
 * @param data Objeto con la estructura de datos a enviar (roles, servicios, etc.)
 * @returns Respuesta del backend (json)
 * @throws Error si la petición falla
 */
export const cargarRolCompleto = async (data: any) => {
  const response = await fetch(`${envConfig.api}/api/rol/carga-completa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await response.json();
  if (!response.ok) {
    throw result;
  }
  return result;
};
