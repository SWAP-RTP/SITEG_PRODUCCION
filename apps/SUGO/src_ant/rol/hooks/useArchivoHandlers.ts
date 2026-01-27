import { useCallback } from 'react';

/**
 * Hook personalizado para manejar la lógica de selección de archivo y validación de campos requeridos.
 * Recibe los estados y setters de periodo, módulo y la referencia al input file.
 */
export function useArchivoHandlers(
    periodo: any,
    modulo: any,
    setPeriodoError: (v: boolean) => void,
    setModuloError: (v: boolean) => void,
    fileInputRef: React.RefObject<HTMLInputElement>
) {

    const handleSelectArchivo = useCallback(() => {
        let hasError = false;
        // Si no hay periodo seleccionado, activa el error visual en el campo periodo.
        if (!periodo) {
            setPeriodoError(true);
            hasError = true;
        } else {
            setPeriodoError(false);
        }
        // Si no hay módulo seleccionado, activa el error visual en el campo módulo.
        if (!modulo) {
            setModuloError(true);
            hasError = true;
        } else {
            setModuloError(false);
        }
        // Si ambos campos están completos, abre el input file para seleccionar archivo.
        if (!hasError) {
            fileInputRef.current?.click();
        }
    }, [periodo, modulo, setPeriodoError, setModuloError, fileInputRef]);

    /**
     * Handler para el input file oculto.
     * - Guarda el archivo seleccionado en el estado usando setExcel.
     */
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>, setExcel: (f: File) => void) => {
        // Si hay un archivo seleccionado, lo guarda en el estado.
        if (e.target.files && e.target.files[0]) {
            setExcel(e.target.files[0]);
        }
    }, []);

    // Retorna ambos handlers para ser usados en el formulario principal.
    return { handleSelectArchivo, handleFileSelect };
}
