//******* 1. Importaciones *******
import { cargarCatalogos } from './core/catalogosService.js';
import { ModalService } from './core/modalService.js';
import { MaterialesService } from './core/materialesService.js';

//******* 2. Variables globales *******
let stockDisponible = 0;
let ultimoFolioSalida = '';
const regexFolio = /^MA-\d{8,9}$/;

//******* 3. Funciones de Apoyo (Helper Functions) *******

// Función para resetear el estado visual y de bloqueo de los campos
function resetearCamposSalida(limpiarFolio = false) {
    if (limpiarFolio) {
        const folioInput = document.getElementById('folio_salida');
        if (folioInput) folioInput.value = '';
    }

    const ids = ['descripcion_salida', 'adscripcion_salida', 'cantidad_salida', 'unidad_salida', 'estado_salida', 'categoria_salida'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    // Desbloquear
    const desc = document.getElementById('descripcion_salida');
    const ads = document.getElementById('adscripcion_salida');
    const cant = document.getElementById('cantidad_salida');
    if (desc) desc.readOnly = false;
    if (ads) ads.readOnly = false;
    if (cant) cant.readOnly = false;

    ['unidad_salida', 'estado_salida', 'categoria_salida'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.pointerEvents = 'auto';
            el.style.backgroundColor = '';
        }
    });

    stockDisponible = 0;
    ultimoFolioSalida = '';
}

//******* 4. Funciones Principales *******

async function cargarMaterialSalida(folio) {
    if (!folio) {
        resetearCamposSalida();
        return;
    }

    const result = await MaterialesService.buscarPorFolio(folio);

    if (result.status !== 'ok' || !result.datos) {
        Swal.fire('¡Atención!', 'El material con ese folio no está registrado.', 'warning');
        resetearCamposSalida();
        return;
    }

    const datosMaterial = result.datos;

    // Llenado de campos
    document.getElementById('descripcion_salida').value = datosMaterial.descripcion_material || '';
    document.getElementById('adscripcion_salida').value = datosMaterial.adscripcion_modulo || '';
    document.getElementById('unidad_salida').value = datosMaterial.id_unidad_material || '';
    document.getElementById('estado_salida').value = datosMaterial.id_estado_material || '';
    document.getElementById('categoria_salida').value = datosMaterial.id_categoria_material || '';

    stockDisponible = Number(datosMaterial.stock_actual || 0);

    // Bloqueo de campos (solo lectura tras encontrar el material)
    document.getElementById('descripcion_salida').readOnly = true;
    document.getElementById('adscripcion_salida').readOnly = true;

    ['unidad_salida', 'estado_salida', 'categoria_salida'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.pointerEvents = 'none';
            el.style.backgroundColor = '#e9ecef';
        }
    });

    if (stockDisponible <= 5) {
        Swal.fire('¡Atención!', `El material está a punto de agotarse. Stock actual: ${stockDisponible}`, 'warning');
    }
}

async function guardarSalida(e) {
    e.preventDefault();
    const cantidadInput = document.getElementById('cantidad_salida');
    const cantidad = Number(cantidadInput.value);
    const folio = document.getElementById('folio_salida').value;

    if (!folio || cantidad <= 0) {
        Swal.fire('¡Atención!', 'Ingrese un folio válido y una cantidad mayor a cero.', 'warning');
        return;
    }

    if (cantidad > stockDisponible) {
        Swal.fire('Error', 'Stock insuficiente para realizar esta salida.', 'error');
        return;
    }

    // --- NUEVA LÓGICA DE ADVERTENCIA PREVENTIVA ---
    const stockRestante = stockDisponible - cantidad;

    if (stockRestante === 0) {
        const confirmacion = await Swal.fire({
            title: '¿Confirmar Salida?',
            text: '¡Atención! Con esta salida el material se agotará por completo (Stock: 0).',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, agotar stock',
            cancelButtonText: 'Cancelar'
        });
        if (!confirmacion.isConfirmed) return;
    } else if (stockRestante <= 3) { // Umbral personalizable
        const confirmacion = await Swal.fire({
            title: 'Stock Crítico',
            text: `Después de esta salida solo quedarán ${stockRestante} unidades. ¿Desea continuar?`,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Revisar'
        });
        if (!confirmacion.isConfirmed) return;
    }
    // ----------------------------------------------

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
            document.getElementById('form-salida-material').reset();
            resetearCamposSalida(true);
        });
    } else {
        Swal.fire('Error', result.message, 'error');
    }
}

//******* 5. Consultas y Tablas *******

