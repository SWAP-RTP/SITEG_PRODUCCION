import { envConfig } from '../../../config/envConfig';

/**
 * Consulta el catálogo de módulos desde el backend.
 * Devuelve un array de objetos con id y name (descripción).
 * @returns {Promise<Array<{id: number, name: string}>>}
 */
/**
 * Servicio para obtener el catálogo de módulos desde el backend.
 * Utiliza el endpoint /api/modulos y devuelve un array de objetos con id y name (descripción).
 * @returns {Promise<Array<{id: number, name: string}>>}
 */
export const fetchModulos = async () => {
  // Realiza la petición al endpoint de módulos
  const response = await fetch(`${envConfig.api}/api/modulos`);
  if (!response.ok) {
    // Si la respuesta no es exitosa, lanza un error
    throw new Error('Error al obtener los módulos');
  }
  // Parsea la respuesta como JSON
  const data = await response.json();    
  // console.log('Datos de módulos recibidos:', data);
  // Mapea los datos recibidos para adaptarlos al formato requerido por el selector
  const modulos = data.map((m: any) => ({
    id: m.mod_clave, // clave del modulo
    name: m.descripcion // descripción del módulo
  }));
  // Devuelve el array de módulos formateado
  return modulos;
};
