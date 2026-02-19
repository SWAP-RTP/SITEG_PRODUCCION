//*************funciones importadas****************//
export const RegistrarMaterial = async (datos) => {
    try {
        const res = await fetch('query_sql/gestion_materiales.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        if (!res.ok) throw new Error('Error en servidor');
        return await res.json();
    } catch (error) {
        console.error("Error en RegistrarMaterial:", error);
        throw error; // Re-lanzamos el error para que pueda ser manejado por el llamador
    }
};
export const ConsultarMateriales = async () => {
    try {

    const res = await fetch('query_sql/gestion_materiales.php?consulta=1');
    if (!res.ok) throw new Error('Error en servidor');
    return await res.json();
    } catch (error) {
        console.error("Error en ConsultarMateriales:", error);
        throw error; // Re-lanzamos el error para que pueda ser manejado por el llamador
    }
};
export const BuscarPersona = async (credencial) => {
    try {
    const res = await fetch(`query_sql/gestion_materiales.php?buscar_persona=${encodeURIComponent(credencial)}`);
    if (!res.ok) throw new Error('Error en servidor');
    return await res.json();
    } catch (error) {
        console.error("Error en BuscarPersona:", error);
        throw error; // Re-lanzamos el error para que pueda ser manejado por el llamador
    }
};