
//evento para las funciones generica
document.addEventListener('DOMContentLoaded', () => {
    const credencialesInput = document.getElementById('credencial');
    const trabajadorInput = document.getElementById('trabajador');
    const codigoInput = document.getElementById('codigo');
    const descripcionInput = document.getElementById('descripcion');
    const cantidadInput = document.getElementById('cantidad');
    const unidadSelect = document.getElementById('unidad');
    const estadoSelect = document.getElementById('estado');
    const observacionesInput = document.getElementById('observaciones');
    const formulario = document.getElementById('form-salida-material');


    // Llenar selects reutilizando la función
    llenarSelect(unidadSelect, 'query_sql/obtener_unidades.php', 'id_unidad', 'descripcion_unidad');
    llenarSelect(estadoSelect, 'query_sql/obtener_estados.php', 'id_estado_material', 'descripcion_estado_material');



    // Evento para abrir modal de trabajadores
    document.getElementById('modal-trabajador').addEventListener('click', () => {
        const contenedor = document.getElementById('contenedor-trabajadores-modal');
        contenedor.innerHTML = '<div class="text-center p-3"><div class="spinner-border text-primary" role="status"></div></div>';
        fetch('query_sql/modal_trabajadores.php')
            .then(res => res.json())
            .then(data => {
                mostrarTablaModal(
                    contenedor,
                    data,
                    [
                        { header: 'Credencial', key: 'credencial' },
                        { header: 'Nombre', key: 'nombre' }
                    ],
                    (item) => {
                        credencialesInput.value = item.credencial;
                        trabajadorInput.value = item.nombre;
                        const modal = bootstrap.Modal.getInstance(document.getElementById('modalTrabajador'));
                        if (modal) modal.hide();
                    }
                );
            })
            .catch(() => contenedor.innerHTML = '<p class="text-danger">Error al cargar los trabajadores.</p>');
    });

    // Evento para abrir modal de materiales
    document.getElementById('modal-material').addEventListener('click', () => {
        const contenedor = document.getElementById('contenedor-materiales-modal');
        contenedor.innerHTML = '<div class="text-center p-3"><div class="spinner-border text-primary" role="status"></div></div>';
        fetch('query_sql/modal.php')
            .then(res => res.json())
            .then(data => {
                mostrarTablaModal(
                    contenedor,
                    data,
                    [
                        { header: 'Código', key: 'codigo_material' },
                        { header: 'Descripción', key: 'descripcion_material' }
                    ],
                    (item) => {
                        codigoInput.value = item.codigo_material;
                        descripcionInput.value = item.descripcion_material;
                        const modal = bootstrap.Modal.getInstance(document.getElementById('modalMaterial'));
                        if (modal) modal.hide();
                    }
                );
            })
            .catch(() => contenedor.innerHTML = '<p class="text-danger">Error al cargar los materiales.</p>');
    });

    const autoCompletarTrabajador = debounce(() => {
        const credencial = credencialesInput.value.trim();
        if (!credencial) {
            trabajadorInput.value = '';
            return;
        }
        fetch(`query_sql/buscar_trabajador.php?credencial=${encodeURIComponent(credencial)}`)
            .then(res => res.json())
            .then(data => {
                trabajadorInput.value = data.nombre || '';
            })
            .catch(error => {
                trabajadorInput.value = '';
                console.error('Error:', error);
            });
    }, 300);

    credencialesInput.addEventListener('input', autoCompletarTrabajador);

    const autoCompletarDescripcion = debounce(() => {
        const codigo = codigoInput.value.trim();
        if (!codigo) {
            descripcionInput.value = '';
            return;
        }
        fetch(`query_sql/buscar_material.php?codigo=${encodeURIComponent(codigo)}`)
            .then(res => res.json())
            .then(data => {
                descripcionInput.value = data.descripcion_material || '';
            })
            .catch(error => {
                descripcionInput.value = '';
                console.error('Error:', error);
            });
    }, 300);

    codigoInput.addEventListener('input', autoCompletarDescripcion);

    // Validación y envío del formulario
    formulario.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validación básica
        if (
            !credencialesInput.value.trim() ||
            !trabajadorInput.value.trim() ||
            !codigoInput.value.trim() ||
            !descripcionInput.value.trim() ||
            !unidadSelect.value ||
            !estadoSelect.value ||
            !cantidadInput.value.trim()
        ) {
            mostrarAlertaCampos();
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
            observaciones: observacionesInput.value.trim()
        };
        fetch('query_sql/guardar_salida.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        })
            .then(res => res.json())
            .then(respuesta => {
                if (respuesta.status === 'ok') {
                    mostrarAlertaExito('La salida fue registrada correctamente.');
                    formulario.reset();
                } else {
                    mostrarAlertaError(respuesta.message);
                }
            })
            .catch(error => {
                mostrarAlertaError('Error de red o respuesta no válida');
                console.error('Error:', error);
            });
    });


});

// Evento para abrir modal de trabajadores
document.getElementById('modal-trabajador').addEventListener('click', () => {
    const contenedor = document.getElementById('contenedor-trabajadores-modal');
    contenedor.innerHTML = '<div class="text-center p-3"><div class="spinner-border text-primary" role="status"></div></div>';
    fetch('query_sql/modal_trabajadores.php')
        .then(res => res.json())
        .then(data => {
            mostrarTablaModal(
                contenedor,
                data,
                [
                    { header: 'Credencial', key: 'credencial' },
                    { header: 'Nombre', key: 'nombre' }
                ],
                (item) => {
                    credencialesInput.value = item.credencial;
                    trabajadorInput.value = item.nombre;
                    const modal = bootstrap.Modal.getInstance(document.getElementById('modalTrabajador'));
                    if (modal) modal.hide();
                }
            );
        })
        .catch(() => contenedor.innerHTML = '<p class="text-danger">Error al cargar los trabajadores.</p>');
});

// Evento para abrir modal de materiales
document.getElementById('modal-material').addEventListener('click', () => {
    const contenedor = document.getElementById('contenedor-materiales-modal');
    contenedor.innerHTML = '<div class="text-center p-3"><div class="spinner-border text-primary" role="status"></div></div>';
    fetch('query_sql/modal.php')
        .then(res => res.json())
        .then(data => {
            mostrarTablaModal(
                contenedor,
                data,
                [
                    { header: 'Código', key: 'codigo_material' },
                    { header: 'Descripción', key: 'descripcion_material' }
                ],
                (item) => {
                    codigoInput.value = item.codigo_material;
                    descripcionInput.value = item.descripcion_material;
                    const modal = bootstrap.Modal.getInstance(document.getElementById('modalMaterial'));
                    if (modal) modal.hide();
                }
            );
        })
        .catch(() => contenedor.innerHTML = '<p class="text-danger">Error al cargar los materiales.</p>');
});