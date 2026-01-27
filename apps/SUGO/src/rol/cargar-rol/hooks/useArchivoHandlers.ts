/**
 * Hook personalizado para manejar la lógica de selección de archivo Excel y validación de campos requeridos.
 *
 * - Valida que periodo y módulo estén seleccionados antes de abrir el input file.
 * - Expone handlers para seleccionar archivo y guardar el archivo en el estado.
 *
 * @param periodo Estado del periodo seleccionado
 * @param modulo Estado del módulo seleccionado
 * @param setPeriodoError Setter para error visual en periodo
 * @param setModuloError Setter para error visual en módulo
 * @param fileInputRef Ref al input file oculto
 * @param setExcel Setter para guardar el archivo Excel
 */
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
    fileInputRef: React.RefObject<HTMLInputElement>,
    setExcel: (f: File) => void
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
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        // Si hay un archivo seleccionado, lo guarda en el estado.
        const file = e.target.files?.[0];
        if (file) {
            setExcel(file);
        }
    }, [setExcel]);

    // Retorna ambos handlers para ser usados en el formulario principal.
    return { handleSelectArchivo, handleFileSelect };
}
