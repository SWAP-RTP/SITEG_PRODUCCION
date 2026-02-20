const URL_API = 'query_sql/FuncionMateriales.php';

export const RegistrarMaterial = async (datos) => {
    try {
        const res = await fetch(URL_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        if (!res.ok) throw new Error('Error en servidor (HTTP ' + res.status + ')');
        return await res.json();
    } catch (error) {
        console.error("Error en RegistrarMaterial:", error);
        throw error; 
    }
};

export const ConsultarMateriales = async () => {
    try {
        const res = await fetch(`${URL_API}?consulta=1`);
        if (!res.ok) throw new Error('Error en servidor (HTTP ' + res.status + ')');
        return await res.json();
    } catch (error) {
        console.error("Error en ConsultarMateriales:", error);
        throw error;
    }
};

export const BuscarCredencial = async (credencial) => {
    try {
        const res = await fetch(`${URL_API}?buscar_persona=${encodeURIComponent(credencial)}`);
        if (!res.ok) throw new Error('Error en servidor');
        return await res.json();
    } catch (error) {
        console.error("Error en BuscarCredencial:", error);
        throw error;
    }
};