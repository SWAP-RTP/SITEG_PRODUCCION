async function cargarCatalogos() {
    try {
        const response = await fetch('query_sql/catalogo_listas.php');
        if (!response.ok) throw new Error('Error al obtener catálogos');
        const data = await response.json();

        // Unidad de Medida
        const unidadSelect = document.getElementById('unidad');
        unidadSelect.innerHTML = '<option value="" selected disabled>Selecciona una unidad</option>';
        data.unidades.forEach(u => {
            unidadSelect.innerHTML += `<option value="${u.id_unidad_material}">${u.descripcion_unidad_material}</option>`;
        });

        // Estado Físico Material
        const estadoSelect = document.getElementById('estado');
        estadoSelect.innerHTML = '<option value="" selected disabled>Selecciona un estado</option>';
        data.estados.forEach(e => {
            estadoSelect.innerHTML += `<option value="${e.id_estado_material}">${e.descripcion_estado_material}</option>`;
        });

        // Categoría
        const categoriaSelect = document.getElementById('id_categoria');
        categoriaSelect.innerHTML = '<option value="" selected disabled>Selecciona una categoría</option>';
        data.categorias.forEach(c => {
            categoriaSelect.innerHTML += `<option value="${c.id_categoria_material}">${c.descripcion_categoria_material}</option>`;
        });

        // Adscripción (llenado dinámico)
        const adscripcionSelect = document.getElementById('adscripcion');
        adscripcionSelect.innerHTML = '<option value="" selected disabled>Selecciona una adscripción</option>';
        if (data.adscripciones) {
            data.adscripciones.forEach(a => {
                adscripcionSelect.innerHTML += `<option value="${a.valor}">${a.texto}</option>`;
            });
        }
    } catch (error) {
        ['unidad', 'estado', 'id_categoria'].forEach(id => {
            const select = document.getElementById(id);
            if (select) select.innerHTML = '<option value="">Error al cargar</option>';
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    cargarCatalogos();
});

// Autocompletar al escribir folio manualmente en el formulario principal
const folioInput = document.getElementById('folio');
function folioValido(folio) {
    return /^MA-\d{8}$/.test(folio);
}
folioInput.addEventListener('blur', function() {
    const folio = this.value.trim();
    if (folioValido(folio)) {
        autocompletarFormulario(folio);
    }
});
folioInput.addEventListener('input', function() {
    const folio = this.value.trim();
    if (folioValido(folio)) {
        autocompletarFormulario(folio);
    }
});


async function mostrarModal() {
    let datosMateriales = [];

    async function cargarMaterialesModal(filtro = '') {
        try {
            const res = await fetch('query_sql/modales_datos.php?tipo=material');
            const data = await res.json();

            datosMateriales = data.datos || [];

            let filtrados = datosMateriales;

            if (filtro) {
                const f = filtro.trim().toUpperCase();

                filtrados = datosMateriales.filter(reg =>
                    (reg.folio_material && reg.folio_material.toUpperCase().includes(f)) ||
                    (reg.descripcion_material && reg.descripcion_material.toUpperCase().includes(f))
                );
            }

            let html = '';

            if (!filtrados.length) {
                html = '<p class="text-center text-muted">No hay registros.</p>';
            } else {
                html = `
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>Folio</th>
                                <th>Descripción</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                filtrados.forEach(reg => {
                    html += `
                        <tr>
                            <td>${reg.folio_material}</td>
                            <td>${reg.descripcion_material}</td>
                            <td>
                                <button class="btn btn-primary btn-sm"
                                    onclick="autocompletarFormulario('${reg.folio_material}')">
                                    Seleccionar
                                </button>
                            </td>
                        </tr>
                    `;
                });

                html += `</tbody></table>`;
            }

          
            document.getElementById('contenedor-materiales-modal').innerHTML = html;

        } catch (error) {
            console.error(error);
            document.getElementById('contenedor-materiales-modal').innerHTML =
                '<p class="text-danger">Error al cargar los registros.</p>';
        }
    }


    const modal = new bootstrap.Modal(document.getElementById('exampleModalCenter'));
    modal.show();

    await cargarMaterialesModal();

    
    const inputBuscar = document.getElementById('buscar-material-modal-entrada');

    if (inputBuscar) {
        inputBuscar.value = '';

        inputBuscar.oninput = function () {
            cargarMaterialesModal(this.value);
        };
    }
}

function seleccionarRegistro(folio, descripcion) {
    document.getElementById('folio').value = folio;
    document.getElementById('descripcion').value = descripcion;
    var modal = bootstrap.Modal.getInstance(document.getElementById('exampleModalCenter'));
    if (modal) modal.hide();
}

async function registrar(EnviarDAtos) {
    try {
        const plainData = Object.fromEntries(EnviarDAtos.entries());
        console.log('%cDatos enviados al backend:', 'color: #1976d2; font-weight: bold;', plainData);
        const response = await fetch('query_sql/materiales_guardados.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(plainData)
        });

        if (response.ok) {
            const data = await response.json();
            Swal.fire({
                title: "¡Material registrado con éxito!",
                text: "¿Deseas agregar otro material?",
                icon: "success",
                showCancelButton: true,
                confirmButtonText: "Sí, agregar otro",
                cancelButtonText: "No, salir",
                draggable: true
            }).then((result) => {
                if (result.isConfirmed) {
                    limpiarFormularioMaterial();
                    document.getElementById('form-entrada-material').reset();
                    limpiarFormularioMaterial();
                } else {
                    limpiarFormularioMaterial();
                    document.getElementById('form-entrada-material').reset();
                    limpiarFormularioMaterial();
                }
            });
        } else {
            Swal.fire({
                title: "Error",
                text: "No se pudo guardar el material.",
                icon: "error",
                confirmButtonText: "Aceptar"
            });
        }
    } catch (error) {
        Swal.fire({
            title: "Error",
            text: "Ocurrió un error en la petición.",
            icon: "error",
            confirmButtonText: "Aceptar"
        });
    }
}

// ================= PAGINACIÓN =================
let paginaActualEntradas = 1;
const limitePorPaginaEntradas = 5; 

async function mostrarRegistrosEntradas(page = 1, limit = limitePorPaginaEntradas) {
    try {
        const response = await fetch(`query_sql/consultas_materiales.php?tipo=entradas&page=${page}&limit=${limit}`);
        const resultado = await response.json();

        if (!resultado.datos || resultado.datos.length === 0) {
            document.getElementById('tabla-registros').innerHTML = '<tr><td colspan="6" class="text-center">No hay registros.</td></tr>';
            document.getElementById('contenedor-tabla-registros').style.display = 'block';
            renderPaginacionEntradas(1, 1);
            return;
        }

        let filas = '';
        resultado.datos.forEach(reg => {
            let cantidad = Number(reg.cantidad_material_entrada);
            let cantidadFormateada = Number.isInteger(cantidad) ? cantidad : cantidad.toFixed(0);
            filas += `
                <tr>
                    <td>${reg.folio_material || ''}</td>
                    <td>${reg.descripcion_material_entrada || ''}</td>
                    <td>${reg.descripcion_unidad_material || ''}</td>
                    <td>${reg.descripcion_estado_material || ''}</td>
                    <td>${cantidadFormateada}</td>
                    <td>${reg.fecha_registro_entrada || ''}</td>
                </tr>
            `;
        });

        document.getElementById('tabla-registros').innerHTML = filas;
        document.getElementById('contenedor-tabla-registros').style.display = 'block';

        const totalPaginas = Math.ceil(resultado.total / limit);
        renderPaginacionEntradas(page, totalPaginas);

    } catch (error) {
        document.getElementById('tabla-registros').innerHTML = '<tr><td colspan="6" class="text-center">Error al cargar los registros.</td></tr>';
        document.getElementById('contenedor-tabla-registros').style.display = 'block';
        renderPaginacionEntradas(1, 1);
    }
}

function renderPaginacionEntradas(pagina, totalPaginas) {
    const contenedor = document.getElementById('paginacion-entradas');
    if (!contenedor) return;

    if (totalPaginas <= 1) {
        contenedor.innerHTML = '';
        return;
    }

    let html = `<nav aria-label="Paginación de registros">
        <ul class="pagination justify-content-center">`;

    // Botón anterior
    html += `
        <li class="page-item${pagina === 1 ? ' disabled' : ''}">
            <button class="page-link" ${pagina === 1 ? 'tabindex="-1" aria-disabled="true"' : ''} onclick="cambiarPaginaEntradas(${pagina - 1})">Anterior</button>
        </li>`;

    // Números de página (máximo 5 visibles)
    let start = Math.max(1, pagina - 2);
    let end = Math.min(totalPaginas, pagina + 2);
    if (pagina <= 3) end = Math.min(5, totalPaginas);
    if (pagina >= totalPaginas - 2) start = Math.max(1, totalPaginas - 4);

    for (let i = start; i <= end; i++) {
        html += `
            <li class="page-item${i === pagina ? ' active' : ''}">
                <button class="page-link" onclick="cambiarPaginaEntradas(${i})">${i}</button>
            </li>`;
    }

    // Botón siguiente
    html += `
        <li class="page-item${pagina === totalPaginas ? ' disabled' : ''}">
            <button class="page-link" ${pagina === totalPaginas ? 'tabindex="-1" aria-disabled="true"' : ''} onclick="cambiarPaginaEntradas(${pagina + 1})">Siguiente</button>
        </li>`;

    html += `</ul></nav>`;
    contenedor.innerHTML = html;
}

window.cambiarPaginaEntradas = function(nuevaPagina) {
    paginaActualEntradas = nuevaPagina;
    mostrarRegistrosEntradas(paginaActualEntradas, limitePorPaginaEntradas);
}

// ================= FIN PAGINACIÓN =================

async function autocompletarFormulario(folio) {
    try {
        const response = await fetch(`query_sql/Autocompletar.php?folio=${encodeURIComponent(folio)}`);
        const result = await response.json();
        if (result.status === 'ok' && result.datos) {
            const d = result.datos;
            document.getElementById('folio').value = d.folio_material || '';
            document.getElementById('descripcion').value = d.descripcion_material_entrada || '';
            let cantidad = Number(d.cantidad_material_entrada);
            document.getElementById('cantidad').value = (Number.isInteger(cantidad) ? cantidad : cantidad.toFixed(0)) || '';
            const adsInput = document.getElementById('adscripcion');
            if (adsInput && d.adscripcion_modulo) {
                adsInput.value = d.adscripcion_modulo;
            }
            document.getElementById('estado').value = d.id_estado_material_entrada || '';
            document.getElementById('unidad').value = d.id_unidad_material || '';
            document.getElementById('id_categoria').value = d.id_categoria_material || '';
            bloquearCamposMaterial(true);
            var modal = bootstrap.Modal.getInstance(document.getElementById('exampleModalCenter'));
            if (modal) modal.hide();
        } else {
            limpiarFormularioMaterial();
            bloquearCamposMaterial(false);
            mostrarCampoFolio(false);
            Swal.fire({
                icon: 'warning',
                title: 'No encontrado',
                text: 'No se encontró información para el folio ingresado.',
                confirmButtonText: 'Aceptar'
            });
        }
    } catch (error) {
        limpiarFormularioMaterial();
        bloquearCamposMaterial(false);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al autocompletar el formulario.',
            confirmButtonText: 'Aceptar'
        });
    }
}

function bloquearCamposMaterial(bloquear) {
    document.getElementById('folio').readOnly = bloquear;
    document.getElementById('descripcion').readOnly = bloquear;
    document.getElementById('cantidad').readOnly = false;
    document.getElementById('adscripcion').disabled = bloquear;
    document.getElementById('estado').disabled = bloquear;
    document.getElementById('unidad').disabled = bloquear;
    document.getElementById('id_categoria').disabled = bloquear;
}

function mostrarCampoFolio(mostrar) {
    const folioDiv = document.getElementById('folio').closest('.col-md-3');
    let aviso = document.getElementById('aviso-folio-auto');
    if (!aviso) {
        aviso = document.createElement('div');
        aviso.id = 'aviso-folio-auto';
        aviso.className = 'alert alert-info mt-2';
        aviso.innerText = 'El código se generará automáticamente al guardar la información.';
        folioDiv.parentNode.insertBefore(aviso, folioDiv.nextSibling);
    }
    folioDiv.style.display = mostrar ? '' : 'none';
    aviso.style.display = mostrar ? 'none' : '';
}

function limpiarFormularioMaterial() {
    document.getElementById('descripcion').value = '';
    document.getElementById('cantidad').value = '';
    document.getElementById('adscripcion').value = '';
    document.getElementById('estado').value = '';
    document.getElementById('unidad').value = '';
    document.getElementById('id_categoria').value = '';
    document.getElementById('folio').readOnly = false;
    document.getElementById('descripcion').readOnly = false;
    document.getElementById('cantidad').readOnly = false;
    document.getElementById('adscripcion').disabled = false;
    document.getElementById('estado').disabled = false;
    document.getElementById('unidad').disabled = false;
    document.getElementById('id_categoria').disabled = false;
    let aviso = document.getElementById('aviso-folio-auto');
    if (aviso) aviso.style.display = 'none';
}

document.getElementById('btn-consultar-entradas').addEventListener('click', function() {
    paginaActualEntradas = 1;
    mostrarRegistrosEntradas(paginaActualEntradas, limitePorPaginaEntradas);
});

document.getElementById('btn-limpiar-entrada').addEventListener('click', function() {
    document.getElementById('form-entrada-material').reset();
    limpiarFormularioMaterial();
    document.getElementById('tabla-registros').innerHTML = '';
    document.getElementById('contenedor-tabla-registros').style.display = 'none';
    document.getElementById('paginacion-entradas').innerHTML = '';
});

document.getElementById('form-entrada-material').addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!this.checkValidity()) {
        Swal.fire({
            title: "¡Campos incompletos!",
            text: "Por favor, llena todos los campos obligatorios.",
            icon: "warning",
            confirmButtonText: "Aceptar"
        });
        return;
    }

    const form = this;
    const datos = new FormData(form);

    const cantidad = Number(datos.get('cantidad'));
    if (isNaN(cantidad) || cantidad <= 0) {
        Swal.fire({
            icon: "error",
            title: "Cantidad inválida",
            text: "La cantidad debe ser un número mayor a cero."
        });
        return;
    }

    Swal.fire({
        title: "¿Deseas guardar el registro de entrada?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Guardar",
        denyButtonText: "No guardar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (!result.isConfirmed) {
            if (result.isDenied) {
                Swal.fire({
                    title: "Registro cancelado",
                    text: "No se guardó el registro.",
                    icon: "info",
                    confirmButtonText: "Aceptar"
                });
            }
            return;
        }

        const dataLimpia = new FormData();
        dataLimpia.set('folio_material', document.getElementById('folio').value || '');
        dataLimpia.set('descripcion_material_entrada', document.getElementById('descripcion').value);
        dataLimpia.set('id_unidad_material', document.getElementById('unidad').value);
        dataLimpia.set('id_categoria_material', document.getElementById('id_categoria').value);
        dataLimpia.set('id_estado_material_entrada', document.getElementById('estado').value);
        dataLimpia.set('cantidad_material_entrada', document.getElementById('cantidad').value);
        dataLimpia.set('adscripcion_modulo', document.getElementById('adscripcion').value);

        const plainData = Object.fromEntries(dataLimpia.entries());
        console.log('%cDatos enviados al backend:', 'color: green; font-weight: bold;', plainData);

        registrar(dataLimpia);
    });
});

document.getElementById('modal').addEventListener('click', mostrarModal);

document.getElementById('adscripcion').addEventListener('input', function() {
    this.value = this.value.toUpperCase();
});