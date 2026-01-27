/**
 * Props para el conjunto de botones del formulario de carga de rol.
 *
 * - `sendData` dispara la lectura/parseo del Excel y posteriores acciones.
 * - `limpiarFormulario` restablece los selects y el archivo cargado.
 * - `canSend` controla si el botón de envío está habilitado.
 */
export interface BotonesFormularioProps {
    sendData: () => void;
    limpiarFormulario: () => void;
    canSend: boolean;
}