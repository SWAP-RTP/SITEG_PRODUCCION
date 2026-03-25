document.addEventListener('DOMContentLoaded', () => {

    // REFERENCIAS DE LOS ELEMENTOS DEL DOM
    const codigoInput = document.getElementById('codigo');
    const descripcionInput = document.getElementById('descripcion');
    const cantidadInput = document.getElementById('cantidad');
    const unidadSelect = document.getElementById('unidad');
    const estadoSelect = document.getElementById('estado');
    const categoriaSelect = document.getElementById('id_categoria');
    const formulario = document.getElementById('form-entrada-material');
    const btnLimpiar = document.getElementById('btn-limpiar-entrada');
    const btnModal = document.getElementById('modal');



    // LLENA LOS SELECTS
    llenarSelect(estadoSelect, 'query_sql/obtener_estados.php', 'id_estado_material', 'descripcion_estado_material');
    llenarSelect(unidadSelect, 'query_sql/obtener_unidades.php', 'id_unidad', 'descripcion_unidad');
    llenarSelect(categoriaSelect, 'query_sql/obtener_categorias.php', 'id_categoria_material', 'nombre_categoria_material');

    // VARIABLE PARA GUARDAR EL MATERIAL ORIGINAL
    let materialOriginal = null;

    // FUNCION QUE ACOMPLETA CAMPOS
    async function autoCompletar(valor, url, campoEnvio, callback) {
        if (!valor) return;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [campoEnvio]: valor })
            });
            const data = await response.json();
            callback(data);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // LA FUNCION QUE RELLENA EL SELECT
    async function llenarSelect(selectElement, url, campoValue, campoText) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            selectElement.innerHTML = '';
            const opcionDefault = document.createElement('option');
            opcionDefault.value = '';
            opcionDefault.textContent = 'Seleccione...';
            selectElement.appendChild(opcionDefault);
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item[campoValue];
                option.textContent = item[campoText];
                selectElement.appendChild(option);
            });
        } catch (error) {
            console.error('Error:', error);
        }
    }

    //FUNCION PARA GUARDAR LOS DATOS
    async function guardarDatos(url, datos, callback) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            const data = await response.json();
            callback(data);
        } catch (error) {
            console.error('Error:', error);
            callback({ status: 'error', message: 'Error de red o respuesta no válida' });
        }
    }

    //FUNCION PARA EL MODAL
    async function Modal(url, contenedorId, mostrarTabla) {
        const contenido = document.getElementById(contenedorId);
        contenido.innerHTML = '<div class="text-center p-3"><div class="spinner-border text-primary" role="status"></div></div>';
        try {
            const response = await fetch(url);
            const data = await response.json();
            mostrarTabla(contenido, data);
        } catch (error) {
            console.error('Error:', error);
            contenido.innerHTML = '<p class="text-danger">Error al cargar los datos.</p>';
        }
    }

    // Evento para abrir modal de materiales 

const modalBootstrap = document.getElementById('exampleModalCenter');
if (modalBootstrap) {
    modalBootstrap.addEventListener('shown.bs.modal', () => {
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
                        materialOriginal = null;
                        const modal = bootstrap.Modal.getInstance(modalBootstrap);
                        if (modal) modal.hide();
                    }
                );
            })
            .catch(() => contenedor.innerHTML = '<p class="text-danger">Error al cargar los materiales.</p>');
    });
}

    // USO DEL DEBOUNCE
    function debounce(func, delay) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // EVENTO QUE ACOMPLETA CAMPO Y GUARDA DATOS ORIGINALES
    const UsoDebounced = debounce(() => {
        const codigo = codigoInput.value.trim();
        if (!codigo) {
            materialOriginal = null;
            return;
        }
        fetch(`query_sql/buscar_material.php?codigo=${encodeURIComponent(codigo)}`)
            .then(res => res.json())
            .then(data => {
                descripcionInput.value = data.descripcion_material || '';
                // Guarda todos los datos originales para comparar después
                materialOriginal = data;
            })
            .catch(error => {
                materialOriginal = null;
                console.error('Error:', error);
            });
    }, 300);

    codigoInput.addEventListener('input', UsoDebounced);

    // EVENTO QUE GUARDA LOS DATOS
    formulario.addEventListener('submit', (e) => {
        e.preventDefault(); // evitar recarga

        // Validación de campos
        if (
            !codigoInput.value.trim() ||
            !descripcionInput.value.trim() ||
            !unidadSelect.value ||
            !estadoSelect.value ||
            !cantidadInput.value.trim() ||
            !categoriaSelect.value
        ) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor, llena todos los campos obligatorios.',
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        // Validación para evitar sobrescribir
        if (materialOriginal && codigoInput.value.trim() === materialOriginal.codigo_material) {
            if (
                descripcionInput.value.trim() !== (materialOriginal.descripcion_material || '') ||
                unidadSelect.value !== (materialOriginal.id_unidad || '') ||
                estadoSelect.value !== (materialOriginal.id_estado_material || '') ||
                categoriaSelect.value !== (materialOriginal.id_categoria_material || '')

            ) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Datos diferentes',
                    text: 'Ya existe un material con este código, pero los datos no coinciden exactamente. No se puede sobrescribir.',
                    confirmButtonColor: '#3085d6'
                });
                return;
            }

        }

        // Confirmación antes de guardar
        Swal.fire({
            title: "¿Deseas guardar el material?",
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: "Guardar",
            denyButtonText: `No guardar`
        }).then((result) => {
            if (result.isConfirmed) {
                // armar objeto con datos
                const datos = {
                    codigo: codigoInput.value.trim(),
                    descripcion: descripcionInput.value.trim(),
                    unidad: unidadSelect.value,
                    // ubicacion: ubicacionInput.value.trim(),
                    estado: estadoSelect.value,
                    cantidad: cantidadInput.value.trim(),
                    id_categoria: categoriaSelect.value,
                };

                // enviar a backend
                guardarDatos(
                    'query_sql/guardar_entrada.php',
                    datos,
                    (respuesta) => {
                        if (respuesta.status === 'ok') {
                            Swal.fire("¡Guardado!", "El material fue registrado correctamente.", "success");
                            formulario.reset();
                            materialOriginal = null;
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error al guardar',
                                text: respuesta.message || 'Ocurrió un error inesperado.',
                                confirmButtonColor: '#d33'
                            });
                        }
                    }
                );
            } else if (result.isDenied) {
                Swal.fire("No se guardó el material", "", "info");
            }
        });
    });

    //EVENTO PARA MODAL (redirige al mismo event listener de modal-material)
    if (btnModal) {
        btnModal.addEventListener('click', () => {
            const btnModalMaterial = document.getElementById('modal-material');
            if (btnModalMaterial) btnModalMaterial.click();
        });
    }

    //EVENTO PARA LIMPIAR
    btnLimpiar.addEventListener('click', () => {
        formulario.reset();
        materialOriginal = null;
        const contenedorTabla = document.getElementById('contenedor-tabla-registros');
        const tablaRegistros = document.getElementById('tabla-registros');
        if (contenedorTabla) contenedorTabla.style.display = 'none';
        if (tablaRegistros) tablaRegistros.innerHTML = '';
    });

});