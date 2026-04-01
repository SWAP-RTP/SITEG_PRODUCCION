document.addEventListener('DOMContentLoaded', () => {
    const dom = {
        codigoInput: document.getElementById('codigo'),
        descripcionInput: document.getElementById('descripcion'),
        cantidadInput: document.getElementById('cantidad'),
        unidadSelect: document.getElementById('unidad'),
        estadoSelect: document.getElementById('estado'),
        categoriaSelect: document.getElementById('id_categoria'),
        btnModal: document.getElementById('modal'),
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
    //una forma de validar que todos los campos si exiten (en vez de usar &&)
    const camposRequeridosCompletos = (datos) => Object.values(datos).every(Boolean);
    // CARGAR CATÁLOGOS
    cargarYLlenarSelects({ unidad: dom.unidadSelect, estado: dom.estadoSelect, categoria: dom.categoriaSelect });
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
    BuscarModal('exampleModalCenter', 'contenedor-materiales-modal', 'materiales', 'buscar-material-modal-entrada',
        columnasModal, onSelectMaterial, 'nav-paginacion-materiales', 'ul-paginacion-materiales'
    );
    //ACOMPLETA CAMPO Y GUARDA DATOS ORIGINALES
    const buscarMaterialDebounced = debounce(() => {
        const codigo = dom.codigoInput.value.trim();
        buscarMaterialConCallback(codigo, dom.descripcionInput, 'estado-material');
    }, 300);
    dom.codigoInput.addEventListener('input', buscarMaterialDebounced);
    //confirmacion de guardado con sweetalert2
    const confirmarGuardado = () => mostrarAlerta({
        title: '¿Deseas guardar el material?',
        showConfirmButton: true,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        denyButtonText: 'No guardar'
    });
    const guardarEntrada = async (datos) =>
        (await fetch('query_sql/guardar_materiales.php?tipo=entrada', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        })).json();
    //VALIDACION Y ENVÍO DEL FORMULARIO
    dom.formulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        const datos = obtenerDatosFormulario();

        if (!camposRequeridosCompletos(datos)) {
            mostrarAlerta({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor, llena todos los campos obligatorios.',
                confirmButtonColor: '#3085d6'
            });
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
                dom.formulario.reset();
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
    //LIMPIAR FORMULARIO
    limpiarFormularioCompleto('form-entrada-material', 'contenedor-tabla-registros', 'tabla-registros', 'btn-limpiar-entrada');

});