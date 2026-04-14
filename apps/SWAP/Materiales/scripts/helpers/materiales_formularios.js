(function (global) {
    function obtenerSelectsCatalogo(selects = {}) {
        const { unidadSelect = null, estadoSelect = null, categoriaSelect = null } = selects;
        return [unidadSelect, estadoSelect, categoriaSelect].filter(Boolean);
    }

    function CatalogosAbiertos(selects = {}, abiertos = false) {
        const lista = obtenerSelectsCatalogo(selects);

        lista.forEach(select => {
            if (!select.classList.contains('catalogo-scroll')) return;

            select.size = abiertos ? 6 : 1;
            select.classList.toggle('catalogo-scroll-cerrado', !abiertos);
            select.classList.toggle('catalogo-scroll-abierto', abiertos);
        });
    }


    function autoCompletarMaterialPorCodigo(codigo, descripcionInput, estadoDivId, callback, selects = {}) {
        const { unidadSelect = null, estadoSelect = null, categoriaSelect = null } = selects;
        // Solo continuar si el código es MA+8 dígitos
        if (!/^MA\d{8}$/.test(codigo)) {
            descripcionInput.value = '';
            delete descripcionInput.dataset.autodescripcion;
            if (unidadSelect) unidadSelect.value = '';
            if (estadoSelect) estadoSelect.value = '';
            if (categoriaSelect) categoriaSelect.value = '';
            CatalogosAbiertos(selects, false);
            global.MaterialesAlertas.limpiarBadgeMaterial(estadoDivId);
            return;
        }

        fetch('query_sql/buscar_datos.php?tipo=material&codigo=' + encodeURIComponent(codigo))
            .then(res => res.json())
            .then(data => {
                // Obtener el input de cantidad si está disponible
                const cantidadInput = selects && selects.cantidadInput ? selects.cantidadInput : (window.materialForm && window.materialForm.cantidadInput ? window.materialForm.cantidadInput : null);
                if (data.descripcion_material) {
                    descripcionInput.value = data.descripcion_material;
                    descripcionInput.dataset.autodescripcion = data.descripcion_material;
                    if (unidadSelect) unidadSelect.value = data.id_unidad || '';
                    if (estadoSelect) estadoSelect.value = data.id_estado_material || '';
                    if (categoriaSelect) categoriaSelect.value = data.id_categoria_material || '';
                    CatalogosAbiertos(selects, false);
                    if (cantidadInput) {
                        cantidadInput.disabled = false;
                        if (typeof data.stock_actual !== 'undefined' && data.stock_actual !== null) {
                            cantidadInput.value = data.stock_actual;
                        }
                    }
                    global.MaterialesAlertas.mostrarBadgeExistencia(estadoDivId, true);
                    if (callback) callback(data);
                } else {
                    const descripcionActual = (descripcionInput.value || '').trim();
                    const descripcionAuto = (descripcionInput.dataset.autodescripcion || '').trim();

                    if (!descripcionActual || descripcionActual === descripcionAuto) {
                        descripcionInput.value = '';
                    }

                    delete descripcionInput.dataset.autodescripcion;
                    if (unidadSelect) unidadSelect.value = '';
                    if (estadoSelect) estadoSelect.value = '';
                    if (categoriaSelect) categoriaSelect.value = '';
                    CatalogosAbiertos(selects, true);
                    if (cantidadInput) cantidadInput.disabled = false;
                    global.MaterialesAlertas.notificarMaterialNuevo(estadoDivId);
                    if (callback) callback(null);
                }
            })
            .catch(error => {
                const cantidadInput = selects && selects.cantidadInput ? selects.cantidadInput : (window.materialForm && window.materialForm.cantidadInput ? window.materialForm.cantidadInput : null);
                if (!(descripcionInput.value || '').trim()) {
                    descripcionInput.value = '';
                }
                if (unidadSelect) unidadSelect.value = '';
                if (estadoSelect) estadoSelect.value = '';
                if (categoriaSelect) categoriaSelect.value = '';
                CatalogosAbiertos(selects, true);
                if (cantidadInput) cantidadInput.disabled = false;
                console.error('Error:', error);
            });
    }


    function buscarMaterialParaInventario(codigo, descripcionInput, existenciaInput, stockMinimoInput, estadoDivId, selects = {}) {
        const { unidadSelect = null, estadoSelect = null, categoriaSelect = null } = selects;

        const bloquearCatalogosInventario = (bloqueados) => {
            [unidadSelect, estadoSelect, categoriaSelect].forEach(select => {
                if (!select) return;
                select.disabled = bloqueados;
                select.size = bloqueados ? 1 : 5;
                select.classList.toggle('catalogo-scroll-cerrado', true);
                select.classList.remove('catalogo-scroll-abierto');
            });

            if (stockMinimoInput) {
                stockMinimoInput.readOnly = true;
            }
        };

        // Solo continuar si el código es MA+8 dígitos
        if (!/^MA\d{8}$/.test(codigo)) {
            descripcionInput.value = '';
            existenciaInput.value = 0;
            if (stockMinimoInput) stockMinimoInput.value = '';
            if (unidadSelect) unidadSelect.value = '';
            if (estadoSelect) estadoSelect.value = '';
            if (categoriaSelect) categoriaSelect.value = '';
            CatalogosAbiertos(selects, false);
            bloquearCatalogosInventario(false);
            global.MaterialesAlertas.limpiarBadgeMaterial(estadoDivId);
            return;
        }

        fetch('query_sql/buscar_datos.php?tipo=material&codigo=' + encodeURIComponent(codigo))
            .then(res => res.json())
            .then(data => {
                if (data && data.descripcion_material) {
                    descripcionInput.value = data.descripcion_material;
                    existenciaInput.value = data.stock_actual || 0;
                    if (stockMinimoInput) stockMinimoInput.value = data.stock_minimo || '';
                    if (unidadSelect) unidadSelect.value = data.id_unidad || '';
                    if (estadoSelect) estadoSelect.value = data.id_estado_material || '';
                    if (categoriaSelect) categoriaSelect.value = data.id_categoria_material || '';
                    CatalogosAbiertos(selects, false);
                    bloquearCatalogosInventario(true);
                    existenciaInput.classList.remove('is-invalid');
                    global.MaterialesAlertas.mostrarBadgeExistencia(estadoDivId, true);
                } else {
                    descripcionInput.value = '';
                    existenciaInput.value = 0;
                    if (stockMinimoInput) stockMinimoInput.value = '';
                    if (unidadSelect) unidadSelect.value = '';
                    if (estadoSelect) estadoSelect.value = '';
                    if (categoriaSelect) categoriaSelect.value = '';
                    CatalogosAbiertos(selects, true);
                    // Habilitar selects cuando el material no existe
                    [unidadSelect, estadoSelect, categoriaSelect].forEach(select => {
                        if (!select) return;
                        select.disabled = false;
                    });
                    if (stockMinimoInput) stockMinimoInput.readOnly = false;
                    global.MaterialesAlertas.notificarMaterialNuevo(estadoDivId);
                }
            })
            .catch(error => {
                descripcionInput.value = '';
                existenciaInput.value = 0;
                if (stockMinimoInput) stockMinimoInput.value = '';
                if (unidadSelect) unidadSelect.value = '';
                if (estadoSelect) estadoSelect.value = '';
                if (categoriaSelect) categoriaSelect.value = '';
                CatalogosAbiertos(selects, true);
                bloquearCatalogosInventario(false);
                console.error('Error:', error);
            });
    }

    function FormularioMateriales(config) {
        const {
            formId,
            codigoInputId,
            descripcionInputId,
            cantidadInputId,
            unidadSelectId,
            estadoSelectId,
            categoriaSelectId = null,
            modalMaterialId,
            modalMaterialContenedorId,
            modalMaterialInputId,
            navPaginacionMaterialId,
            ulPaginacionMaterialId,
            columnasMaterial = [],
            alElegirMaterial = null,
            onSelectMaterial = null,
            contenedorTablaId = null,
            tablaId = null,
            btnLimpiarId = null,
            cargaCatalogosUrl
        } = config;

        const formulario = document.getElementById(formId);
        const codigoInput = document.getElementById(codigoInputId);
        const descripcionInput = document.getElementById(descripcionInputId);
        const cantidadInput = document.getElementById(cantidadInputId);
        const unidadSelect = document.getElementById(unidadSelectId);
        const estadoSelect = document.getElementById(estadoSelectId);
        const categoriaSelect = categoriaSelectId ? document.getElementById(categoriaSelectId) : null;

        if (unidadSelect || estadoSelect || categoriaSelect) {
            global.MaterialesCatalogos.cargarYLlenarSelects({
                unidad: unidadSelect,
                estado: estadoSelect,
                categoria: categoriaSelect
            }, cargaCatalogosUrl);

            CatalogosAbiertos({ unidadSelect, estadoSelect, categoriaSelect }, false);
        }

        const manejadorSeleccionMaterial = alElegirMaterial || onSelectMaterial;

        if (modalMaterialId && modalMaterialContenedorId && modalMaterialInputId && manejadorSeleccionMaterial) {
            // Detectar tipo de formulario por id para decidir el tipo del modal
            let tipoModal = 'materiales';
            if (formId && formId.includes('entrada')) {
                tipoModal = 'entradas';
            } else if (formId && formId.includes('salida')) {
                tipoModal = 'salidas';
            }
            global.MaterialesModal.BuscarModal(
                modalMaterialId,
                modalMaterialContenedorId,
                tipoModal,
                modalMaterialInputId,
                columnasMaterial,
                manejadorSeleccionMaterial,
                navPaginacionMaterialId,
                ulPaginacionMaterialId
            );
        }

        if (codigoInput && descripcionInput) {
            const autoCompletar = global.MaterialesUtils.debounce(() => {
                const codigo = codigoInput.value.trim();
                autoCompletarMaterialPorCodigo(codigo, descripcionInput, 'estado-material', null, {
                    unidadSelect,
                    estadoSelect,
                    categoriaSelect
                });
            }, 300);

            codigoInput.addEventListener('input', autoCompletar);
        }

        const limpiarFormulario = (formId && contenedorTablaId && tablaId && btnLimpiarId)
            ? limpiarFormularioCompleto(formId, contenedorTablaId, tablaId, btnLimpiarId)
            : () => {};

        return {
            formulario,
            codigoInput,
            descripcionInput,
            cantidadInput,
            unidadSelect,
            estadoSelect,
            categoriaSelect,
            limpiarFormulario
        };
    }

    function limpiarFormularioCompleto(formularioId, contenedorTablaId, tablaId, btnLimpiarId) {
        const formulario = document.getElementById(formularioId);
        const btnLimpiar = document.getElementById(btnLimpiarId);

        const cerrarCatalogosDelFormulario = () => {
            if (!formulario) return;

            const catalogos = formulario.querySelectorAll('.catalogo-scroll');
            catalogos.forEach(select => {
                select.disabled = false;
                select.size = 1;
                select.classList.remove('catalogo-scroll-abierto');
                select.classList.add('catalogo-scroll-cerrado');
            });
        };

        const ejecutarLimpieza = () => {
            if (formulario) formulario.reset();
            cerrarCatalogosDelFormulario();
            const contenedor = document.getElementById(contenedorTablaId);
            const tabla = document.getElementById(tablaId);
            if (contenedor) contenedor.style.display = 'none';
            if (tabla) tabla.innerHTML = '';
        };

        if (btnLimpiar) {
            btnLimpiar.addEventListener('click', ejecutarLimpieza);
        }

        return ejecutarLimpieza;
    }

    global.MaterialesFormularios = {
        autoCompletarMaterialPorCodigo,
        buscarMaterialParaInventario,
        FormularioMateriales,
        limpiarFormularioCompleto
    };

    global.autoCompletarMaterialPorCodigo = autoCompletarMaterialPorCodigo;
    global.buscarMaterialParaInventario = buscarMaterialParaInventario;
    global.FormularioMateriales = FormularioMateriales;
    global.limpiarFormularioCompleto = limpiarFormularioCompleto;
})(window);
