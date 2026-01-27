/**
 * Props para el componente que muestra errores de validación del rol.
 *
 * - `errores`: lista de objetos con la información de cada error.
 * - `showErr`: controla si el panel de errores está visible.
 * - `isLoading`: indicador de carga (evitar acciones durante carga).
 * - `validatingData`: flag que indica que los datos están en proceso de validación.
 * - `cont`: contador auxiliar (usado para forzar re-render o paginación simple).
 */
export interface ErroresRolProps {
    errores: Record<string, any[]>; // Cambia el tipo de errores a un objeto
    showErr: boolean;
    isLoading: boolean;
    validatingData: boolean;
    cont: number;
}