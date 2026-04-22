document.addEventListener('DOMContentLoaded', function () {

    cargarCatalogos();

    const folioInput = document.getElementById('folio');

    function folioValido(folio) {
        return /^MA-\d{8}$/.test(folio);
    }

    if (folioInput) {
        folioInput.addEventListener('blur', function () {
            const folio = this.value.trim();
            if (folioValido(folio)) {
                autocompletarFormulario(folio);
            }
        });

        folioInput.addEventListener('input', function () {
            const folio = this.value.trim();
            if (folioValido(folio)) {
                autocompletarFormulario(folio);
            }
        });
    }

    document.getElementById('btn-consultar-salidas')?.addEventListener('click', function() {
        paginaActualSalidas = 1;
        mostrarRegistrosSalidas(paginaActualSalidas, limitePorPaginaSalidas);
    });

    document.getElementById('btn-limpiar-entrada')?.addEventListener('click', function () {
        document.getElementById('form-salida-material').reset();
        limpiarFormularioMaterial();
        document.getElementById('tabla-salidas').innerHTML = '';
        document.getElementById('contenedor-tabla-salidas').style.display = 'none';
        document.getElementById('paginacion-salidas').innerHTML = '';
    });

    document.getElementById('modal-material')?.addEventListener('click', mostrarModal);

    document.getElementById('adscripcion')?.addEventListener('input', function () {
        this.value = this.value.toUpperCase();
    });

    document.getElementById('form-salida-material')?.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (!this.checkValidity()) {
            Swal.fire("Campos incompletos", "Llena todos los campos", "warning");
            return;
        }

        const cantidad = Number(document.getElementById('cantidad').value);

        if (isNaN(cantidad) || cantidad <= 0) {
            Swal.fire("Cantidad inválida", "Debe ser mayor a 0", "error");
            return;
        }

        Swal.fire({
            title: "¿Guardar salida?",
            showCancelButton: true,
            confirmButtonText: "Guardar"
        }).then((result) => {
            if (!result.isConfirmed) return;

            const data = new FormData();
            data.set('folio_material', document.getElementById('folio').value);
            data.set('descripcion_material_salida', document.getElementById('descripcion').value);
            data.set('id_unidad_material', document.getElementById('unidad').value);
            data.set('id_categoria_material', document.getElementById('id_categoria').value);
            data.set('id_estado_material_salida', document.getElementById('estado').value);
            data.set('cantidad_material_salida', document.getElementById('cantidad').value);
            data.set('adscripcion_modulo', document.getElementById('adscripcion').value);

            registrarSalida(data);
        });
    });

});

// ================= CATALOGOS =================
async function cargarCatalogos() {
    try {
        const res = await fetch('query_sql/catalogo_listas.php');
        const data = await res.json();

        llenarSelect('unidad', data.unidades, 'id_unidad_material', 'descripcion_unidad_material');
        llenarSelect('estado', data.estados, 'id_estado_material', 'descripcion_estado_material');
        llenarSelect('id_categoria', data.categorias, 'id_categoria_material', 'descripcion_categoria_material');

    } catch {
        console.error("Error cargando catálogos");
    }
}

function llenarSelect(id, datos, value, text) {
    const select = document.getElementById(id);
    if (!select) return;

    select.innerHTML = '<option disabled selected>Selecciona</option>';
    datos?.forEach(d => {
        select.innerHTML += `<option value="${d[value]}">${d[text]}</option>`;
    });
}

// ================= MODAL =================
async function mostrarModal() {
    const modal = new bootstrap.Modal(document.getElementById('modalMaterial'));
    modal.show();

    const contenedor = document.getElementById('contenedor-materiales-modal-salida');

    try {
        const res = await fetch('query_sql/modales_datos.php?tipo=material');
        const data = await res.json();

        let html = `<table class="table">
            <thead>
                <tr>
                    <th>Folio</th>
                    <th>Descripción</th>
                    <th></th>
                </tr>
            </thead><tbody>`;

        data.datos.forEach(reg => {
            html += `
                <tr>
                    <td>${reg.folio_material}</td>
                    <td>${reg.descripcion_material}</td>
                    <td>
                        <button class="btn btn-sm btn-primary"
                        onclick="autocompletarFormulario('${reg.folio_material}')">
                        Seleccionar
                        </button>
                    </td>
                </tr>`;
        });

        html += '</tbody></table>';
        contenedor.innerHTML = html;

    } catch {
        contenedor.innerHTML = "Error al cargar";
    }
}

// ================= AUTOCOMPLETE =================
async function autocompletarFormulario(folio) {
    try {
        const res = await fetch(`query_sql/buscar_datos.php?folio_material=${encodeURIComponent(folio)}`);

        const text = await res.text();

        if (!text) {
            throw new Error("Respuesta vacía del servidor");
        }

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            console.error("Respuesta inválida:", text);
            throw new Error("JSON inválido");
        }

        if (!data || data.error) {
            throw new Error(data?.error || "No encontrado");
        }

        document.getElementById('folio').value = data.folio_material || '';
        document.getElementById('descripcion').value = data.descripcion_material || '';
        document.getElementById('unidad').value = data.id_unidad_material || '';
        document.getElementById('id_categoria').value = data.id_categoria_material || '';
        document.getElementById('adscripcion').value = data.adscripcion_modulo || '';

        if (data.id_estado_material) {
            document.getElementById('estado').value = data.id_estado_material;
        } else {
            document.getElementById('estado').value = '';
        }

        bloquearCamposMaterial(true);
        document.getElementById('estado').disabled = false;
        var modal = bootstrap.Modal.getInstance(document.getElementById('modalMaterial'));
        if (modal) modal.hide();

    } catch (error) {
        console.error("ERROR AUTOCOMPLETE:", error);

        limpiarFormularioMaterial();

        Swal.fire({
            icon: "warning",
            title: "No encontrado",
            text: error.message
        });
    }
}

