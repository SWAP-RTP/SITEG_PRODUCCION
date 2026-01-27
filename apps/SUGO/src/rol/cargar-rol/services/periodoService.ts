import { envConfig } from '../../../config/envConfig'; // Importa la configuración centralizada


/**
 * Obtiene los periodos cercanos al actual y los reestructura para el frontend directamente desde la API.
 * @returns Array de periodos formateados para el dropdown
 */
/**
 * Servicio para obtener los periodos de rol desde el backend.
 *
 * Llama al endpoint /api/periodos y transforma los datos para el selector de periodos.
 *
 * @returns {Promise<any[]>} Array de periodos formateados para el dropdown
 * @throws Error si la petición falla
 */
export const fetchPeriodos = async (): Promise<any[]> => {
    try {
        const response = await fetch(`${envConfig.api}/api/periodos`);
        if (!response.ok) {
            throw new Error('Error al obtener los periodos');
        }
        const periodos = await response.json();

        // Función para formatear fecha a dd/mm/aaaa (sin problemas de zona horaria)
        const formatFecha = (fecha: string) => {
            // fecha en formato 'YYYY-MM-DD'
            const [year, month, day] = fecha.split('-');
            return `${day}/${month}/${year}`;
        };

        return periodos.map((obj: { [key: string]: any }) => ({
            ...obj,
            self: { ...obj },
            name: `${`Periodo ${obj.periodo}`.padStart(2, '0')} - del ${formatFecha(obj.fecha_inicio)} al ${formatFecha(obj.fecha_fin)}`
        }));
    } catch (error) {
        console.error('Error en fetchPeriodos:', error);
        return [];
    }
};
