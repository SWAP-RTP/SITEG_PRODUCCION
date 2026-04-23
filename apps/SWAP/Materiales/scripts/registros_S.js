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

    // LISTENER PARA EL BUSCADOR DEL MODAL (CORRECCIÓN)
    document.getElementById('buscar-material-modal-salida')?.addEventListener('input', function () {
        filtrarMaterialesSalida(this.value);
    });

    document.getElementById('btn-consultar-salidas')?.addEventListener('click', function () {
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

    // Cambié el listener para que abra el modal correctamente
    document.getElementById('modal-material')?.addEventListener('click', mostrarModal);

    document.getElementById('adscripcion')?.addEventListener('input', function () {
        this.value = this.value.toUpperCase();
    });

    // ================= VALIDACIÓN SALIDA =================
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

        const stockRestante = stockActualGlobal - cantidad;

        if (stockRestante <= 0) {
            Swal.fire({
                icon: "error",
                title: "Stock insuficiente",
                text: "No puedes dejar el stock en 0 o negativo."
            });
            return;
        }

        if (stockRestante === 1) {
            const confirmacion = await Swal.fire({
                icon: "warning",
                title: "Stock crítico",
                text: "El material quedará con solo 1 unidad",
                showCancelButton: true,
                confirmButtonText: "Continuar",
                cancelButtonText: "Cancelar"
            });

            if (!confirmacion.isConfirmed) return;
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
            data.set('cantidad_material_salida', cantidad);
            data.set('adscripcion_modulo', document.getElementById('adscripcion').value);

            registrarSalida(data);
        });
    });

});

// ================= VARIABLES =================
let datosMaterialesSalida = [];
let stockActualGlobal = 0;

// ================= PAGINACIÓN =================
let paginaActualSalidas = 1;
const limitePorPaginaSalidas = 5;

// ================= CONSULTA =================
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
        console.error(error);
        document.getElementById('tabla-salidas').innerHTML =
            '<tr><td colspan="6" class="text-center">Error al cargar los registros.</td></tr>';
        document.getElementById('contenedor-tabla-salidas').style.display = 'block';
    }
}

function renderPaginacionSalidas(pagina, totalPaginas) {
    const contenedor = document.getElementById('paginacion-salidas');
    if (!contenedor) return;

    if (totalPaginas <= 1) {
        contenedor.innerHTML = '';
        return;
    }

    let html = `<ul class="pagination justify-content-center">`;
    html += `<li class="page-item ${pagina === 1 ? 'disabled' : ''}">
                <button class="page-link" onclick="cambiarPaginaSalidas(${pagina - 1})">Anterior</button>
            </li>`;

    for (let i = 1; i <= totalPaginas; i++) {
        html += `<li class="page-item ${i === pagina ? 'active' : ''}">
                    <button class="page-link" onclick="cambiarPaginaSalidas(${i})">${i}</button>
                </li>`;
    }

    html += `<li class="page-item ${pagina === totalPaginas ? 'disabled' : ''}">
                <button class="page-link" onclick="cambiarPaginaSalidas(${pagina + 1})">Siguiente</button>
            </li></ul>`;

    contenedor.innerHTML = html;
}

window.cambiarPaginaSalidas = function (nuevaPagina) {
    paginaActualSalidas = nuevaPagina;
    mostrarRegistrosSalidas(paginaActualSalidas, limitePorPaginaSalidas);
};

// ================= RESTO =================
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
    select.innerHTML = '<option disabled selected value="">Selecciona</option>';
    datos?.forEach(d => {
        select.innerHTML += `<option value="${d[value]}">${d[text]}</option>`;
    });
}

async function mostrarModal() {
    const modalElement = document.getElementById('modalMaterial');
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.show();

    // Limpiar buscador al abrir
    const inputBusqueda = document.getElementById('buscar-material-modal-salida');
    if(inputBusqueda) inputBusqueda.value = '';

    try {
        const res = await fetch('query_sql/modales_datos.php?tipo=material');
        const data = await res.json();
        datosMaterialesSalida = data.datos || [];
        filtrarMaterialesSalida();
    } catch (error) {
        console.error("Error cargando modal:", error);
    }
}

async function autocompletarFormulario(folio) {
    try {
        const res = await fetch(`query_sql/buscar_datos.php?folio_material=${encodeURIComponent(folio)}`);
        
        // Manejo del 404 (Material no encontrado)
        if (res.status === 404) {
            Swal.fire({
                icon: "error",
                title: "Material no registrado",
                text: `El folio ${folio} no existe en el registro.`,
                confirmButtonColor: "#198754"
            });
            document.getElementById('folio').value = ''; 
            limpiarFormularioMaterial();
            return;
        }

        const data = await res.json();

        if (data && data.folio_material) {
            document.getElementById('folio').value = data.folio_material;
            document.getElementById('descripcion').value = data.descripcion_material || '';
            document.getElementById('unidad').value = data.id_unidad_material || '';
            document.getElementById('id_categoria').value = data.id_categoria_material || '';
            document.getElementById('adscripcion').value = data.adscripcion_modulo || '';
            document.getElementById('estado').value = data.id_estado_material || '';

            stockActualGlobal = Number(data.stock_actual || 0);

            bloquearCamposMaterial(true);
            document.getElementById('estado').disabled = false;

            const modalElement = document.getElementById('modalMaterial');
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }
    } catch (error) {
        console.error("Error al buscar datos:", error);
        Swal.fire("Error", "No se pudo conectar con el servidor", "error");
    }
}

async function registrarSalida(formData) {
    const plainData = Object.fromEntries(formData.entries());
    const response = await fetch('query_sql/materiales_salida_guardados.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plainData)
    });
    const data = await response.json();
    if (data.status === "ok") {
        Swal.fire("Éxito", data.message, "success");
        document.getElementById('form-salida-material').reset();
        limpiarFormularioMaterial();
        stockActualGlobal = 0;
    } else {
        Swal.fire("Error", data.message, "error");
    }
}

function filtrarMaterialesSalida(filtro = '') {
    const contenedor = document.getElementById('contenedor-materiales-modal-salida');
    let filtrados = datosMaterialesSalida;

    if (filtro) {
        const f = filtro.toUpperCase();
        filtrados = datosMaterialesSalida.filter(reg =>
            (reg.folio_material || '').toUpperCase().includes(f) ||
            (reg.descripcion_material || '').toUpperCase().includes(f)
        );
    }

    if (filtrados.length === 0) {
        contenedor.innerHTML = '<p class="text-center text-muted my-3">No se encontraron coincidencias.</p>';
        return;
    }

    let html = `<table class="table table-sm table-hover">
                <thead class="table-light"><tr><th>Folio</th><th>Descripción</th><th>Acción</th></tr></thead>
                <tbody>`;

    filtrados.forEach(reg => {
        html += `
        <tr>
            <td>${reg.folio_material}</td>
            <td>${reg.descripcion_material}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-primary" onclick="autocompletarFormulario('${reg.folio_material}')">
                    Seleccionar
                </button>
            </td>
        </tr>`;
    });

    html += '</tbody></table>';
    contenedor.innerHTML = html;
}

function bloquearCamposMaterial(bloquear) {
    ['descripcion','adscripcion','estado','unidad','id_categoria']
        .forEach(id => {
            const el = document.getElementById(id);
            if(el) el.disabled = bloquear;
        });
}

function limpiarFormularioMaterial() {
    ['descripcion','cantidad','adscripcion','estado','unidad','id_categoria']
        .forEach(id => {
            const el = document.getElementById(id);
            if(el) el.value = '';
        });
    bloquearCamposMaterial(false);
}