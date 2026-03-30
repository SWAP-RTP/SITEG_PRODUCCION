document.addEventListener('DOMContentLoaded', () => {
    const codigoInput = document.getElementById('codigo');
    const descripcionInput = document.getElementById('descripcion');
    const cantidadInput = document.getElementById('cantidad');
    const unidadSelect = document.getElementById('unidad');
    const estadoSelect = document.getElementById('estado');
    const categoriaSelect = document.getElementById('id_categoria');
    const btnModal = document.getElementById('modal');
    const formulario = document.getElementById('form-entrada-material');

    // CARGAR CATÁLOGOS
    cargarYLlenarSelects({
        unidad: unidadSelect,
        estado: estadoSelect,
        categoria: categoriaSelect
    });

    // ABRIR MODAL DE MATERIALES CON PAGINACIÓN Y BÚSQUEDA
    abrirModalConPaginacion('exampleModalCenter', 'contenedor-materiales-modal', 'materiales', 'buscar-material-modal-entrada',
        [
            { header: 'Código', key: 'codigo_material' },
            { header: 'Descripción', key: 'descripcion_material' }
        ],
        (item) => {
            codigoInput.value = item.codigo_material;
            descripcionInput.value = item.descripcion_material;
            const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModalCenter'));
            if (modal) modal.hide();
        },
        'nav-paginacion-materiales',
        'ul-paginacion-materiales'
    );

    // EVENTO QUE ACOMPLETA CAMPO Y GUARDA DATOS ORIGINALES
    const UsoDebounced = debounce(() => {
        const codigo = codigoInput.value.trim();
        buscarMaterialConCallback(codigo, descripcionInput, 'estado-material');
    }, 300);

    codigoInput.addEventListener('input', UsoDebounced);

    //VALIDACION Y ENVÍO DEL FORMULARIO
    formulario.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validación de campos
        if (
            !codigoInput.value.trim() ||
            !descripcionInput.value.trim() ||
            !unidadSelect.value ||
            !estadoSelect.value ||
            !cantidadInput.value.trim() ||
            !categoriaSelect.value
        ) {
            mostrarAlertaCampos();
            return;
        }

        // Confirmación antes de guardar
        Swal.fire({
            title: "¿Deseas guardar el material?",
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: "Guardar",
            denyButtonText: "No guardar"
        }).then((result) => {
            if (result.isConfirmed) {
                const datos = {
                    codigo: codigoInput.value.trim(),
                    descripcion: descripcionInput.value.trim(),
                    unidad: unidadSelect.value,
                    estado: estadoSelect.value,
                    cantidad: cantidadInput.value.trim(),
                    id_categoria: categoriaSelect.value,
                };

                fetch('query_sql/guardar_materiales.php?tipo=entrada', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datos)
                })
                    .then(res => res.json())
                    .then(respuesta => {
                        if (respuesta.status === 'ok') {
                            mostrarAlertaExito('El material fue registrado correctamente');
                            formulario.reset();
                        } else {
                            mostrarAlertaError(respuesta.message || 'Error desconocido');
                        }
                    })
                    .catch(error => {
                        mostrarAlertaError('Error de conexión');
                        console.error('Error:', error);
                    });
            } else if (result.isDenied) {
                Swal.fire("No se guardó el material", "", "info");
            }
        });
    });

    // EVENTO PARA MODAL (redirige al mismo event listener de modal-material)
    if (btnModal) {
        btnModal.addEventListener('click', () => {
            const btnModalMaterial = document.getElementById('modal-material');
            if (btnModalMaterial) btnModalMaterial.click();
        });
    }

    //LIMPIAR FORMULARIO
    limpiarFormularioCompleto('form-entrada-material', 'contenedor-tabla-registros', 'tabla-registros', 'btn-limpiar-entrada');

});