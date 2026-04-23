document.addEventListener('DOMContentLoaded', async function () {
    // Carga inicial de datos
    await cargarCatalogos();
    cargarInventario();
    cargarMaterialesModal('');

    // --- 1. ESCUCHADOR PARA BÚSQUEDA MANUAL ---
    const inputCodigo = document.getElementById('codigo');
    if (inputCodigo) {
        // Se activa al terminar de escribir y cambiar de campo
        inputCodigo.addEventListener('change', function () {
            const folio = this.value.trim();
            if (folio !== "") {
                autocompletarDesdeBaseDeDatos(folio);
            }
        });
    }

    // --- 2. BUSCADOR DENTRO DEL MODAL ---
    const inputBuscarModal = document.getElementById('buscar-material-modal-inventario');
    if (inputBuscarModal) {
        inputBuscarModal.addEventListener('input', function () {
            cargarMaterialesModal(this.value);
        });
    }

    // --- 3. EVENTO LIMPIAR ---
    const btnLimpiar = document.getElementById('btn-limpiar-inventario');
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', limpiarFormularioInventario);
    }

    // --- 4. CONTROL DEL DASHBOARD / SUBMIT ---
    const formInventario = document.getElementById('form-inventario-material');
    const dashboard = document.getElementById('dashboard-inventario');
    const btnConsultar = document.getElementById('btn-guardar-inventario');

    if (formInventario) {
        formInventario.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!dashboard || !btnConsultar) return;

            const estaVisible = window.getComputedStyle(dashboard).display !== 'none';

            if (estaVisible) {
                dashboard.style.display = 'none';
                btnConsultar.innerHTML = '<i class="bi bi-clipboard-data me-2"></i>Consultar estado del inventario';
            } else {
                dashboard.style.display = 'block';
                btnConsultar.innerHTML = '<i class="bi bi-eye-slash me-2"></i>Ocultar inventario';
                cargarInventario();
            }
        });
    }
});

// ================= LÓGICA DE AUTOCOMPLETADO CENTRALIZADA =================
async function autocompletarDesdeBaseDeDatos(folio) {
    try {
        const response = await fetch(`query_sql/Autocompletar.php?folio=${encodeURIComponent(folio)}`);
        const result = await response.json();

        if (result.status === 'ok' && result.datos) {
            const d = result.datos;

            // Llenar campos de texto
            document.getElementById('codigo').value = d.folio_material || folio;
            document.getElementById('descripcion').value = d.descripcion_material || '';
            document.getElementById('stock-actual').value = d.stock_actual || 0;
            document.getElementById('adscripcion').value = d.adscripcion_modulo || '';

            // Llenar selects (Unidad, Estado, Categoría)
            const unidad = document.getElementById('unidad');
            const estado = document.getElementById('estado');
            const categoria = document.getElementById('id_categoria');

            if (unidad) unidad.value = String(d.id_unidad_material || '');
            if (categoria) categoria.value = String(d.id_categoria_material || '');
            if (estado) {
                estado.value = String(d.id_estado_material_entrada || '');
                // Refuerzo para selects dinámicos
                if (!estado.value) {
                    [...estado.options].forEach(opt => {
                        if (opt.value == d.id_estado_material_entrada) opt.selected = true;
                    });
                }
            }

            bloquearCamposInventario(true);
            console.log('Sincronización automática completa para:', folio);
        } else {
            console.warn("El código no existe en la Tabla Maestra.");
        }
    } catch (error) {
        console.error('Error en autocompletado:', error);
    }
}

// ================= SELECCIONAR DESDE MODAL =================
async function seleccionarMaterial(folio, descripcion, stock) {
    // Simplemente llamamos a la función centralizada
    await autocompletarDesdeBaseDeDatos(folio);

    // Cerrar el modal automáticamente
    const modalElement = document.getElementById('exampleModalCenter');
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
    }
}

