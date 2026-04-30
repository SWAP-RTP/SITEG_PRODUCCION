export const MaterialesService = {

    async buscarPorFolio(folio) {
        const res = await fetch(`query_sql/Autocompletar.php?folio=${encodeURIComponent(folio)}`);
        return await res.json();
    },

    async obtenerMateriales() {
        const res = await fetch('query_sql/modales_datos.php?tipo=material');
        return await res.json();
    },
    async consultarEntradas(){
        const res = await fetch('query_sql/consultas_materiales.php?tipo=entradas');
        return await res.json();
    },
    async consultarSalidas() {
        const res = await fetch('query_sql/consultas_materiales.php?tipo=salidas');
        return await res.json();
    },
    async guardarEntrada(data) {
        const res = await fetch('query_sql/materiales_guardados.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await res.json();
    },
    async guardarSalida(data) {
    const res = await fetch('query_sql/materiales_salida_guardados.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    return await res.json();
    },
    async generarFolio() {
        const res = await fetch('query_sql/generar_folio.php');
        return await res.json();
    },
    async consultarEntradas(pagina = 1, limite = 10) {
    const res = await fetch(`query_sql/consultas_materiales.php?tipo=entradas&pagina=${pagina}&limite=${limite}`);
    return await res.json();
},
    formatearCantidad(valor) {
        const n = Number(valor);
        return Number.isFinite(n) ? n : 0;
    }
};