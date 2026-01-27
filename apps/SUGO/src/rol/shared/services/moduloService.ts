import { envConfig } from '../../../config/envConfig';

/**
 * Servicio para obtener el catálogo de módulos desde el backend.
 * @returns {Promise<Array<{id: number, name: string}>>}
 */
export const fetchModulos = async () => {
  const response = await fetch(`${envConfig.api}/api/modulos`);
  if (!response.ok) {
    throw new Error('Error al obtener los módulos');
  }
  const data = await response.json();
  const modulos = data.map((m: any) => ({
    id: m.mod_clave,
    name: m.descripcion
  }));
  return modulos;
};
