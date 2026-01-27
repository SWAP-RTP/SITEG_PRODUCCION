// ---------------------------------------
// Servicio: RutasAutorizadasServices
// Consulta las rutas autorizadas desde la API.
// ---------------------------------------
import { envConfig } from '../../../config/envConfig';
import { dateToString } from '../../../../../SUGO-BACK/src/utilities/funcsDates/funcs';


// Función para obtener las rutas autorizadas
export const serviceRutasAutorizadas = async (): Promise<any> => {
    try {
        const response = await fetch(`${envConfig.api}/api/getAllRutas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Error al cargar las rutas autorizadas');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        throw new Error('Error al cargar las rutas autorizadas');
    }
};