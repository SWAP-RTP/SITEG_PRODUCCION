document.addEventListener('DOMContentLoaded', () => {
    const adscripcionSelect = document.getElementById('adscripcion');

    const materialForm = inicializarFormularioMateriales({
        formId: 'form-entrada-material',
        codigoInputId: 'codigo',
        descripcionInputId: 'descripcion',
        cantidadInputId: 'cantidad',
        unidadSelectId: 'unidad',
        estadoSelectId: 'estado',
        categoriaSelectId: 'id_categoria',
        modalMaterialId: 'exampleModalCenter',
        modalMaterialContenedorId: 'contenedor-materiales-modal',
        modalMaterialInputId: 'buscar-material-modal-entrada',
        navPaginacionMaterialId: 'nav-paginacion-materiales',
        ulPaginacionMaterialId: 'ul-paginacion-materiales',
        contenedorTablaId: 'contenedor-tabla-registros',
        tablaId: 'tabla-registros',
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
            const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModalCenter'));
            if (modal) modal.hide();
        }
    });

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
            materialForm.limpiarFormulario();
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
                materialForm.formulario.reset();
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