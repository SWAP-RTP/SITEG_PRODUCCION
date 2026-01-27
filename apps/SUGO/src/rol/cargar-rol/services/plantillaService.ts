/**
 * Servicio para manejar la descarga de plantillas de Excel
 */

// Usa la URL base desde el archivo .env
const BASE_URL = import.meta.env.VITE_SUGO_BackTS;

/**
 * Descarga la plantilla de Excel para el módulo de roles
 * @returns Promise<void>
 */
export const descargarPlantillaExcel = async (): Promise<void> => {
    try {
        const response = await fetch(`${BASE_URL}/api/rol/plantilla`, {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }
        });

        if (response.ok) {
            const blob = await response.blob();
            if (blob.size === 0) {
                throw new Error('El archivo descargado está vacío');
            }

            const correctBlob = new Blob([blob], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const url = window.URL.createObjectURL(correctBlob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'programacion_del_servicio.xlsx';
            document.body.appendChild(a);
            a.click();

            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }, 100);
        } else {
            const errorText = await response.text();
            throw new Error(`Error al obtener la plantilla del servidor: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        console.error('Error al descargar la plantilla:', error);
        throw error;
    }
};