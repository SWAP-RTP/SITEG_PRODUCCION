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
    const regexFolio = /^MA-\d{8,9}$/;
   folioInput.addEventListener('input', () => {
    let valor = folioInput.value.toUpperCase();
    // Elimina cualquier cantidad de prefijos MA- al inicio
    valor = valor.replace(/^(MA-)+/i, '');
    valor = 'MA-' + valor;
    folioInput.value = valor;


    if (!valor || valor === 'MA-') {
        limpiarSalida();
        desbloquearSalida();
        stockDisponible = 0;
        ultimoFolioSalida = '';
        return;
    }

    if (regexFolio.test(valor) && valor !== ultimoFolioSalida) {
        ultimoFolioSalida = valor;
        cargarMaterialSalida(valor);
    }
});
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
    const inputBuscar = document.getElementById('buscar-material-modal-salida');
    if (inputBuscar) {
        inputBuscar.addEventListener('input', () => {
            filtrarMaterialesModal(inputBuscar.value);
        });
    }
    document.getElementById('btn-limpiar-salida').addEventListener('click', () => {
        document.getElementById('form-salida-material').reset();

        const tabla = document.getElementById('tabla-salidas');
        if (tabla) tabla.innerHTML = '';


        const contenedor = document.getElementById('contenedor-tabla-salidas');
        if (contenedor) contenedor.style.display = 'none';

        stockDisponible = 0;
        ultimoFolioSalida = '';

        limpiarCamposSalida();
        desbloquearSalida();

        console.log("Formulario, tabla y consulta limpiados correctamente");
    });
    document.getElementById('cantidad_salida').addEventListener('input', (e) => {
        const cantidad = Number(e.target.value);
        if (cantidad > stockDisponible) {
            e.target.value = stockDisponible;
            Swal.fire('¡Atención!', 'Stock insuficiente', 'warning');
        }
    });
    document.getElementById('form-salida-material').addEventListener('submit', guardarSalida);
    document.getElementById('btn-consultar-salidas')?.addEventListener('click', cargarRegistrosSalidas);
  const inputBusquedaSalida = document.getElementById('busqueda-salida');
if (inputBusquedaSalida) {
    inputBusquedaSalida.addEventListener('input', function () {
        this.value = this.value.toUpperCase(); // fuerza mayúsculas visualmente
        const valor = this.value.trim();
        cargarRegistrosSalidas(1, valor);
    });
}
}
function filtrarMaterialesModal(texto) {

    const filtro = texto.toUpperCase();

    const filas = document.querySelectorAll('#contenedor-materiales-modal-salida table tbody tr');

    filas.forEach(tr => {

        const folio = tr.children[0]?.textContent.toUpperCase() || '';
        const descripcion = tr.children[1]?.textContent.toUpperCase() || '';

        if (folio.includes(filtro) || descripcion.includes(filtro)) {
            tr.style.display = '';
        } else {
            tr.style.display = 'none';
        }
    });
}
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
function limpiarCamposSalida() {
    ['descripcion_salida', 'adscripcion_salida', 'cantidad_salida', 'unidad_salida', 'estado_salida', 'categoria_salida']
        .forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
}
async function cargarMaterialSalida(folio) {
    if (!folio) {
        limpiarCamposSalida();
        desbloquearSalida();
        return;
    }

    const result = await MaterialesService.buscarPorFolio(folio);

    if (result.status !== 'ok' || !result.datos) {
        console.log('Material nuevo o no encontrado');
        Swal.fire('¡Atención!', 'El material con ese folio no está registrado.', 'warning');
        limpiarCamposSalida();
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

    // ALERTA DE STOCK BAJO
    if (stockDisponible <= 5) {
        Swal.fire('¡Atención!', 'El material está a punto de agotarse. Stock actual: ' + stockDisponible, 'warning');
    }
}
async function guardarSalida(e) {
    e.preventDefault();
    const cantidad = Number(document.getElementById('cantidad_salida').value);
    const folio = document.getElementById('folio_salida').value;
    if (!folio) {
        Swal.fire('¡Atención!', 'Datos incompletos o inválidos', 'warning');
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
        Swal.fire({
            title: 'Éxito',
            text: result.message + '\n¿Desea registrar otra salida de material?',
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No'
        }).then((respuesta) => {
            if (respuesta.isConfirmed) {
                document.getElementById('form-salida-material').reset();
                limpiarCamposSalida();
                desbloquearSalida();
                stockDisponible = 0;
            }
        });
    } else {
        Swal.fire('Error', result.message, 'error');
    }
}
async function cargarRegistrosSalidas(pagina = 1, busqueda = '') {
    const res = await MaterialesService.consultarSalidas(pagina, 5, busqueda);
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
    paginacionSalidas(res.actualPagina, res.totalPaginas, busqueda);
}
function paginacionSalidas(actualPagina, totalPaginas, busqueda = '') {
    const paginacion = document.getElementById('paginacion-salidas');
    paginacion.innerHTML = '';
    function crearBoton(label, pagina, disabled = false, active = false) {
        const li = document.createElement('li');
        li.className = 'page-item' + (disabled ? ' disabled' : '') + (active ? ' active' : '');
        li.innerHTML = `<a class="page-link" href="#">${label}</a>`;
        if (!disabled && !active) {
            li.addEventListener('click', (e) => {
                e.preventDefault();
                cargarRegistrosSalidas(pagina, busqueda);
            });
        }
        paginacion.appendChild(li);
    }
    crearBoton('Anterior', actualPagina - 1, actualPagina === 1);
    let start = Math.max(1, actualPagina - 2);
    let end = Math.min(totalPaginas, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) {
        crearBoton(i, i, false, i === actualPagina);
    }
    crearBoton('Siguiente', actualPagina + 1, actualPagina === totalPaginas);

}