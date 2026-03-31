document.addEventListener('DOMContentLoaded', () => {
    const dom = {
        codigoInput: document.getElementById('codigo'),
        descripcionInput: document.getElementById('descripcion'),
        cantidadInput: document.getElementById('cantidad'),
        unidadSelect: document.getElementById('unidad'),
        estadoSelect: document.getElementById('estado'),
        categoriaSelect: document.getElementById('id_categoria'),
        btnModal: document.getElementById('modal'),
        modalMaterialBtn: document.getElementById('modal-material'),
        modalCenter: document.getElementById('exampleModalCenter'),
        formulario: document.getElementById('form-entrada-material')
    };

    const obtenerDatosFormulario = () => ({
        codigo: dom.codigoInput.value.trim(),
        descripcion: dom.descripcionInput.value.trim(),
        unidad: dom.unidadSelect.value,
        estado: dom.estadoSelect.value,
        cantidad: dom.cantidadInput.value.trim(),
        id_categoria: dom.categoriaSelect.value
    });
    //una forma de validar que todos los campos si exiten
    const camposRequeridosCompletos = (datos) => Object.values(datos).every(Boolean);

    // CARGAR CATÁLOGOS
    cargarYLlenarSelects({unidad: dom.unidadSelect,estado: dom.estadoSelect,categoria: dom.categoriaSelect});

    // ABRIR MODAL DE MATERIALES CON PAGINACIÓN Y BÚSQUEDA (es una llamada a la funcion auxiliar)
    const columnasModal = [
        { header: 'Código', key: 'codigo_material' },
        { header: 'Descripción', key: 'descripcion_material' }
    ];

    const onSelectMaterial = (item) => {
        dom.codigoInput.value = item.codigo_material;
        dom.descripcionInput.value = item.descripcion_material;
        const modal = bootstrap.Modal.getInstance(dom.modalCenter);
        if (modal) modal.hide();
    };

    abrirModalConPaginacion('exampleModalCenter', 'contenedor-materiales-modal', 'materiales', 'buscar-material-modal-entrada',
        columnasModal, onSelectMaterial, 'nav-paginacion-materiales', 'ul-paginacion-materiales'
    );

    // EVENTO QUE ACOMPLETA CAMPO Y GUARDA DATOS ORIGINALES
    const buscarMaterialDebounced = debounce(() => {
        const codigo = dom.codigoInput.value.trim();
        buscarMaterialConCallback(codigo, dom.descripcionInput, 'estado-material');
    }, 300);

    dom.codigoInput.addEventListener('input', buscarMaterialDebounced);

    //VALIDACION Y ENVÍO DEL FORMULARIO
    dom.formulario.addEventListener('submit', (e) => {
        e.preventDefault();
        const datos = obtenerDatosFormulario();

        // Validación de campos
        if (!camposRequeridosCompletos(datos)) {
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
                fetch('query_sql/guardar_materiales.php?tipo=entrada', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datos)
                })
                    .then(res => res.json())
                    .then(respuesta => {
                        if (respuesta.status === 'ok') {
                            mostrarAlertaExito('El material fue registrado correctamente');
                            dom.formulario.reset();
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

    // EVENTO PARA MODAL 
    if (dom.btnModal && dom.modalMaterialBtn) {
        dom.btnModal.addEventListener('click', () => {
            dom.modalMaterialBtn.click();
        });
    }

    //LIMPIAR FORMULARIO
    limpiarFormularioCompleto('form-entrada-material', 'contenedor-tabla-registros', 'tabla-registros', 'btn-limpiar-entrada');

});