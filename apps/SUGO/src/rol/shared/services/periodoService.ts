import { envConfig } from '../../../config/envConfig';

/**
 * Servicio para obtener los periodos de rol desde el backend.
 * @returns {Promise<any[]>} Array de periodos formateados para el dropdown
 */
export const fetchPeriodos = async (): Promise<any[]> => {
    try {
        const response = await fetch(`${envConfig.api}/api/periodos`);
        if (!response.ok) {
            throw new Error('Error al obtener los periodos');
        }
        const periodos = await response.json();

        // Formatea fecha a dd/mm/aaaa
        const formatFecha = (fecha: string) => {
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
