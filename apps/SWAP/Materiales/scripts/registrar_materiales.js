export const RegistrarMaterial = async (datos) => {
    const res = await fetch('query_sql/registro_materiales.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
    if (!res.ok) throw new Error('Error en servidor');
    return await res.json();
};

export const ConsultarMateriales = async () => {
    const res = await fetch('query_sql/registro_materiales.php?consulta=1');
    if (!res.ok) throw new Error('Error en servidor');
    return await res.json();
};