// ================= INVENTARIO (DASHBOARD) =================
async function cargarInventario() {
    try {
        const response = await fetch('query_sql/dashboard.php');
        const data = await response.json();

        document.getElementById('total-materiales').innerText = data.total_materiales || 0;
        document.getElementById('stock-total').innerText = data.stock_total || 0;
        document.getElementById('stock-bajo').innerText = data.stock_bajo || 0;
        document.getElementById('movimientos-hoy').innerText = data.movimientos_hoy || 0;

        const tbody = document.getElementById('tabla-stock-bajo');
        if (tbody) {
            tbody.innerHTML = '';
            data.materiales_bajo.forEach(material => {
                tbody.innerHTML += `
                    <tr>
                        <td>${material.folio_material}</td>
                        <td>${material.descripcion_material}</td>
                        <td>${material.stock_actual}</td>
                    </tr>`;
            });
        }
    } catch (error) {
        console.error('Error dashboard:', error);
    }
}

// ================= MODAL (TABLA DE BÚSQUEDA) =================
async function cargarMaterialesModal(filtro = '') {
    try {
        const response = await fetch('query_sql/modales_datos.php?tipo=material');
        const data = await response.json();
        if (data.status !== 'ok') return;

        const materialesUnicos = [];
        const vistos = new Set();
        data.datos.forEach(m => {
            if (!vistos.has(m.folio_material)) {
                vistos.add(m.folio_material);
                materialesUnicos.push(m);
            }
        });

        const materiales = materialesUnicos.filter(m =>
            (m.folio_material || '').toLowerCase().includes(filtro.toLowerCase()) ||
            (m.descripcion_material || '').toLowerCase().includes(filtro.toLowerCase())
        );

        let html = `<table class="table table-hover">
                    <thead><tr><th>Folio</th><th>Descripción</th><th>Stock</th><th></th></tr></thead>
                    <tbody>`;

        materiales.forEach(m => {
            let stock = parseInt(m.stock_actual);
            let claseStock = stock <= 0 ? 'text-danger fw-bold' : (stock <= 5 ? 'text-warning fw-bold' : 'text-success fw-bold');

            html += `
                <tr>
                    <td>${m.folio_material}</td>
                    <td>${m.descripcion_material}</td>
                    <td class="${claseStock}">${stock}</td>
                    <td>
                        <button class="btn btn-primary btn-sm" 
                            onclick="seleccionarMaterial('${m.folio_material}', '${m.descripcion_material}', ${stock})">
                            Seleccionar
                        </button>
                    </td>
                </tr>`;
        });
        html += '</tbody></table>';
        const contenedor = document.getElementById('contenedor-materiales-modal');
        if (contenedor) contenedor.innerHTML = html;
    } catch (error) {
        console.error('Error modal:', error);
    }
}

// ================= UTILIDADES =================
function bloquearCamposInventario(bloquear) {
    const ids = ['codigo', 'descripcion', 'unidad', 'estado', 'id_categoria', 'stock-actual', 'adscripcion'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (el.tagName === 'SELECT') el.disabled = bloquear;
            else el.readOnly = bloquear;
        }
    });
}

function limpiarFormularioInventario() {
    const ids = ['codigo', 'descripcion', 'unidad', 'estado', 'id_categoria', 'stock-actual', 'adscripcion'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    bloquearCamposInventario(false);
}

async function cargarCatalogos() {
    try {
        const response = await fetch('query_sql/catalogo_listas.php');
        const data = await response.json();
        if (data.status === 'error') return;

        llenarSelect('id_categoria', data.categorias, 'id_categoria_material', 'descripcion_categoria_material');
        llenarSelect('estado', data.estados, 'id_estado_material', 'descripcion_estado_material');
        llenarSelect('unidad', data.unidades, 'id_unidad_material', 'descripcion_unidad_material');
    } catch (error) {
        console.error('Error catálogos:', error);
    }
}

function llenarSelect(id, datos, valueKey, textKey) {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = '<option value="" selected disabled>Selecciona una opción</option>';
    (datos || []).forEach(item => {
        select.innerHTML += `<option value="${item[valueKey]}">${item[textKey]}</option>`;
    });
}