document.addEventListener('DOMContentLoaded', async function () {
    await cargarCatalogos();

    cargarInventario();
    cargarMaterialesModal('');

    const inputBuscar = document.getElementById('buscar-material-modal-inventario');
    if (inputBuscar) {
        inputBuscar.addEventListener('input', function () {
            cargarMaterialesModal(this.value);
        });
    }
});

// ================= INVENTARIO =================
async function cargarInventario() {
    try {
        const response = await fetch('query_sql/dashboard.php');
        const data = await response.json();

        if (!data) throw new Error('No se encontraron datos');

        document.getElementById('total-materiales').innerText = data.total_materiales || 0;
        document.getElementById('stock-total').innerText = data.stock_total || 0;
        document.getElementById('stock-bajo').innerText = data.stock_bajo || 0;
        document.getElementById('movimientos-hoy').innerText = data.movimientos_hoy || 0;

        const tbody = document.getElementById('tabla-stock-bajo');
        if (!tbody) return;

        tbody.innerHTML = '';

        data.materiales_bajo.forEach(material => {
            tbody.innerHTML += `
                <tr>
                    <td>${material.folio_material}</td>
                    <td>${material.descripcion_material}</td>
                    <td>${material.stock_actual}</td>
                </tr>
            `;
        });

    } catch (error) {
        console.error('Error inventario:', error);
        Swal.fire('Error', 'No se pudo cargar el inventario.', 'error');
    }
}


// ================= MODAL =================
async function cargarMaterialesModal(filtro = '') {
    try {
        const response = await fetch('query_sql/modales_datos.php?tipo=material');
        const data = await response.json();

        if (data.status !== 'ok') throw new Error(data.message);

        //  ELIMINAR DUPLICADOS
        const materialesUnicos = [];
        const vistos = new Set();

        data.datos.forEach(m => {
            if (!vistos.has(m.folio_material)) {
                vistos.add(m.folio_material);
                materialesUnicos.push(m);
            }
        });

        // FILTRAR
        const materiales = materialesUnicos.filter(m =>
            (m.folio_material || '').toLowerCase().includes(filtro.toLowerCase()) ||
            (m.descripcion_material || '').toLowerCase().includes(filtro.toLowerCase())
        );

        //  ORDENAR
        materiales.sort((a, b) =>
            a.folio_material.localeCompare(b.folio_material)
        );

        //  RENDER
        let html = `
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Folio</th>
                        <th>Descripción</th>
                        <th>Stock</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
        `;

        materiales.forEach(m => {

            //  COLOR DINÁMICO 
            let claseStock = '';
            if (m.stock_actual <= 0) claseStock = 'text-danger fw-bold';
            else if (m.stock_actual <= 5) claseStock = 'text-warning fw-bold';
            else claseStock = 'text-success fw-bold';

            html += `
                <tr>
                    <td>${m.folio_material}</td>
                    <td>${m.descripcion_material}</td>
                    <td class="${claseStock}">${m.stock_actual}</td>
                    <td>
                        <button class="btn btn-primary btn-sm"
                            onclick="seleccionarMaterial('${m.folio_material}', '${m.descripcion_material}', ${m.stock_actual})">
                            Seleccionar
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';

        const contenedor = document.getElementById('contenedor-materiales-modal');
        if (contenedor) contenedor.innerHTML = html;

    } catch (error) {
        console.error('Error modal:', error);
        Swal.fire('Error', 'No se pudieron cargar los materiales.', 'error');
    }
}




// ================= SELECCIONAR =================
async function seleccionarMaterial(folio, descripcion, stock) {
    const codigo = document.getElementById('codigo');
    const desc = document.getElementById('descripcion');
    const stockInput = document.getElementById('stock-actual');

    if (codigo) codigo.value = folio;
    if (desc) desc.value = descripcion;
    if (stockInput) stockInput.value = stock;

    try {
        const response = await fetch(`query_sql/Autocompletar.php?folio=${encodeURIComponent(folio)}`);
        const result = await response.json();

        if (result.status === 'ok' && result.datos) {
            const d = result.datos;

            console.log('DATOS BACKEND:', d); 

            //  FORZAR STRING (CLAVE)
            const unidad = document.getElementById('unidad');
            const estado = document.getElementById('estado');
            const categoria = document.getElementById('id_categoria');

            if (unidad) unidad.value = String(d.id_unidad_material || '');
            if (estado) estado.value = String(d.id_estado_material || '');
            if (categoria) categoria.value = String(d.id_categoria_material || '');

            //  fallback por si no selecciona (extra seguro)
            if (estado && !estado.value) {
                [...estado.options].forEach(opt => {
                    if (opt.value == d.id_estado_material) opt.selected = true;
                });
            }
        }

    } catch (error) {
        console.error('Error al autocompletar:', error);
    }

    const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModalCenter'));
    if (modal) modal.hide();
}

// ================= CATALOGOS =================
async function cargarCatalogos() {
    try {
        const response = await fetch('query_sql/catalogo_listas.php');
        const text = await response.text();

        if (!text) throw new Error("Respuesta vacía");

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            console.error("Respuesta inválida:", text);
            throw new Error("JSON inválido");
        }

        if (data.status === 'error') throw new Error(data.message);

        llenarSelect('id_categoria', data.categorias, 'id_categoria_material', 'descripcion_categoria_material');
        llenarSelect('estado', data.estados, 'id_estado_material', 'descripcion_estado_material');
        llenarSelect('unidad', data.unidades, 'id_unidad_material', 'descripcion_unidad_material');

    } catch (error) {
        console.error('Error catálogos:', error);
        Swal.fire('Error', error.message || 'No se pudieron cargar los catálogos.', 'error');
    }
}


// ================= UTIL =================
function llenarSelect(id, datos, valueKey, textKey) {
    const select = document.getElementById(id);
    if (!select) return;

    select.innerHTML = '<option value="" selected disabled>Selecciona una opción</option>';

    (datos || []).forEach(item => {
        select.innerHTML += `<option value="${item[valueKey]}">${item[textKey]}</option>`;
    });
}