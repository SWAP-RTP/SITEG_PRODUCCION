document.addEventListener('DOMContentLoaded', () => {
    const credencialesInput = document.getElementById('credencial');
    const trabajadorInput = document.getElementById('trabajador');
    const codigoInput = document.getElementById('codigo');
    const descripcionInput = document.getElementById('descripcion');
    const cantidadInput = document.getElementById('cantidad');
    const unidadSelect = document.getElementById('unidad');
    const estadoSelect = document.getElementById('estado');
    const formulario = document.getElementById('form-salida-material');
    const mensajeCredencial = document.createElement('div');
    mensajeCredencial.className = 'text-danger small mt-1 fw-semibold';
    credencialesInput.insertAdjacentElement('afterend', mensajeCredencial);
            let credencialValida = false;
          let credencialInvalida = '';
const mostrarAlertaCredencialNoEncontrada = () => {
    const credencial = credencialesInput.value.trim();

    if (credencial && !credencialValida && credencial !== credencialInvalida) {
        credencialInvalida = credencial;
        mensajeCredencial.textContent = `La credencial ${credencial} que ingresó no es válida.`;
    } else {
        mensajeCredencial.textContent = '';
    }
};
    // CARGAR CATÁLOGOS
    cargarYLlenarSelects({
        unidad: unidadSelect,
        estado: estadoSelect
    });

    // ABRIR MODAL DE TRABAJADORES CON PAGINACIÓN Y BÚSQUEDA
    BuscarModal('modalTrabajador', 'contenedor-trabajadores-modal', 'trabajadores', 'buscar-trabajador-modal-salida',
        [
            { header: 'Credencial', key: 'credencial' },
            { header: 'Nombre', key: 'nombre' }
        ],
        (item) => {
            credencialesInput.value = item.credencial;
            trabajadorInput.value = item.nombre;
            credencialValida = true;
                credencialInvalida = '';
            credencialesInput.classList.remove('is-invalid');
            mensajeCredencial.textContent = '';
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalTrabajador'));
            if (modal) modal.hide();
        },
        'nav-paginacion-trabajadores',
        'ul-paginacion-trabajadores'
    );

    // ABRIR MODAL DE MATERIALES CON PAGINACIÓN Y BÚSQUEDA
    BuscarModal('modalMaterial', 'contenedor-materiales-modal', 'materiales', 'buscar-material-modal-salida',
        [
            { header: 'Código', key: 'codigo_material' },
            { header: 'Descripción', key: 'descripcion_material' }
        ],
        (item) => {
            codigoInput.value = item.codigo_material;
            descripcionInput.value = item.descripcion_material;
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalMaterial'));
            if (modal) modal.hide();
        },
        'nav-paginacion-materiales',
        'ul-paginacion-materiales'
    );

    // AUTOCOMPLETAR TRABAJADOR POR CREDENCIAL
    buscarYAutocompletarTrabajador(credencialesInput, trabajadorInput, (esValida) => {
        credencialValida = esValida;
        if (!credencialesInput.value.trim()) {
            credencialesInput.classList.remove('is-invalid');
                credencialInvalida = '';
            mensajeCredencial.textContent = '';
            return;
        }
        if (esValida) {
            credencialesInput.classList.remove('is-invalid');
                credencialInvalida = '';
            mensajeCredencial.textContent = '';
        } else {
            credencialesInput.classList.add('is-invalid');
            mostrarAlertaCredencialNoEncontrada();
        }
    });

    // AUTOCOMPLETAR DESCRIPCIÓN POR CÓDIGO
    const autoCompletarDescripcion = debounce(() => {
        const codigo = codigoInput.value.trim();
        buscarMaterialConCallback(codigo, descripcionInput, 'estado-material');
    }, 300);

    codigoInput.addEventListener('input', autoCompletarDescripcion);

    // VALIDACIÓN Y ENVÍO DEL FORMULARIO
    formulario.addEventListener('submit', (e) => {
        e.preventDefault();

        if (credencialesInput.value.trim() && !credencialValida) {
            credencialesInput.classList.add('is-invalid');
            mostrarAlertaCredencialNoEncontrada();
            return;
        }

        // Validar que los campos no estén vacíos
        if (
            !credencialesInput.value.trim() ||
            !trabajadorInput.value.trim() ||
            !codigoInput.value.trim() ||
            !descripcionInput.value.trim() ||
            !unidadSelect.value ||
            !estadoSelect.value ||
            !cantidadInput.value.trim()
        ) {
            mostrarAlerta({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor, llena todos los campos obligatorios.',
                confirmButtonColor: '#3085d6'
            });
            return;
        }
        const datos = {
            credencial: credencialesInput.value.trim(),
            trabajador: trabajadorInput.value.trim(),
            codigo: codigoInput.value.trim(),
            descripcion: descripcionInput.value.trim(),
            unidad: unidadSelect.value,
            estado: estadoSelect.value,
            cantidad: cantidadInput.value.trim(),
        };
        fetch('query_sql/guardar_materiales.php?tipo=salida', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        })
            .then(res => res.json())
            .then(respuesta => {
                if (respuesta.status === 'ok') {
                    mostrarAlerta({
                        icon: 'success',
                        title: '¡Éxito!',
                        text: 'La salida fue registrada correctamente.'
                    });
                    formulario.reset();
                } else if (respuesta.status === 'warning') {
                    mostrarAlerta({
                        icon: 'warning',
                        title: '¡Atención!',
                        text: respuesta.message,
                        confirmButtonColor: '#f39c12'
                    });
                    formulario.reset();
                } else {
                    mostrarAlerta({
                        icon: 'error',
                        title: 'Error',
                        text: respuesta.message || 'Ocurrió un error inesperado.',
                        confirmButtonColor: '#d33'
                    });
                }
            })
            .catch(error => {
                mostrarAlerta({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error de red o respuesta no válida',
                    confirmButtonColor: '#d33'
                });
                console.error('Error:', error)
            });
    });

    formulario.addEventListener('reset', () => {
        credencialValida = false;
        credencialInvalida = '';
        credencialesInput.classList.remove('is-invalid');
        mensajeCredencial.textContent = '';
    });

    // LIMPIAR FORMULARIO
    limpiarFormularioCompleto('form-salida-material', 'contenedor-tabla-salidas', 'tabla-salidas', 'btn-limpiar-entrada');


});