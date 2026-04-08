// Archivo puente de compatibilidad.
// Mantiene los nombres globales actuales para no romper vistas existentes.

function debounce(func, delay) {
    return window.MaterialesUtils.debounce(func, delay);
}

function llenarSelect(selectElement, data, campoValue, campoText) {
    return window.MaterialesCatalogos.llenarSelect(selectElement, data, campoValue, campoText);
}

function cargarCatalogosMateriales(url) {
    return window.MaterialesCatalogos.cargarCatalogosMateriales(url);
}

function cargarYLlenarSelects(selectors, url) {
    return window.MaterialesCatalogos.cargarYLlenarSelects(selectors, url);
}

function mostrarAlerta(opciones) {
    return window.MaterialesAlertas.mostrarAlerta(opciones);
}

function mostrarToastMaterialNuevo() {
    return window.MaterialesAlertas.mostrarToastMaterialNuevo();
}

function notificarMaterialNuevo(estadoDivId) {
    return window.MaterialesAlertas.notificarMaterialNuevo(estadoDivId);
}

function limpiarBadgeMaterial(estadoDivId) {
    return window.MaterialesAlertas.limpiarBadgeMaterial(estadoDivId);
}

function mostrarTablaModal(tabla, datos, columnas, onSelect) {
    return window.MaterialesModal.mostrarTablaModal(tabla, datos, columnas, onSelect);
}

function mostrarTablaModalConPaginacion(tabla, respuesta, columnas, onSelect, navPaginacionId, ulPaginacionId, fetchCallback) {
    return window.MaterialesModal.mostrarTablaModalConPaginacion(tabla, respuesta, columnas, onSelect, navPaginacionId, ulPaginacionId, fetchCallback);
}

function BuscarModal(modalId, contenedorId, tipo, inputBusquedaId, columnas, onSelect, navPaginacionId, ulPaginacionId) {
    return window.MaterialesModal.BuscarModal(modalId, contenedorId, tipo, inputBusquedaId, columnas, onSelect, navPaginacionId, ulPaginacionId);
}

function abrirModalConPaginacion(modalId, contenedorId, tipo, inputBusquedaId, columnas, onSelect, navPaginacionId, ulPaginacionId) {
    return window.MaterialesModal.abrirModalConPaginacion(modalId, contenedorId, tipo, inputBusquedaId, columnas, onSelect, navPaginacionId, ulPaginacionId);
}

function autoCompletarMaterialPorCodigo(codigo, descripcionInput, estadoDivId, callback) {
    return window.MaterialesFormularios.autoCompletarMaterialPorCodigo(codigo, descripcionInput, estadoDivId, callback);
}

function buscarMaterialParaInventario(codigo, descripcionInput, existenciaInput, stockMinimoInput, estadoDivId) {
    return window.MaterialesFormularios.buscarMaterialParaInventario(codigo, descripcionInput, existenciaInput, stockMinimoInput, estadoDivId);
}

function inicializarFormularioMateriales(config) {
    return window.MaterialesFormularios.inicializarFormularioMateriales(config);
}

function buscarYAutocompletarTrabajador(credencialInput, trabajadorInput, onResult) {
    return window.MaterialesFormularios.buscarYAutocompletarTrabajador(credencialInput, trabajadorInput, onResult);
}

function buscarYAutocompletarCredencialPorTrabajador(trabajadorInput, credencialInput, onResult) {
    return window.MaterialesFormularios.buscarYAutocompletarCredencialPorTrabajador(trabajadorInput, credencialInput, onResult);
}

function limpiarFormularioCompleto(formularioId, contenedorTablaId, tablaId, btnLimpiarId) {
    return window.MaterialesFormularios.limpiarFormularioCompleto(formularioId, contenedorTablaId, tablaId, btnLimpiarId);
}
