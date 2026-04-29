import { cargarCatalogos } from './core/catalogosService.js';
import { ModalService } from './core/modalService.js';
import { MaterialesService } from './core/materialesService.js';
import { autocompletarBase } from './core/autocomplete.js';

let ultimoFolio = '';

document.addEventListener('DOMContentLoaded', () => {
    iniciar();
});

async function iniciar() {
    await cargarCatalogosInventario();
    eventos();
}
function filtrarMaterialesModal(texto) {

    const filtro = texto.toUpperCase();

    const filas = document.querySelectorAll('#contenedor-materiales-modal-inventario table tbody tr');

    filas.forEach(tr => {

        const folio = tr.children[0]?.textContent.toUpperCase() || '';
        const descripcion = tr.children[1]?.textContent.toUpperCase() || '';

        tr.style.display =
            (folio.includes(filtro) || descripcion.includes(filtro))
                ? ''
                : 'none';
    });
}
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
async function autocompletarFolio(folio) {

    if (!folio || folio === ultimoFolio) return;

    ultimoFolio = folio;

    await autocompletarBase(folio, {
        fields: [],
        lockFields: false,
        setValues: (d) => {

            document.getElementById('folio_inventario').value = d.folio_material;
            document.getElementById('descripcion_inventario').value = d.descripcion_material;
            document.getElementById('unidad_inventario').value = d.id_unidad_material || '';
            document.getElementById('estado_inventario').value = d.id_estado_material || '';
            document.getElementById('categoria_inventario').value = d.id_categoria_material || '';
            document.getElementById('adscripcion_inventario').value = d.adscripcion_modulo || '';

            document.getElementById('stock_actual_inventario').value =
                MaterialesService.formatearCantidad(d.stock_actual || 0);

            const btnGuardar = document.getElementById('btn-guardar');
            if (btnGuardar) btnGuardar.disabled = false;
        }
    });
}
function eventos() {

    const folioInput = document.getElementById('folio_inventario');
    const form = document.getElementById('form-inventario');

    /* AUTOCOMPLETAR */
    folioInput.addEventListener('input', () => {

        const folio = folioInput.value.trim().toUpperCase();
        folioInput.value = folio;

        if (folio.length >= 11) {
            autocompletarFolio(folio);
        }
    });

    folioInput.addEventListener('blur', () => {
        autocompletarFolio(folioInput.value);
    });

     
    document.getElementById('btn-modal-inventario')
        .addEventListener('click', () => {

            ModalService.abrir({
                modalId: 'modalMaterialInventario',
                contenedorId: 'contenedor-materiales-modal-inventario',
                callback: (folio) => {
                    folioInput.value = folio;
                    autocompletarFolio(folio);
                }
            });

            
            setTimeout(() => {

                const inputBuscar = document.getElementById('buscar-material-modal-inventario');

                if (inputBuscar) {

                    inputBuscar.addEventListener('input', (e) => {

                        // MAYÚSCULAS
                        e.target.value = e.target.value.toUpperCase();

                        // FILTRAR
                        filtrarMaterialesModal(e.target.value);
                    });
                }

            }, 200);
        });

    /* VALIDACIÓN */
    if (form) {
        form.addEventListener('submit', (e) => {

            const descripcion = document.getElementById('descripcion_inventario').value;

            if (!descripcion) {
                e.preventDefault();
                Swal.fire('¡Atención!', 'Datos incompletos', 'warning');
            }
        });
    }


    document.getElementById('btn-consultar-inventario')
        .addEventListener('click', consultarInventario);

  
    document.getElementById('btn-limpiar-inventario').addEventListener('click', () => {

        if (form) form.reset();

        document.getElementById('stock_actual_inventario').value = '0';

        ultimoFolio = '';

        const btnGuardar = document.getElementById('btn-guardar');
        if (btnGuardar) btnGuardar.disabled = true;

        const tabla = document.getElementById('tabla_stock_bajo');
        if (tabla) tabla.innerHTML = '';

        const dashboard = document.getElementById('dashboard-inventario');
        if (dashboard) dashboard.style.display = 'none';

        console.log("Formulario limpio correctamente");
    });
}
async function consultarInventario() {

    try {

        const res = await fetch(`query_sql/dashboard.php`);
        const data = await res.json();

        if (!data || data.status === 'error') {
            Swal.fire('Error', 'Sin datos del servidor', 'error');
            return;
        }

        renderDashboard(data);

        document.getElementById('dashboard-inventario').style.display = 'block';

    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Error al consultar inventario', 'error');
    }
}
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