document.addEventListener('DOMContentLoaded', () => {
    const materialForm = inicializarFormularioMateriales({
        formId: 'form-salida-material',
        codigoInputId: 'codigo',
        descripcionInputId: 'descripcion',
        cantidadInputId: 'cantidad',
        unidadSelectId: 'unidad',
        estadoSelectId: 'estado',
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
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalMaterial'));
            if (modal) modal.hide();
        }
    });
    //variables para trabajadores
    const credencialesInput = document.getElementById('credencial');
    const trabajadorInput = document.getElementById('trabajador');
    if (!materialForm.formulario) return;

    const obtenerDatosFormulario = () => ({
        credencial: credencialesInput.value.trim(),
        trabajador: trabajadorInput.value.trim(),
        codigo: materialForm.codigoInput.value.trim(),
        descripcion: materialForm.descripcionInput.value.trim(),
        unidad: materialForm.unidadSelect.value,
        estado: materialForm.estadoSelect.value,
        cantidad: materialForm.cantidadInput.value.trim()
    });

    const camposRequeridosCompletos = (datos) => Object.values(datos).every(Boolean);

    let credencialValida = false;
    let credencialInvalida = '';
    let trabajadorInvalido = '';
    const limpiarCredencialYTrabajador = () => {
        credencialesInput.value = '';
        trabajadorInput.value = '';
        credencialValida = false;
        credencialInvalida = '';
        trabajadorInvalido = '';
        credencialesInput.focus();
    };

    const mostrarAlertaCredencialNoEncontrada = ({ force = false } = {}) => {
        const credencial = credencialesInput.value.trim();
        if (!credencial || credencialValida) return;

        if (!force && credencial === credencialInvalida) return;

        credencialInvalida = credencial;
        mostrarAlerta({
            icon: 'warning',
            title: 'Credencial no válida',
            text: `La credencial ${credencial} no es válida.`,
            confirmButtonColor: '#3085d6'
        });

        limpiarCredencialYTrabajador();
    };

    const mostrarAlertaTrabajadorNoEncontrado = ({ force = false } = {}) => {
        const trabajador = trabajadorInput.value.trim();
        if (!trabajador || credencialValida) return;

        if (!force && trabajador === trabajadorInvalido) return;

        trabajadorInvalido = trabajador;
        mostrarAlerta({
            icon: 'warning',
            title: 'Trabajador no válido',
            text: `El trabajador ${trabajador} no fue encontrado.`,
            confirmButtonColor: '#3085d6'
        });

        limpiarCredencialYTrabajador();
    };
    const limpiarFormularioSalida = materialForm.limpiarFormulario;

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
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalTrabajador'));
            if (modal) modal.hide();
        },
        'nav-paginacion-trabajadores',
        'ul-paginacion-trabajadores'
    );

    // AUTOCOMPLETAR TRABAJADOR POR CREDENCIAL
    buscarYAutocompletarTrabajador(credencialesInput, trabajadorInput, (esValida) => {
        credencialValida = esValida;
        if (!credencialesInput.value.trim()) {
                credencialInvalida = '';
            return;
        }
        if (esValida) {
                credencialInvalida = '';
                trabajadorInvalido = '';
        } else {
            mostrarAlertaCredencialNoEncontrada();
        }
    });

    // AUTOCOMPLETAR CREDENCIAL POR NOMBRE DE TRABAJADOR
    buscarYAutocompletarCredencialPorTrabajador(trabajadorInput, credencialesInput, (esValida) => {
        credencialValida = esValida;
        if (!trabajadorInput.value.trim()) {
            trabajadorInvalido = '';
            return;
        }
        if (esValida) {
            trabajadorInvalido = '';
            credencialInvalida = '';
        } else {
            mostrarAlertaTrabajadorNoEncontrado();
        }
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

        if (datos.credencial && !credencialValida) {
            mostrarAlertaCredencialNoEncontrada({ force: true });
            return;
        }

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

    materialForm.formulario.addEventListener('reset', () => {
        credencialValida = false;
        credencialInvalida = '';
    });

});