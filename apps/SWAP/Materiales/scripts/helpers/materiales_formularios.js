(function (global) {
    function autoCompletarMaterialPorCodigo(codigo, descripcionInput, estadoDivId, callback) {
        if (!codigo) {
            descripcionInput.value = '';
            delete descripcionInput.dataset.autodescripcion;
            global.MaterialesAlertas.limpiarBadgeMaterial(estadoDivId);
            return;
        }

        fetch('query_sql/buscar_datos.php?tipo=material&codigo=' + encodeURIComponent(codigo))
            .then(res => res.json())
            .then(data => {
                if (data.descripcion_material) {
                    descripcionInput.value = data.descripcion_material;
                    descripcionInput.dataset.autodescripcion = data.descripcion_material;
                    global.MaterialesAlertas.limpiarBadgeMaterial(estadoDivId);
                    if (callback) callback(data);
                } else {
                    const descripcionActual = (descripcionInput.value || '').trim();
                    const descripcionAuto = (descripcionInput.dataset.autodescripcion || '').trim();

                    if (!descripcionActual || descripcionActual === descripcionAuto) {
                        descripcionInput.value = '';
                    }

                    delete descripcionInput.dataset.autodescripcion;
                    global.MaterialesAlertas.notificarMaterialNuevo(estadoDivId);
                    if (callback) callback(null);
                }
            })
            .catch(error => {
                if (!(descripcionInput.value || '').trim()) {
                    descripcionInput.value = '';
                }
                console.error('Error:', error);
            });
    }

    function buscarMaterialParaInventario(codigo, descripcionInput, existenciaInput, stockMinimoInput, estadoDivId) {
        if (!codigo) {
            descripcionInput.value = '';
            existenciaInput.value = 0;
            if (stockMinimoInput) stockMinimoInput.value = '';
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
                    existenciaInput.classList.remove('is-invalid');
                    global.MaterialesAlertas.limpiarBadgeMaterial(estadoDivId);
                } else {
                    descripcionInput.value = '';
                    existenciaInput.value = 0;
                    if (stockMinimoInput) stockMinimoInput.value = '';
                    global.MaterialesAlertas.notificarMaterialNuevo(estadoDivId);
                }
            })
            .catch(error => {
                descripcionInput.value = '';
                existenciaInput.value = 0;
                if (stockMinimoInput) stockMinimoInput.value = '';
                console.error('Error:', error);
            });
    }

    function inicializarFormularioMateriales(config) {
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
        }

        const manejadorSeleccionMaterial = alElegirMaterial || onSelectMaterial;

        if (modalMaterialId && modalMaterialContenedorId && modalMaterialInputId && manejadorSeleccionMaterial) {
            global.MaterialesModal.BuscarModal(
                modalMaterialId,
                modalMaterialContenedorId,
                'materiales',
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
                autoCompletarMaterialPorCodigo(codigo, descripcionInput, 'estado-material');
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

    function buscarYAutocompletarTrabajador(credencialInput, trabajadorInput, onResult) {
        const buscar = global.MaterialesUtils.debounce(() => {
            const credencial = credencialInput.value.trim();
            if (!credencial) {
                trabajadorInput.value = '';
                if (onResult) onResult(false, null);
                return;
            }
            fetch(`query_sql/buscar_datos.php?tipo=trabajador&credencial=${encodeURIComponent(credencial)}`)
                .then(res => res.json())
                .then(data => {
                    trabajadorInput.value = data.nombre || '';
                    if (onResult) onResult(Boolean(data.nombre), data);
                })
                .catch(error => {
                    trabajadorInput.value = '';
                    if (onResult) onResult(false, null);
                    console.error('Error:', error);
                });
        }, 300);

        credencialInput.addEventListener('input', buscar);
    }

    function buscarYAutocompletarCredencialPorTrabajador(trabajadorInput, credencialInput, onResult) {
        const buscar = global.MaterialesUtils.debounce(() => {
            const nombre = trabajadorInput.value.trim();
            if (!nombre) {
                credencialInput.value = '';
                if (onResult) onResult(false, null);
                return;
            }

            fetch(`query_sql/buscar_datos.php?tipo=trabajador&nombre=${encodeURIComponent(nombre)}`)
                .then(res => res.json())
                .then(data => {
                    credencialInput.value = data.credencial || '';
                    if (onResult) onResult(Boolean(data.credencial), data);
                })
                .catch(error => {
                    credencialInput.value = '';
                    if (onResult) onResult(false, null);
                    console.error('Error:', error);
                });
        }, 300);

        trabajadorInput.addEventListener('input', buscar);
    }

    function limpiarFormularioCompleto(formularioId, contenedorTablaId, tablaId, btnLimpiarId) {
        const formulario = document.getElementById(formularioId);
        const btnLimpiar = document.getElementById(btnLimpiarId);

        const ejecutarLimpieza = () => {
            if (formulario) formulario.reset();
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
        inicializarFormularioMateriales,
        buscarYAutocompletarTrabajador,
        buscarYAutocompletarCredencialPorTrabajador,
        limpiarFormularioCompleto
    };
})(window);
