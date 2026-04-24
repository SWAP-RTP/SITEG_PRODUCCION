export const MaterialesService = {

    async buscarPorFolio(folio) {
        const res = await fetch(`query_sql/Autocompletar.php?folio=${encodeURIComponent(folio)}`);
        return await res.json();
    },

    async obtenerMateriales() {
        const res = await fetch('query_sql/modales_datos.php?tipo=material');
        return await res.json();
    },
    async consultarSalidas() {
        const res = await fetch('query_sql/consultas_materiales.php?tipo=salidas');
        return await res.json();
    },

    formatearCantidad(valor) {
        const n = Number(valor);
        return Number.isFinite(n) ? n : 0;
    }
};