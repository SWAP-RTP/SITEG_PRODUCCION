// Buscar material para inventario (campos adicionales: existencia, stock_minimo)
function buscarMaterialParaInventario(codigo, descripcionInput, existenciaInput, stockMinimoInput, estadoDivId) {
    if (!codigo) {
        descripcionInput.value = '';
        existenciaInput.value = 0;
        if (stockMinimoInput) stockMinimoInput.value = '';
        limpiarBadgeMaterial(estadoDivId);
        return;
    }
    fetch('query_sql/buscar_datos.php?tipo=material&codigo=' + encodeURIComponent(codigo))
        .then(res => res.json())
        .then(data => {
            if (data && data.descripcion_material) {
                descripcionInput.value = data.descripcion_material;
                existenciaInput.value = data.stock_actual || 0;
                if (stockMinimoInput) stockMinimoInput.value = data.stock_minimo || '';
                existenciaInput.classList.remove('is-invalid');
                limpiarBadgeMaterial(estadoDivId);
            } else {
                descripcionInput.value = '';
                existenciaInput.value = 0;
                if (stockMinimoInput) stockMinimoInput.value = '';
                mostrarBadgeMaterialNuevo(estadoDivId);
                mostrarToastMaterialNuevo();
            }
        })
        .catch(error => {
            descripcionInput.value = '';
            existenciaInput.value = 0;
            if (stockMinimoInput) stockMinimoInput.value = '';
            console.error('Error:', error);
        });
}
