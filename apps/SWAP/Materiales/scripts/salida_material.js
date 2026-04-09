document.addEventListener('DOMContentLoaded', () => {
    const adscripcionSelect = document.getElementById('adscripcion');

    const materialForm = inicializarFormularioMateriales({
        formId: 'form-salida-material',
        codigoInputId: 'codigo',
        descripcionInputId: 'descripcion',
        cantidadInputId: 'cantidad',
        unidadSelectId: 'unidad',
        estadoSelectId: 'estado',
        categoriaSelectId: 'id_categoria',
        modalMaterialId: 'modalMaterial',
        modalMaterialContenedorId: 'contenedor-materiales-modal',
        modalMaterialInputId: 'buscar-material-modal-salida',
        navPaginacionMaterialId: 'nav-paginacion-materiales',
        ulPaginacionMaterialId: 'ul-paginacion-materiales',
        contenedorTablaId: 'contenedor-tabla-salidas',
        tablaId: 'tabla-salidas',
        btnLimpiarId: 'btn-limpiar-entrada',
        columnasMaterial: [
            { header: 'Código', key: 'codigo_material' },
            { header: 'Descripción', key: 'descripcion_material' }
        ],
        alElegirMaterial: (item) => {
            const codigoInput = document.getElementById('codigo');
            const descripcionInput = document.getElementById('descripcion');
            if (codigoInput) codigoInput.value = item.codigo_material;
            if (descripcionInput) descripcionInput.value = item.descripcion_material;
            autoCompletarMaterialPorCodigo(
                item.codigo_material,
                descripcionInput,
                'estado-material',
                null,
                {
                    unidadSelect: materialForm.unidadSelect,
                    estadoSelect: materialForm.estadoSelect,
                    categoriaSelect: materialForm.categoriaSelect
                }
            );
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalMaterial'));
            if (modal) modal.hide();
        }
    });

    if (!materialForm.formulario) return;

    const obtenerDatosFormulario = () => ({
        codigo: materialForm.codigoInput.value.trim(),
        descripcion: materialForm.descripcionInput.value.trim(),
        unidad: materialForm.unidadSelect.value,
        estado: materialForm.estadoSelect.value,
        cantidad: materialForm.cantidadInput.value.trim(),
        id_categoria: materialForm.categoriaSelect.value,
        adscripcion: adscripcionSelect ? adscripcionSelect.value : ''
    });

    const camposRequeridosCompletos = (datos) => Object.values(datos).every(Boolean);

    const limpiarFormularioSalida = materialForm.limpiarFormulario;

    const confirmarGuardado = () => mostrarAlerta({
        title: '¿Deseas guardar la salida del material?',
        showConfirmButton: true,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Guardar',
        denyButtonText: 'No guardar'
    });

    const guardarSalida = async (datos) => {
        const response = await fetch('query_sql/guardar_materiales.php?tipo=salida', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const raw = await response.text();

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${raw.slice(0, 180)}`);
        }

        try {
            return JSON.parse(raw);
        } catch {
            throw new Error(`Respuesta no JSON: ${raw.slice(0, 180)}`);
        }
    };

    // VALIDACIÓN Y ENVÍO DEL FORMULARIO
    materialForm.formulario.addEventListener('submit', async (e) => {
        e.preventDefault();

        const datos = obtenerDatosFormulario();

        if (!camposRequeridosCompletos(datos)) {
            mostrarAlerta({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor, llena todos los campos obligatorios.',
                confirmButtonColor: '#3085d6'
            });
            limpiarFormularioSalida();
            return;
        }

        const result = await confirmarGuardado();

        if (result.isDenied) {
            mostrarAlerta({
                icon: 'info',
                title: 'No se guardó la salida'
            });
            return;
        }

        if (!result.isConfirmed) return;

        try {
            const respuesta = await guardarSalida(datos);
            if (respuesta.status === 'ok') {
                mostrarAlerta({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'La salida fue registrada correctamente.'
                });
                materialForm.formulario.reset();
                return;
            }

            if (respuesta.status === 'warning') {
                mostrarAlerta({
                    icon: 'warning',
                    title: '¡Atención!',
                    text: respuesta.message,
                    confirmButtonColor: '#f39c12'
                });
                materialForm.formulario.reset();
                return;
            }

            mostrarAlerta({
                icon: 'error',
                title: 'Error',
                text: respuesta.message || 'Ocurrió un error inesperado.',
                confirmButtonColor: '#d33'
            });
        } catch (error) {
            mostrarAlerta({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error de red o respuesta no válida',
                confirmButtonColor: '#d33'
            });
            console.error('Error:', error);
        }
    });

});