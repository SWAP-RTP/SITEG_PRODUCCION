import { cargarCatalogos } from './core/catalogosService.js';
import { ModalService } from './core/modalService.js';
import { MaterialesService } from './core/materialesService.js';
import { autocompletarBase } from './core/autocomplete.js';

document.addEventListener('DOMContentLoaded', () => {
    iniciar();
});

async function iniciar() {
    await cargarCatalogosInventario();
    eventos();
}

/* =============================
   CATALOGOS
============================= */
async function cargarCatalogosInventario() {

    const res = await fetch('query_sql/catalogo_listas.php');
    const data = await res.json();

    llenar('unidad_inventario', data.unidades, 'id_unidad_material', 'descripcion_unidad_material');
    llenar('estado_inventario', data.estados, 'id_estado_material', 'descripcion_estado_material');
    llenar('categoria_inventario', data.categorias, 'id_categoria_material', 'descripcion_categoria_material');
}

function llenar(id, datos, value, text) {
    const select = document.getElementById(id);
    if (!select) return;

    select.innerHTML = '<option value="">Selecciona...</option>';

    datos?.forEach(d => {
        select.innerHTML += `<option value="${d[value]}">${d[text]}</option>`;
    });
}

/* =============================
   EVENTOS
============================= */
function eventos() {

    const folioInput = document.getElementById('folio_inventario');

    // AUTOCOMPLETAR
    folioInput.addEventListener('blur', async (e) => {

        const folio = e.target.value;
        if (!folio) return;

        await autocompletarBase(folio, {
            fields: [],
            lockFields: false,
            setValues: (d) => {

                folioInput.value = d.folio_material;
                document.getElementById('descripcion_inventario').value = d.descripcion_material;
                document.getElementById('unidad_inventario').value = d.id_unidad_material || '';
                document.getElementById('estado_inventario').value = d.id_estado_material || '';
                document.getElementById('categoria_inventario').value = d.id_categoria_material || '';
                document.getElementById('adscripcion_inventario').value = d.adscripcion_modulo || '';

                document.getElementById('stock_actual_inventario').value =
                    MaterialesService.formatearCantidad(d.stock_actual || 0);
            }
        });
    });

    // MODAL
    document.getElementById('btn-modal-inventario')
        .addEventListener('click', () => {

            ModalService.abrir({
                modalId: 'modalMaterialInventario',
                contenedorId: 'contenedor-materiales-modal-inventario',
                callback: (folio) => {

                    folioInput.value = folio;
                    folioInput.dispatchEvent(new Event('blur'));
                }
            });
        });

    //  SOLO CLICK (NO SUBMIT)
    document.getElementById('btn-consultar-inventario')
        .addEventListener('click', consultarInventario);
}

/* =============================
   CONSULTAR INVENTARIO
============================= */
async function consultarInventario() {

    try {

        const res = await fetch(`query_sql/dashboard.php`);
        const data = await res.json();

        console.log('DASHBOARD:', data);

        if (!data || data.status === 'error') {
            Swal.fire('Error', 'Sin datos del servidor', 'error');
            return;
        }

        renderDashboard(data);

        // mostrar dashboard
        document.getElementById('dashboard-inventario').style.display = 'block';

    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Error al consultar inventario', 'error');
    }
}
/* =============================
   DASHBOARD
============================= */
function renderDashboard(data) {

    document.getElementById('dashboard-inventario').style.display = 'block';

    document.getElementById('total_materiales').textContent = data.total_materiales ?? 0;
    document.getElementById('stock_total').textContent = data.stock_total ?? 0;
    document.getElementById('stock_bajo').textContent = data.stock_bajo ?? 0;
    document.getElementById('movimientos_hoy').textContent = data.movimientos_hoy ?? 0;

    const tbody = document.getElementById('tabla_stock_bajo');
    tbody.innerHTML = '';

    const lista = data.materiales_bajo || [];

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3">Sin materiales críticos</td></tr>`;
        return;
    }

    lista.forEach(m => {
        tbody.innerHTML += `
            <tr>
                <td>${m.folio_material}</td>
                <td>${m.descripcion_material}</td>
                <td class="text-danger fw-bold">${m.stock_actual}</td>
            </tr>
        `;
    });
}