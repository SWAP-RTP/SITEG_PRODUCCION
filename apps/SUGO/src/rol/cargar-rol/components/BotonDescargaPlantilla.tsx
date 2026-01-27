import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { descargarPlantillaExcel } from '../services/plantillaService';
import { BotonDescargaPlantillaProps } from '../interfaces/BotonDescargaPlantillaProps';

/**
 * Componente que renderiza un botón para descargar la plantilla
 */
export const BotonDescargaPlantilla: React.FC<BotonDescargaPlantillaProps> = ({
    onDownloadStart,
    onDownloadSuccess,
    onDownloadError,
    disabled = false
}) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDescargar = async () => {
        try {
            setIsDownloading(true);
            onDownloadStart?.();
            
            await descargarPlantillaExcel();
            
            onDownloadSuccess?.();
        } catch (error) {
            const errorObj = error instanceof Error ? error : new Error('Error desconocido');
            onDownloadError?.(errorObj);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Button
            label={isDownloading ? 'Descargando...' : 'Plantilla ROL'}
            icon={isDownloading ? 'pi pi-spin pi-spinner' : 'pi pi-file-excel'}
            iconPos='left'
            severity='success'
            onClick={handleDescargar}
            disabled={disabled || isDownloading}
            className="btn-form"
            style={{ width: '180px', height: '40px' }}
        />
    );
};