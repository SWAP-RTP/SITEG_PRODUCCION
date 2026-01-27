const API = import.meta.env.VITE_SUGO_BackTS;

// Este archivo solo realiza la petición y retorna los datos.
export async function ViewPV(modulo: number): Promise<any> {
    const response = await fetch(`${API}/api/caseta/pv-estados/viewPV`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modulo })
    });
    if (!response.ok) throw new Error('Error en la petición');
    return await response.json();
}
