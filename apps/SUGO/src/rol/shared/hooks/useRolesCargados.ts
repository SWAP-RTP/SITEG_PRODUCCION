// ----------------------------------------------------
// Hook: useRolesCargados
// Obtiene los roles cargados desde el backend y gestiona estados de carga y error.
// ----------------------------------------------------

import { useState } from "react";
import { IRolCargado } from "../interfaces/RolesCargados.interface";
import { RolesCargadosPorPeriodo } from "../services/rolesCargadoService";

// Hook principal para consulta de roles
export function useRolesCargados() {
    // Estado para lista de roles
    const [roles, setRoles] = useState<IRolCargado[]>([]);
    // Estado para loading
    const [loading, setLoading] = useState(false);
    // Estado para error
    const [error, setError] = useState<string | null>(null);

    // Consulta los roles por periodo
    const fetchRoles = async (periodo: number) => {
        setLoading(true);
        setError(null);
        try {
            // Llama al servicio que consulta la API
            const data = await RolesCargadosPorPeriodo(periodo);
            console.log('Datos recibidos de fetchRoles:', data);
            setRoles(data);
        } catch (err) {
            setError("Error al consultar roles");
        } finally {
            setLoading(false);
        }
    };

    // Retorna estados y funciones para usar en el componente principal
    return { roles, setRoles, loading, error, fetchRoles };
}
