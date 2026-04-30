import { cargarCatalogos } from './core/catalogosService.js';
import { ModalService } from './core/modalService.js';
import { MaterialesService } from './core/materialesService.js';
let timeoutBusqueda = null;
document.addEventListener('DOMContentLoaded', async () => {
    await cargarCatalogos();
    eventos();
    prepararVistaNuevoRegistro();
});
function eventos() {
    const folioInput = document.getElementById('folio');
    if (folioInput) {
        folioInput.readOnly = false;
        folioInput.placeholder = "Ej: MA-00000001";

        folioInput.addEventListener('input', () => {
            let valor = folioInput.value.toUpperCase();
            // Elimina cualquier cantidad de prefijos MA- al inicio
            valor = valor.replace(/^(MA-)+/i, '');
            valor = 'MA-' + valor;
            folioInput.value = valor;
            clearTimeout(timeoutBusqueda);
            if (!valor || valor === 'MA-') {
                prepararVistaNuevoRegistro();
                return;
            }
            timeoutBusqueda = setTimeout(async () => {
                const folioActual = document.getElementById('folio').value.trim().toUpperCase();
                if (!folioActual) return;
                const result = await MaterialesService.buscarPorFolio(folioActual);
                if (result.status === 'ok' && result.datos) {
                    cargarMaterial(folioActual);
                } else {
                    document.getElementById('estado-material').style.display = 'none';
                    desbloquearEntrada();
                    if (/^MA-\d{8,9}$/.test(folioActual)) {
                        await Swal.fire({
                            icon: 'info',
                            title: 'Código no registrado',
                            text: `El código "${folioActual}" No existe. Complete los demás campos para registrar uno nuevo.`,
                            confirmButtonText: 'Entendido'
                        });
                        folioInput.value = folioActual;
                        folioInput.readOnly = true;
                        folioInput.style.backgroundColor = '#e9ecef';
                        folioInput.style.cursor = 'not-allowed';
                        desbloquearEntrada();
                        document.getElementById('descripcion').focus();
                    }
                }
            }, 500);
        });
        folioInput.addEventListener('blur', async () => {
            const folioValue = folioInput.value.trim().toUpperCase();
            if (folioValue) {
                const result = await MaterialesService.buscarPorFolio(folioValue);
                if (result.status !== 'ok' || !result.datos) {
                    Swal.fire({
                        icon: 'info',
                        title: 'Código no registrado',
                        text: `El código "${folioValue}" no existe. Complete los campos para registrar uno nuevo.`,
                        confirmButtonText: 'Entendido'
                    });
                    folioInput.value = '';
                    prepararVistaNuevoRegistro();
                }
            }
        });
    }
    const inputBusqueda = document.getElementById('busqueda-entrada');
if (inputBusqueda) {
    inputBusqueda.addEventListener('input', function () {
        this.value = this.value.toUpperCase(); // fuerza mayúsculas visualmente
        const valor = this.value.trim();
        cargarRegistros(1, valor);
    });
}
    const inputBuscarModal = document.getElementById('buscar-material-modal-entrada');
    if (inputBuscarModal) {
        inputBuscarModal.addEventListener('input', function () {
            this.value = this.value.toUpperCase();
            filtrarMaterialesModalEntrada(this.value);
        });
    }
    ['descripcion', 'adscripcion'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => {
                input.value = input.value.toUpperCase();
            });
        }
    });
    document.getElementById('modal-material-entrada').addEventListener('click', () => {
        ModalService.abrir({
            modalId: 'exampleModalCenter',
            contenedorId: 'contenedor-materiales-modal',
            callback: (folio) => {
                const folioMayus = (folio || '').toUpperCase();
                document.getElementById('folio').value = folioMayus;
                cargarMaterial(folioMayus);
            }
        });
    });
    document.getElementById('btn-consultar-entradas').addEventListener('click', cargarRegistros);
    document.getElementById('btn-limpiar-entrada').addEventListener('click', () => {
        clearTimeout(timeoutBusqueda);
        document.getElementById('form-entrada-material').reset();
        document.getElementById('contenedor-tabla-registros').style.display = 'none';
        desbloquearEntrada();
        //desbloquea el folio con el boton de limpiar
        const folioInput = document.getElementById('folio');
        folioInput.readOnly = false;
        folioInput.style.backgroundColor = '';
        folioInput.style.cursor = '';
    });
    document.getElementById('form-entrada-material').addEventListener('submit', guardarEntrada);

}
function prepararVistaNuevoRegistro() {
    document.getElementById('estado-material').style.display = 'none';
    limpiarCamposEntrada();
    desbloquearEntrada();
}
async function cargarMaterial(folio) {
    if (!folio) return;
    const result = await MaterialesService.buscarPorFolio(folio);
    if (result.status !== 'ok' || !result.datos) {
        prepararVistaNuevoRegistro();
        return;
    }
    const d = result.datos;
    document.getElementById('folio').value = folio;
    document.getElementById('descripcion').value = (d.descripcion_material || '').toUpperCase();
    document.getElementById('unidad').value = d.id_unidad_material || '';
    document.getElementById('estado').value = d.id_estado_material || '';
    document.getElementById('id_categoria').value = d.id_categoria_material || '';
    document.getElementById('adscripcion').value = (d.adscripcion_modulo || '').toUpperCase();
    bloquearEntrada();
    document.getElementById('cantidad').readOnly = false;
    document.getElementById('cantidad').focus();
}
async function guardarEntrada(e) {
    e.preventDefault();
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
            limpiarCamposEntrada();
            desbloquearEntrada();
            //aqui se desbloquea todo el formulario para un nuevo registro, incluyendo el folio
            const folioInput = document.getElementById('folio');
            folioInput.readOnly = false;
            folioInput.style.backgroundColor = '';
            folioInput.style.cursor = '';
            if (respuesta.isConfirmed) {
                document.getElementById('folio').focus();
            }
        }
    } catch {
        Swal.fire('Error', 'Error de comunicación', 'error');
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
    const paginacion = document.getElementById('paginacion');
    paginacion.innerHTML = '';

    // CREA LOS BOTONES DE PAGINACIÓN
    function crearBoton(label, pagina, disabled = false, active = false) {
        const li = document.createElement('li');
        li.className = 'page-item' + (disabled ? ' disabled' : '') + (active ? ' active' : '');
        li.innerHTML = `<a class="page-link" href="#">${label}</a>`;
        if (!disabled && !active) {
            li.addEventListener('click', (e) => {
                e.preventDefault();
                cargarRegistros(pagina, busqueda);
            });
        }
        paginacion.appendChild(li);
    }

    //BOTON ANTERIOR
    crearBoton('Anterior', actualPagina - 1, actualPagina === 1);

    // RANGO DE PÁGINAS
    let start = Math.max(1, actualPagina - 2);
    let end = Math.min(totalPaginas, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);

    for (let i = start; i <= end; i++) {
        crearBoton(i, i, false, i === actualPagina);
    }

    //BOTON SIGUIENTE
    crearBoton('Siguiente', actualPagina + 1, actualPagina === totalPaginas);
}
function bloquearEntrada() {
    document.getElementById('descripcion').readOnly = true;
    document.getElementById('adscripcion').readOnly = true;
    ['unidad', 'estado', 'id_categoria'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.pointerEvents = 'none';
            el.style.backgroundColor = '#f8f9fa';
        }
    });
}
function desbloquearEntrada() {
    document.getElementById('descripcion').readOnly = false;
    document.getElementById('adscripcion').readOnly = false;
    ['unidad', 'estado', 'id_categoria'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.pointerEvents = 'auto';
            el.style.backgroundColor = '';
        }
    });
}
function limpiarCamposEntrada() {
    ['descripcion', 'cantidad', 'unidad', 'estado', 'id_categoria', 'adscripcion']
        .forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
}

function filtrarMaterialesModalEntrada(texto) {
    const filtro = (texto || '').toUpperCase();
    document.querySelectorAll('#contenedor-materiales-modal table tbody tr').forEach(tr => {
        const [folio, descripcion] = [tr.children[0], tr.children[1]].map(td => (td?.textContent || '').toUpperCase());
        tr.style.display = (folio.includes(filtro) || descripcion.includes(filtro)) ? '' : 'none';
    });
}