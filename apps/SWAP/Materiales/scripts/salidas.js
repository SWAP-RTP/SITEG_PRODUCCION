import { cargarCatalogos } from './core/catalogosService.js';
import { ModalService } from './core/modalService.js';
import { MaterialesService } from './core/materialesService.js';

let stockDisponible = 0;

document.addEventListener('DOMContentLoaded', async () => {

    await cargarCatalogos();
    eventos();
});

function eventos() {

    const folioInput = document.getElementById('folio_salida');
    let ultimoFolioSalida = '';

    /* =========================
       AUTOCOMPLETAR AUTOMÁTICO
    ========================= */
    const regexFolio = /^MA-\d{8,9}$/;

    folioInput.addEventListener('input', () => {

        const folio = folioInput.value.trim();

        if (regexFolio.test(folio) && folio !== ultimoFolioSalida) {
            ultimoFolioSalida = folio;
            cargarMaterialSalida(folio);
        }
    });

    /* =========================
       MODAL (sin cambios)
    ========================= */
    document.getElementById('btn-modal-salida').addEventListener('click', () => {

        ModalService.abrir({
            modalId: 'modalMaterialSalida',
            contenedorId: 'contenedor-materiales-modal-salida',
            callback: (folio) => {
                folioInput.value = folio;
                ultimoFolioSalida = folio;
                cargarMaterialSalida(folio);
            }
        });
    });

    /* =========================
       LIMPIAR 
    ========================= */
   document.getElementById('btn-limpiar-salida').addEventListener('click', () => {

    // reset form
    document.getElementById('form-salida-material').reset();

    // limpiar tabla (usar MISMO selector que usas al pintar)
    const tabla = document.getElementById('tabla-salidas');
    if (tabla) tabla.innerHTML = '';

    // ocultar contenedor de resultados
    const contenedor = document.getElementById('contenedor-tabla-salidas');
    if (contenedor) contenedor.style.display = 'none';

    // reset variables
    stockDisponible = 0;
    ultimoFolioSalida = '';

    limpiarSalida();
    desbloquearSalida();

    console.log("Formulario, tabla y consulta limpiados correctamente");
});
    /* =========================
       VALIDACIÓN STOCK
    ========================= */
    document.getElementById('cantidad_salida').addEventListener('input', (e) => {

        const cantidad = Number(e.target.value);

        if (cantidad > stockDisponible) {
            e.target.value = stockDisponible;
            Swal.fire('¡Atención!', 'Stock insuficiente', 'warning');
        }
    });

    /* =========================
       GUARDAR
    ========================= */
    document.getElementById('form-salida-material')
        .addEventListener('submit', guardarSalida);

    /* =========================
       CONSULTAR
    ========================= */
    document.getElementById('btn-consultar-salidas')
        ?.addEventListener('click', cargarRegistrosSalidas);
}

/* =========================
   BLOQUEO / DESBLOQUEO
========================= */

function bloquearSalida() {

    document.getElementById('descripcion_salida').readOnly = true;
    document.getElementById('adscripcion_salida').readOnly = true;

    document.getElementById('cantidad_salida').readOnly = false;

    ['unidad_salida', 'estado_salida', 'categoria_salida'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.pointerEvents = 'none';
            el.style.backgroundColor = '#e9ecef';
        }
    });
}

function desbloquearSalida() {

    document.getElementById('descripcion_salida').readOnly = false;
    document.getElementById('adscripcion_salida').readOnly = false;
    document.getElementById('cantidad_salida').readOnly = false;

    ['unidad_salida', 'estado_salida', 'categoria_salida'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.pointerEvents = 'auto';
            el.style.backgroundColor = '';
        }
    });
}

function limpiarSalida() {
    document.getElementById('folio_salida').value = '';
    document.getElementById('descripcion_salida').value = '';
    document.getElementById('adscripcion_salida').value = '';
    document.getElementById('cantidad_salida').value = '';
    document.getElementById('unidad_salida').value = '';
    document.getElementById('estado_salida').value = '';
    document.getElementById('categoria_salida').value = '';
}

/* =========================
   CARGAR MATERIAL
========================= */

async function cargarMaterialSalida(folio) {

    if (!folio) {
        limpiarSalida();
        desbloquearSalida();
        return;
    }

    const result = await MaterialesService.buscarPorFolio(folio);

    if (result.status !== 'ok' || !result.datos) {

        console.log('Material nuevo o no encontrado');

        limpiarSalida();
        desbloquearSalida();

        return;
    }

    const d = result.datos;

    document.getElementById('folio_salida').value = d.folio_material;
    document.getElementById('descripcion_salida').value = d.descripcion_material;

    stockDisponible = Number(d.stock_actual || 0);

    document.getElementById('adscripcion_salida').value = d.adscripcion_modulo || '';

    document.getElementById('unidad_salida').value = d.id_unidad_material || '';
    document.getElementById('estado_salida').value = d.id_estado_material || '';
    document.getElementById('categoria_salida').value = d.id_categoria_material || '';

    bloquearSalida();
}

/* =========================
   GUARDAR SALIDA
========================= */

async function guardarSalida(e) {

    e.preventDefault();

    const cantidad = Number(document.getElementById('cantidad_salida').value);
    const folio = document.getElementById('folio_salida').value;

    if (!folio) {
        Swal.fire('¡Atención!', 'Datos incompletos', 'warning');
        return;
    }

    if (cantidad <= 0 || cantidad > stockDisponible) {
        Swal.fire('Error', 'Stock insuficiente o cantidad inválida', 'error');
        return;
    }

    const data = {
        folio_material: folio,
        cantidad_material_salida: cantidad,
        descripcion_material_salida: document.getElementById('descripcion_salida').value,
        id_estado_material_salida: document.getElementById('estado_salida').value,
        adscripcion_modulo: document.getElementById('adscripcion_salida').value
    };

    const result = await MaterialesService.guardarSalida(data);

    if (result.status === 'ok') {

        Swal.fire('Éxito', result.message, 'success');

        document.getElementById('form-salida-material').reset();
        limpiarSalida();
        desbloquearSalida();
        stockDisponible = 0;

    } else {
        Swal.fire('Error', result.message, 'error');
    }
}

/* =========================
   CONSULTA SALIDAS
========================= */

async function cargarRegistrosSalidas() {

    const res = await MaterialesService.consultarSalidas();

    if (res.status !== 'ok' || !Array.isArray(res.datos)) {
        console.warn('Sin datos de salidas');
        return;
    }

    const tbody = document.getElementById('tabla-salidas');

    if (!tbody) {
        console.error('No existe el tbody #tabla-salidas en el DOM');
        return;
    }

    tbody.innerHTML = '';

    res.datos.forEach(r => {

        const tr = document.createElement('tr');

       tr.innerHTML = `
    <td>${r.folio_material ?? ''}</td>
    <td>${r.descripcion_material_salida ?? ''}</td>
    <td>${r.unidad ?? ''}</td>
    <td>${r.estado ?? ''}</td>
    <td>${r.cantidad ?? 0}</td>
    <td>${r.fecha_registro ?? ''}</td>
`;

        tbody.appendChild(tr);
    });

    document.getElementById('contenedor-tabla-salidas').style.display = 'block';
}