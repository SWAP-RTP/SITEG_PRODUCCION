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
    select.innerHTML = '<option value="">Selecciona</option>';
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
            const folioInput = document.getElementById('folio_inventario');
            if (folioInput) folioInput.value = d.folio_material;

            const descripcion = document.getElementById('descripcion_inventario');
            if (descripcion) {
                descripcion.value = d.descripcion_material;
                descripcion.readOnly = true;
            }

            const adscripcion = document.getElementById('adscripcion_inventario');
            if (adscripcion) {
                adscripcion.value = d.adscripcion_modulo || '';
                adscripcion.readOnly = true;
            }

            const stock = document.getElementById('stock_actual_inventario');
            if (stock) stock.value = MaterialesService.formatearCantidad(d.stock_actual || 0);

            // Solo manipula los selects si existen
            const unidad = document.getElementById('unidad_inventario');
            if (unidad) {
                unidad.value = d.id_unidad_material || '';
                unidad.style.pointerEvents = 'none';
                unidad.style.backgroundColor = '#e9ecef';
            }
            const estado = document.getElementById('estado_inventario');
            if (estado) {
                estado.value = d.id_estado_material || '';
                estado.style.pointerEvents = 'none';
                estado.style.backgroundColor = '#e9ecef';
            }
            const categoria = document.getElementById('categoria_inventario');
            if (categoria) {
                categoria.value = d.id_categoria_material || '';
                categoria.style.pointerEvents = 'none';
                categoria.style.backgroundColor = '#e9ecef';
            }

            const btnGuardar = document.getElementById('btn-guardar');
            if (btnGuardar) btnGuardar.disabled = false;
        }
    });
}
function eventos() {
    const folioInput = document.getElementById('folio_inventario');
    const form = document.getElementById('form-inventario');
    //AUTOCOMPLETAR
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

    // ALERTA visual para Stock Bajo
    const stockBajo = parseInt(document.getElementById('stock_bajo').textContent, 10);
    const cardStockBajo = document.querySelectorAll('.card-dark')[2]; 
    if (cardStockBajo) {
        if (stockBajo > 0) {
            cardStockBajo.classList.remove('card-dark');
            cardStockBajo.classList.add('bg-danger', 'text-white');
        } else {
            cardStockBajo.classList.remove('bg-danger', 'text-white');
            cardStockBajo.classList.add('card-dark');
        }
    }

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
// Función para refrescar los datos del dashboard
async function refrescarDashboard() {
    try {
        const respuesta = await fetch('tu_archivo_metricas.php');
        const data = await respuesta.json();

        // Actualizamos los elementos del DOM
        document.getElementById('total-materiales').textContent = data.total_materiales;
        document.getElementById('stock-total').textContent = data.stock_total;
        document.getElementById('stock-bajo-count').textContent = data.stock_bajo;
        
        // El contador de la imagen image_396522.png
        const kpiMovimientos = document.getElementById('movimientos-hoy');
        if (kpiMovimientos) {
            kpiMovimientos.textContent = data.movimientos_hoy;
        }

        // Si tienes la tabla de stock bajo, la actualizamos también
        actualizarTablaBajoStock(data.materiales_bajo);

    } catch (error) {
        console.error("Error al actualizar el dashboard:", error);
    }
}
// 1. Ejecutar de inmediato al cargar
refrescarDashboard();

// 2. Ejecutar automáticamente cada 30 segundos para mantenerlo "vivo"
setInterval(refrescarDashboard, 30000);

