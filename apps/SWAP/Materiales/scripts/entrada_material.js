document.addEventListener('DOMContentLoaded', () => {
    const adscripcionSelect = document.getElementById('adscripcion');
    // Expresión regular para validar el formato del folio MA seguido de 8 dígitos
    const FOLIO_MA_REGEX = /^MA\d{8}$/;

    const materialForm = FormularioMateriales({
        formId: 'form-entrada-material', codigoInputId: 'folio', descripcionInputId: 'descripcion', cantidadInputId: 'cantidad',
        unidadSelectId: 'unidad', estadoSelectId: 'estado', categoriaSelectId: 'id_categoria', modalMaterialId: 'exampleModalCenter', modalMaterialContenedorId: 'contenedor-materiales-modal',
        modalMaterialInputId: 'buscar-material-modal-entrada', navPaginacionMaterialId: 'nav-paginacion-materiales', ulPaginacionMaterialId: 'ul-paginacion-materiales',
        contenedorTablaId: 'contenedor-tabla-registros',
        tablaId: 'tabla-registros', btnLimpiarId: 'btn-limpiar-entrada',
        columnasMaterial: [
            { header: 'Folio', key: 'folio_material' },
            { header: 'Descripción', key: 'descripcion_material' }
        ],
        // Aquí se define la función alElegirMaterial para que sea accesible desde el modal de selección de materiales
        alElegirMaterial: (item) => {
            const folioInput = document.getElementById('folio');
            const descripcionInput = document.getElementById('descripcion');
            if (folioInput) folioInput.value = item.folio_material;
            if (descripcionInput) {
                descripcionInput.value = item.descripcion_material;
                descripcionInput.readOnly = true; // Bloqueamos el campo de descripción para evitar cambios manuales
            }

            bloquearCatalogos({
                unidad: materialForm.unidadSelect,
                estado: materialForm.estadoSelect,
                categoria: materialForm.categoriaSelect
            }, true);

            autoCompletarMaterialPorCodigo(
                item.folio_material,
                descripcionInput,
                'estado-material',
                null,
                {
                    unidadSelect: materialForm.unidadSelect,
                    estadoSelect: materialForm.estadoSelect,
                    categoriaSelect: materialForm.categoriaSelect,
                    //cantidadInput: materialForm.cantidadInput
                }
            );
            const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModalCenter'));
            if (modal) modal.hide();
        }
    });

    const obtenerDatosFormulario = () => ({
        folio_material: materialForm.codigoInput.value.trim(),
        descripcion: materialForm.descripcionInput.value.trim(),
        unidad: materialForm.unidadSelect.value,
        estado: materialForm.estadoSelect.value,
        cantidad: materialForm.cantidadInput.value.trim(),
        id_categoria: materialForm.categoriaSelect.value,
        adscripcion: adscripcionSelect ? adscripcionSelect.value : ''
    });

    const normalizarFolioMA = (valor = '') => {
        const limpio = String(valor).toUpperCase().replace(/[^A-Z0-9]/g, '');

        // Permite borrar completamente el campo sin que se reponga automáticamente.
        if (limpio === '') return '';

        // Permite estados parciales de escritura/borrado del prefijo.
        if (limpio === 'M' || limpio === 'MA') return limpio;

        let digitos = '';
        if (limpio.startsWith('MA')) {
            digitos = limpio.slice(2).replace(/\D/g, '');
        } else {
            // Si pega solo números, autocompleta prefijo MA.
            digitos = limpio.replace(/\D/g, '');
        }

        return `MA${digitos.slice(0, 8)}`;
    };

    if (materialForm.codigoInput) {
        materialForm.codigoInput.addEventListener('input', () => {
            materialForm.codigoInput.value = normalizarFolioMA(materialForm.codigoInput.value);
            const folio = materialForm.codigoInput.value.trim();
            if (/^MA\d{8}$/.test(folio)) {
                materialForm.descripcionInput.readOnly = true; // Bloqueamos el campo de descripción para evitar cambios manuales
                bloquearCatalogos({
                    unidad: materialForm.unidadSelect,
                    estado: materialForm.estadoSelect,
                    categoria: materialForm.categoriaSelect
                }, true); // para bloquear
                autoCompletarMaterialPorCodigo(
                    folio,
                    materialForm.descripcionInput,
                    'estado-material',
                    null,
                    {
                        unidadSelect: materialForm.unidadSelect,
                        estadoSelect: materialForm.estadoSelect,
                        categoriaSelect: materialForm.categoriaSelect,
                        // cantidadInput: materialForm.cantidadInput, se comenta para permitir editar cantidad aunque el material exista
                    }
                );
            } else {
                // Si el folio no es válido, limpiar y cerrar catálogos
                materialForm.descripcionInput.readOnly = false; //aqui se desbloquea
                bloquearCatalogos({
                    unidad: materialForm.unidadSelect,
                    estado: materialForm.estadoSelect,
                    categoria: materialForm.categoriaSelect
                }, false);
                materialForm.descripcionInput.value = '';
                if (materialForm.unidadSelect) materialForm.unidadSelect.value = '';
                if (materialForm.estadoSelect) materialForm.estadoSelect.value = '';
                if (materialForm.categoriaSelect) materialForm.categoriaSelect.value = '';
                if (window.CatalogosAbiertos) {
                    CatalogosAbiertos({
                        unidadSelect: materialForm.unidadSelect,
                        estadoSelect: materialForm.estadoSelect,
                        categoriaSelect: materialForm.categoriaSelect
                    }, false);
                }
                if (materialForm.cantidadInput) materialForm.cantidadInput.value = '';
            }
        });
    }

    const camposRequeridosCompletos = (datos) => Object.values(datos).every(Boolean);

    const limpiarEstadoVisualMaterial = () => {
        if (typeof limpiarBadgeMaterial === 'function') {
            limpiarBadgeMaterial('estado-material');
        }
    };

    const limpiarFormularioEntrada = () => {
        materialForm.limpiarFormulario();
        limpiarEstadoVisualMaterial();
    };

    const btnLimpiarEntrada = document.getElementById('btn-limpiar-entrada');
    if (btnLimpiarEntrada) {
        btnLimpiarEntrada.addEventListener('click', limpiarEstadoVisualMaterial);
    }

    const confirmarGuardado = () => mostrarAlerta({
        title: '¿Deseas guardar el material?',
        showConfirmButton: true,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Guardar',
        denyButtonText: 'No guardar'
    });

    const guardarEntrada = async (datos) =>
        (await fetch('query_sql/guardar_materiales.php?tipo=entrada', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        })).json();

    // VALIDACIONES Y ENVÍO DE FORMULARIO
    materialForm.formulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        const datos = obtenerDatosFormulario();

        // Permitir folio vacío o válido
        const datosSinFolio = Object.assign({}, datos);
        delete datosSinFolio.folio_material;
        if (!camposRequeridosCompletos(datosSinFolio)) {
            mostrarAlerta({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor, llena todos los campos obligatorios.',
                confirmButtonColor: '#3085d6'
            });
            limpiarFormularioEntrada();
            return;
        }

        if (datos.folio_material && !FOLIO_MA_REGEX.test(datos.folio_material)) {
            mostrarAlerta({
                icon: 'warning',
                title: 'Folio inválido',
                text: 'El folio debe tener el formato MA00000001 (MA + 8 dígitos).',
                confirmButtonColor: '#f39c12'
            });
            materialForm.codigoInput.focus();
            return;
        }

        const result = await confirmarGuardado();

        if (result.isDenied) {
            mostrarAlerta({
                icon: 'info',
                title: 'No se guardó el material'
            });
            return;
        }

        if (!result.isConfirmed) return;

        try {
            const respuesta = await guardarEntrada(datos);
            if (respuesta.status === 'ok') {
                mostrarAlerta({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'El material fue registrado correctamente'
                });
                limpiarFormularioEntrada();
                return;
            }

            mostrarAlerta({
                icon: 'error',
                title: 'Error',
                text: respuesta.message || 'Error desconocido',
                confirmButtonColor: '#d33'
            });
        } catch (error) {
            mostrarAlerta({
                icon: 'error',
                title: 'Error',
                text: 'Error de conexión',
                confirmButtonColor: '#d33'
            });
            console.error('Error:', error);
        }
    });
});