// ================= REGISTRAR =================
async function registrarSalida(formData) {
    // Convierte FormData a objeto plano
    const plainData = Object.fromEntries(formData.entries());
    try {
        const response = await fetch('query_sql/materiales_salida_guardados.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(plainData)
        });

        const text = await response.text();

        if (!text) {
            throw new Error("Respuesta vacía del servidor");
        }

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            console.error("Respuesta inválida:", text);
            throw new Error("El servidor no devolvió JSON válido");
        }

        if (data.status === "ok") {
            Swal.fire("Éxito", data.message, "success");
            document.getElementById('form-salida-material').reset();
            limpiarFormularioMaterial();
        } else {
            Swal.fire("Error", data.message || "Error desconocido", "error");
        }

    } catch (error) {
        console.error(error);
        Swal.fire("Error", "Fallo en la comunicación con el servidor", "error");
    }
}

// ================= PAGINACIÓN Y CONSULTA =================
let paginaActualSalidas = 1;
const limitePorPaginaSalidas = 5; 

async function mostrarRegistrosSalidas(page = 1, limit = limitePorPaginaSalidas) {
    try {
        const response = await fetch(`query_sql/consultas_materiales.php?tipo=salidas&page=${page}&limit=${limit}`);
        const resultado = await response.json();

        const tabla = document.getElementById('tabla-salidas');
        const contenedor = document.getElementById('contenedor-tabla-salidas');

        let html = '';

        if (!resultado.datos || resultado.datos.length === 0) {
            html = `<tr><td colspan="6" class="text-center">No hay registros.</td></tr>`;
            renderPaginacionSalidas(1, 1);
        } else {
            resultado.datos.forEach(r => {
                html += `
                <tr>
                    <td>${r.folio_material}</td>
                    <td>${r.descripcion_material_salida}</td>
                    <td>${r.descripcion_unidad_material}</td>
                    <td>${r.descripcion_estado_material}</td>
                    <td>${r.cantidad_material_salida}</td>
                    <td>${r.fecha_registro_salida}</td>
                </tr>`;
            });
            const totalPaginas = Math.ceil(resultado.total / limit);
            renderPaginacionSalidas(page, totalPaginas);
        }

        tabla.innerHTML = html;
        contenedor.style.display = 'block';

    } catch (error) {
        document.getElementById('tabla-salidas').innerHTML = '<tr><td colspan="6" class="text-center">Error al cargar los registros.</td></tr>';
        document.getElementById('contenedor-tabla-salidas').style.display = 'block';
        renderPaginacionSalidas(1, 1);
    }
}

function renderPaginacionSalidas(pagina, totalPaginas) {
    const contenedor = document.getElementById('paginacion-salidas');
    if (!contenedor) return;

    if (totalPaginas <= 1) {
        contenedor.innerHTML = '';
        return;
    }

    let html = `<nav aria-label="Paginación de salidas">
        <ul class="pagination justify-content-center">`;

    html += `
        <li class="page-item${pagina === 1 ? ' disabled' : ''}">
            <button class="page-link" ${pagina === 1 ? 'tabindex="-1" aria-disabled="true"' : ''} onclick="cambiarPaginaSalidas(${pagina - 1})">Anterior</button>
        </li>`;

    let start = Math.max(1, pagina - 2);
    let end = Math.min(totalPaginas, pagina + 2);
    if (pagina <= 3) end = Math.min(5, totalPaginas);
    if (pagina >= totalPaginas - 2) start = Math.max(1, totalPaginas - 4);

    for (let i = start; i <= end; i++) {
        html += `
            <li class="page-item${i === pagina ? ' active' : ''}">
                <button class="page-link" onclick="cambiarPaginaSalidas(${i})">${i}</button>
            </li>`;
    }

    html += `
        <li class="page-item${pagina === totalPaginas ? ' disabled' : ''}">
            <button class="page-link" ${pagina === totalPaginas ? 'tabindex="-1" aria-disabled="true"' : ''} onclick="cambiarPaginaSalidas(${pagina + 1})">Siguiente</button>
        </li>`;

    html += `</ul></nav>`;
    contenedor.innerHTML = html;
}

window.cambiarPaginaSalidas = function(nuevaPagina) {
    paginaActualSalidas = nuevaPagina;
    mostrarRegistrosSalidas(paginaActualSalidas, limitePorPaginaSalidas);
}

// ================= UTIL =================
function bloquearCamposMaterial(bloquear) {
    ['folio','descripcion','adscripcion','estado','unidad','id_categoria']
        .forEach(id => document.getElementById(id).disabled = bloquear);
}

function limpiarFormularioMaterial() {
    ['descripcion','cantidad','adscripcion','estado','unidad','id_categoria']
        .forEach(id => document.getElementById(id).value = '');

    bloquearCamposMaterial(false);
}