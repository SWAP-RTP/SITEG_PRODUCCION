import { envConfig } from '../../config/envConfig'; // Importa la configuración centralizada


/**
 * Obtiene los periodos cercanos al actual y los reestructura para el frontend directamente desde la API.
 * @returns Array de periodos formateados para el dropdown
 */
export const fetchPeriodos = async (): Promise<any[]> => {
    try {
        const response = await fetch(`${envConfig.api}/api/periodos`);
        if (!response.ok) {
            throw new Error('Error al obtener los periodos');
        }
        const periodos = await response.json();
        const ahora = new Date();
        const periodoActualIdx = periodos.findIndex(({ fecha_inicio, fecha_fin }: { fecha_inicio: string, fecha_fin: string }) =>
            new Date(fecha_inicio) < ahora && ahora < new Date(fecha_fin)
        );
        const n = periodoActualIdx === 0 ? 0 : 1;
        const periodosToShow = periodos.slice(periodoActualIdx - n, periodoActualIdx + 2);
        return periodosToShow.map((obj: { [key: string]: any }) => ({
            ...obj,
            self: { ...obj },
            name: `${`${obj.serial}`.padStart(2, '0')} - del ${obj.fecha_inicio} al ${obj.fecha_fin}`
        }));
    } catch (error) {
        console.error('Error en fetchPeriodos:', error);
        return [];
    }
};
