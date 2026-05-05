export const MaterialesService = {
    async buscarPorFolio(folio) {
        const res = await fetch(`query_sql/Autocompletar.php?folio=${encodeURIComponent(folio)}`);
        return await res.json();
    },
    async obtenerMateriales() {
        const res = await fetch('query_sql/modales_datos.php?tipo=material');
        return await res.json();
    },
    //se incluye el paginado para las consultas
   async consultarEntradas(pagina = 1, limite = 10, busqueda = '') {
    let url = `query_sql/consultas_materiales.php?tipo=entradas&page=${pagina}&limit=${limite}`;
    if (busqueda && busqueda.trim() !== '') {
        url += `&busqueda=${encodeURIComponent(busqueda)}`;
    }
    const res = await fetch(url);
    return await res.json();
},
    async consultarSalidas(pagina = 1, limite = 10, busqueda = '') {
        let url = `query_sql/consultas_materiales.php?tipo=salidas&page=${pagina}&limit=${limite}`;
        if (busqueda && busqueda.trim() !== '') {
            url += `&busqueda=${encodeURIComponent(busqueda)}`;
        }
        const res = await fetch(url);
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
    async cargarMaterialesModal(busqueda = '') {
    let url = 'query_sql/modales_datos.php?tipo=material';

    if (busqueda && busqueda.trim() !== '') {
        url += `&busqueda=${encodeURIComponent(busqueda)}`;
    }

    const res = await fetch(url);
    return await res.json();
},
    formatearCantidad(valor) {
        const n = Number(valor);
        return Number.isFinite(n) ? n : 0;
    }
};