async function cargarRegistrosSalidas(pagina = 1, busqueda = '') {
    const res = await MaterialesService.consultarSalidas(pagina, 5, busqueda);
    const tbody = document.getElementById('tabla-salidas');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (res.status === 'ok' && Array.isArray(res.datos)) {
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
}

function paginacionSalidas(actualPagina, totalPaginas, busqueda = '') {
    const paginacion = document.getElementById('paginacion-salidas');
    if (!paginacion) return;
    paginacion.innerHTML = '';

    const crearBoton = (label, pagina, disabled = false, active = false) => {
        const li = document.createElement('li');
        li.className = `page-item ${disabled ? 'disabled' : ''} ${active ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#">${label}</a>`;
        if (!disabled && !active) {
            li.addEventListener('click', (e) => {
                e.preventDefault();
                cargarRegistrosSalidas(pagina, busqueda);
            });
        }
        paginacion.appendChild(li);
    };

    crearBoton('Anterior', actualPagina - 1, actualPagina === 1);
    for (let i = 1; i <= totalPaginas; i++) {
        if (i >= actualPagina - 2 && i <= actualPagina + 2) {
            crearBoton(i, i, false, i === actualPagina);
        }
    }
    crearBoton('Siguiente', actualPagina + 1, actualPagina === totalPaginas);
}

//******* 6. Buscador del Modal (Lógica corregida) *******

function filtrarMaterialesSalida(termino) {
    const contenedor = document.getElementById('contenedor-materiales-modal-salida');
    if (!contenedor) return;

    // Buscamos las filas. Intentamos con 'tr' (si es tabla) o los divs directos
    const items = contenedor.querySelectorAll('tr, .d-flex, div[onclick]');
    let encontrados = 0;

    items.forEach(item => {
        // Evitamos filtrar el encabezado si existe
        if (item.querySelector('th')) return; 

        const texto = item.textContent.toUpperCase();
        if (texto.includes(termino.toUpperCase())) {
            // Si es una fila de tabla usamos 'table-row', si es div usamos 'flex' o 'block'
            const displayType = (item.tagName === 'TR') ? 'table-row' : 'flex';
            item.style.setProperty('display', displayType, 'important');
            encontrados++;
        } else {
            item.style.setProperty('display', 'none', 'important');
        }
    });

    // Lógica del mensaje "No hay coincidencias"
    const mensajeExistente = document.getElementById('sin-resultados-modal');
    
    if (encontrados === 0 && termino !== '') {
        if (!mensajeExistente) {
            const p = document.createElement('p');
            p.id = 'sin-resultados-modal';
            p.className = 'text-center text-muted mt-3';
            p.textContent = 'No se encontraron coincidencias...';
            contenedor.appendChild(p);
        }
    } else {
        if (mensajeExistente) mensajeExistente.remove();
    }
}
//******* 7. Configuración de Eventos *******

function configurarEventosSalida() {
    const folioInput = document.getElementById('folio_salida');

    // Formateo de Folio MA-
    folioInput.addEventListener('input', () => {
        let valor = folioInput.value.toUpperCase();
        if (!valor.startsWith('MA-') && valor.length > 0) {
            if (valor.startsWith('MA')) valor = 'MA-' + valor.slice(2);
            else if (valor.startsWith('M')) valor = 'MA-' + valor.slice(1);
            else valor = 'MA-' + valor;
        }
        // Limpiar caracteres no numéricos después del guion
        if (valor.startsWith('MA-')) {
            const parteNumerica = valor.slice(3).replace(/\D/g, '');
            valor = 'MA-' + parteNumerica;
        }
        folioInput.value = valor;

        if (regexFolio.test(valor) && valor !== ultimoFolioSalida) {
            ultimoFolioSalida = valor;
            cargarMaterialSalida(valor);
        } else if (valor === 'MA-' || valor === '') {
            resetearCamposSalida();
        }
    });

    // Modal Selección
    // Dentro de configurarEventosSalida() -> Evento click de btn-modal-salida
    document.getElementById('btn-modal-salida').addEventListener('click', () => {
        // 1. Limpiar el buscador del modal antes de abrir
        const buscador = document.getElementById('buscar-material-modal-salida');
        if (buscador) buscador.value = '';

        // 2. Abrir el modal
        ModalService.abrir({
            modalId: 'modalMaterialSalida',
            contenedorId: 'contenedor-materiales-modal-salida',
            callback: (folio) => {
                folioInput.value = folio;
                ultimoFolioSalida = folio;
                cargarMaterialSalida(folio);
                const modalEl = document.getElementById('modalMaterialSalida');
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
            }
        });
    });

    // Evento para el buscador del modal (usando delegación para seguridad)
    document.addEventListener('input', (e) => {
        if (e.target.id === 'buscar-material-modal-salida') {
            const valor = e.target.value.toUpperCase();
            e.target.value = valor;
            filtrarMaterialesSalida(valor);
        }
    });

    // Botón Limpiar
    document.getElementById('btn-limpiar-salida').addEventListener('click', () => {
        document.getElementById('form-salida-material').reset();
        resetearCamposSalida(true);
        const contenedorTabla = document.getElementById('contenedor-tabla-salidas');
        if (contenedorTabla) contenedorTabla.style.display = 'none';
    });

    // Validación de stock en tiempo real
    document.getElementById('cantidad_salida').addEventListener('input', (e) => {
        const cant = Number(e.target.value);
        if (cant > stockDisponible) {
            e.target.value = stockDisponible;
            Swal.fire('¡Atención!', `No puedes exceder el stock disponible (${stockDisponible})`, 'warning');
        }
    });

    document.getElementById('form-salida-material').addEventListener('submit', guardarSalida);
    document.getElementById('btn-consultar-salidas')?.addEventListener('click', () => cargarRegistrosSalidas(1));

    // Buscador de la tabla de registros
    const inputBusquedaSalida = document.getElementById('busqueda-salida');
    if (inputBusquedaSalida) {
        inputBusquedaSalida.addEventListener('input', function () {
            this.value = this.value.toUpperCase();
            cargarRegistrosSalidas(1, this.value.trim());
        });
    }
}

//******* 8. Inicialización *******
document.addEventListener('DOMContentLoaded', async () => {
    await cargarCatalogos();
    configurarEventosSalida();
});