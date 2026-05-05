//******* 1. Importaciones (SIEMPRE AL INICIO) *******
import { cargarCatalogos } from './core/catalogosService.js';
import { ModalService } from './core/modalService.js';
import { MaterialesService } from './core/materialesService.js';

//******* 2. Variable global de módulo *******
let timeoutBusqueda = null;
//******* 3. Funciones de lógica principal *******
async function cargarMaterial(folio) {
    if (!folio) return;
    const result = await MaterialesService.buscarPorFolio(folio);
    if (result.status !== 'ok' || !result.datos) {
        prepararVistaNuevoRegistro();
        return;
    }
    const datoMateriales = result.datos;
    const campos = [
        ['folio', folio],
        ['descripcion', (datoMateriales.descripcion_material || '').toUpperCase()],
        ['unidad', datoMateriales.id_unidad_material || ''],
        ['estado', datoMateriales.id_estado_material || ''],
        ['id_categoria', datoMateriales.id_categoria_material || ''],
        ['adscripcion', (datoMateriales.adscripcion_modulo || '').toUpperCase()]
    ];
    campos.forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.value = valor;
    });
    // Bloquear campos excepto cantidad
    const desc = document.getElementById('descripcion');
    const adsc = document.getElementById('adscripcion');
    if (desc) desc.readOnly = true;
    if (adsc) adsc.readOnly = true;
    ['unidad', 'estado', 'id_categoria'].forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.style.pointerEvents = 'none';
            elemento.style.backgroundColor = '#f8f9fa';
        }
    });
    const cantInput = document.getElementById('cantidad');
    if (cantInput) {
        cantInput.readOnly = false;
        cantInput.focus();
    }
}
async function guardarEntrada(eventoformulario) {
    eventoformulario.preventDefault();
    const cantidad = document.getElementById('cantidad').value;
    if (!cantidad || cantidad <= 0) {
        Swal.fire('Atención', 'Datos incompletos o inválidos', 'warning');
        return;
    }
    let folio = document.getElementById('folio').value.trim();
    try {
        if (!folio) {
            const folioData = await MaterialesService.generarFolio();
            if (folioData.status !== 'ok') throw new Error();
            folio = folioData.folio;
        }
        const data = {
            folio,
            descripcion: document.getElementById('descripcion').value,
            unidad: document.getElementById('unidad').value,
            estado: document.getElementById('estado').value,
            id_categoria: document.getElementById('id_categoria').value,
            adscripcion: document.getElementById('adscripcion').value,
            cantidad
        };
        const result = await MaterialesService.guardarEntrada(data);
        if (result.status === 'ok') {
            const respuesta = await Swal.fire({
                icon: 'success',
                title: 'Registrado',
                text: 'El material se registró correctamente.\n¿Deseas registrar otro?',
                showCancelButton: true,
                confirmButtonText: 'Sí',
                cancelButtonText: 'No'
            });
            document.getElementById('form-entrada-material').reset();
            ['descripcion', 'adscripcion', 'cantidad', 'unidad', 'estado', 'id_categoria'].forEach(id => {
                const elemento = document.getElementById(id);
                if (elemento) {
                    elemento.readOnly = false;
                    elemento.style.pointerEvents = 'auto';
                    elemento.style.backgroundColor = '';
                }
            });

            const folioInput = document.getElementById('folio');
            folioInput.readOnly = false;
            folioInput.style.backgroundColor = '';
            folioInput.style.cursor = '';
            if (respuesta.isConfirmed) {
                folioInput.focus();
            }
        } else {
            // Mostrar el mensaje real del backend si existe
            Swal.fire('Error', result.message || 'Error desconocido', 'error');
        }
    } catch (err) {
        Swal.fire('Error', err?.message || 'Error de comunicación', 'error');
    }
}
async function cargarRegistros(pagina = 1, busqueda = '') {
    try {
        const result = await MaterialesService.consultarEntradas(pagina, 5, busqueda);
        if (result.status !== 'ok') return;
        const tbody = document.getElementById('tabla-registros');
        tbody.innerHTML = '';
        result.datos.forEach(r => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${r.folio_material}</td>
                <td>${r.descripcion_material_entrada}</td>
                <td>${r.unidad}</td>
                <td>${r.estado}</td>
                <td>${r.cantidad}</td>
                <td>${r.fecha_registro}</td>
            `;
            tbody.appendChild(tr);
        });
        document.getElementById('contenedor-tabla-registros').style.display = 'block';
        paginacion(result.actualPagina, result.totalPaginas, busqueda);
    } catch (e) {
        console.error(e);
    }
}
function paginacion(actualPagina, totalPaginas, busqueda = '') {
    const paginacionContenedor = document.getElementById('paginacion');
    paginacionContenedor.innerHTML = '';

    const crearBoton = (label, pagina, disabled = false, active = false) => {
        const li = document.createElement('li');
        li.className = 'page-item' + (disabled ? ' disabled' : '') + (active ? ' active' : '');
        li.innerHTML = `<a class="page-link" href="#">${label}</a>`;
        if (!disabled && !active) {
            li.addEventListener('click', (e) => {
                e.preventDefault();
                cargarRegistros(pagina, busqueda);
            });
        }
        paginacionContenedor.appendChild(li);
    };

    crearBoton('Anterior', actualPagina - 1, actualPagina === 1);
    let start = Math.max(1, actualPagina - 2);
    let end = Math.min(totalPaginas, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) {
        crearBoton(i, i, false, i === actualPagina);
    }
    crearBoton('Siguiente', actualPagina + 1, actualPagina === totalPaginas);
}


function filtrarMaterialesModal(termino) {
 
    const contenedor = document.getElementById('contenedor-materiales-modal');
    if (!contenedor) return;
    const elementos = contenedor.querySelectorAll('tr, .material-row, .list-group-item');
    elementos.forEach(el => {
        const texto = el.textContent.toUpperCase();
        if (texto.includes(termino.toUpperCase())) {
            el.style.display = ''; // Mostrar
        } else {
            el.style.display = 'none'; // Ocultar
        }
    });
}
//******* 4. Configuración de Eventos *******
function configurarEventos() {
    const folioInput = document.getElementById('folio');
    if (folioInput) {
        folioInput.readOnly = false;
        folioInput.placeholder = "Ej: MA-00000001";
        folioInput.addEventListener('input', () => {
            let valor = folioInput.value.toUpperCase();
            // Permitir que el usuario escriba "M", "MA", "MA-" sin modificar
            if (
                valor === '' ||
                valor === 'M' ||
                valor === 'MA' ||
                valor === 'MA-'
            ) {
                folioInput.value = valor;
                return;
            }
            // Si no empieza con 'MA-', anteponerlo y solo permitir números después
            if (!valor.startsWith('MA-')) {
                valor = 'MA-' + valor.replace(/[^0-9]/g, '');
            } else {
                // Si empieza con MA-, solo permitir números después
                valor = 'MA-' + valor.slice(3).replace(/[^0-9]/g, '');
            }
            folioInput.value = valor;

            clearTimeout(timeoutBusqueda);
            if (!valor || valor === 'MA-') {
                const estadoMat = document.getElementById('estado-material');
                if (estadoMat) estadoMat.style.display = 'none';
                ['descripcion', 'cantidad', 'unidad', 'estado', 'id_categoria', 'adscripcion']
                    .forEach(id => {
                        const el = document.getElementById(id);
                        if (el) el.value = '';
                    });
                const desc = document.getElementById('descripcion');
                const adsc = document.getElementById('adscripcion');
                if (desc) desc.readOnly = false;
                if (adsc) adsc.readOnly = false;
                ['unidad', 'estado', 'id_categoria'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) {
                        el.style.pointerEvents = 'auto';
                        el.style.backgroundColor = '';
                    }
                });
                return;
            }
            timeoutBusqueda = setTimeout(async () => {
                const result = await MaterialesService.buscarPorFolio(valor);
                if (result.status === 'ok' && result.datos) {
                    cargarMaterial(valor);
                } else {
                    if (/^MA-\d{8,9}$/.test(valor)) {
                        await Swal.fire({
                            icon: 'info',
                            title: 'Código no registrado',
                            text: `El código "${valor}" no existe. Acomplete los demás campos  para generar un nuevo folio.`,
                            confirmButtonText: 'Entendido'
                        });
                        folioInput.readOnly = true;
                        folioInput.style.backgroundColor = '#e9ecef';
                        //desbloquearEntrada();
                        document.getElementById('descripcion').focus();
                    }
                }
            }, 500);
        });
    }

    const inputBusqueda = document.getElementById('busqueda-entrada');
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', function () {
            this.value = this.value.toUpperCase();
            cargarRegistros(1, this.value.trim());
        });
    }

    //******* Botones y Formularios *******
    document.getElementById('modal-material-entrada')?.addEventListener('click', () => {
        ModalService.abrir({
            modalId: 'exampleModalCenter',
            contenedorId: 'contenedor-materiales-modal',
            callback: (folio) => {
                const folioMayus = (folio || '').toUpperCase();
                document.getElementById('folio').value = folioMayus;
                cargarMaterial(folioMayus);
            }
        });
        // Asegura que el filtro de búsqueda del modal siempre funcione
        setTimeout(() => {
            const inputBuscar = document.getElementById('buscar-material-modal-entrada');
            if (inputBuscar) {
                // Elimina listeners previos para evitar duplicados
                inputBuscar.oninput = null;
                inputBuscar.addEventListener('input', () => {
                    const valor = inputBuscar.value.toUpperCase();
                    inputBuscar.value = valor;
                    filtrarMaterialesModal(valor);
                });
            }
        }, 200);
    });

    document.getElementById('btn-consultar-entradas')?.addEventListener('click', () => cargarRegistros());
    document.getElementById('form-entrada-material')?.addEventListener('submit', guardarEntrada);

    document.getElementById('btn-limpiar-entrada')?.addEventListener('click', () => {
        clearTimeout(timeoutBusqueda);
        document.getElementById('form-entrada-material').reset();
        document.getElementById('contenedor-tabla-registros').style.display = 'none';
        const f = document.getElementById('folio');
        f.readOnly = false;
        f.style.backgroundColor = '';
    });
}

// ******* 5. Ejecución Inicial ******* 
document.addEventListener('DOMContentLoaded', async () => {
    await cargarCatalogos();
    configurarEventos();
    prepararVistaNuevoRegistro();
});
