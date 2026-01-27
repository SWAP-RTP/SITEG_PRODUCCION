import { useState } from 'react';
import { serviceRutasAutorizadas } from '../services/RutasAutorizadasServices';


// Hook personalizado para manejar la carga de rutas autorizadas
export const useRutasAutorizadas = () => {
    const [data, setData] = useState<any>(null); // Datos de rutas autorizadas
    const [loading, setLoading] = useState<boolean>(false); // Estado de carga
    const [error, setError] = useState<string | null>(null); // Estado de error


    const handlerRutasAutorizadas = async () => { // Función para cargar las rutas autorizadas
        setLoading(true); // Inicia la carga
        setError(null); // Resetea el error

        try {
            const response = await serviceRutasAutorizadas();
            setData(response);
            console.log('Rutas Autorizadas cargadas:', response);
        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Retorna los datos, estado de carga, error y el handler para cargar las rutas autorizadas
    return {
        data,
        loading,
        error,
        handlerRutasAutorizadas
    };
}