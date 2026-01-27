/**
 * Props para el botón que descarga la plantilla de Excel.
 *
 * @property onDownloadStart - Callback opcional que se ejecuta cuando inicia la descarga.
 * @property onDownloadSuccess - Callback opcional cuando la descarga finaliza correctamente.
 * @property onDownloadError - Callback opcional que recibe el error si la descarga falla.
 * @property disabled - Flag para deshabilitar el botón desde el componente padre.
 */
export interface BotonDescargaPlantillaProps {
    onDownloadStart?: () => void;
    onDownloadSuccess?: () => void;
    onDownloadError?: (error: Error) => void;
    disabled?: boolean;
}