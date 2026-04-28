import { cargarCatalogos } from './core/catalogosService.js';
import { ModalService } from './core/modalService.js';
import { MaterialesService } from './core/materialesService.js';

document.addEventListener('DOMContentLoaded', async () => {
    await cargarCatalogos();
    eventos();
});

function eventos() {

    const folioInput = document.getElementById('folio');

    /* =========================
       FORZAR MAYÚSCULAS GLOBAL
    ========================= */
    ['folio', 'descripcion', 'adscripcion'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => {
                input.value = input.value.toUpperCase();
            });
        }
    });

    /* =========================
       ESCRIBIR FOLIO
    ========================= */
    folioInput.addEventListener('input', (e) => {
        const valor = e.target.value.toUpperCase();
        e.target.value = valor;
        cargarMaterial(valor);
    });

    /* =========================
       MODAL
    ========================= */
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

    /* =========================
       BUSCAR EN MODAL
    ========================= */
    const inputBuscar = document.getElementById('buscar-material-modal-entrada');

    if (inputBuscar) {
        inputBuscar.addEventListener('input', () => {
            inputBuscar.value = inputBuscar.value.toUpperCase();
            filtrarMaterialesModal(inputBuscar.value);
        });
    }

    /* =========================
       CONSULTAR REGISTROS
    ========================= */
    document.getElementById('btn-consultar-entradas')
        .addEventListener('click', cargarRegistros);

    /* =========================
       LIMPIAR
    ========================= */
    document.getElementById('btn-limpiar-entrada').addEventListener('click', () => {

        document.getElementById('folio').value = '';
        limpiarCampos();

        document.getElementById('contenedor-tabla-registros').style.display = 'none';

        desbloquearEntrada();

        console.log("Formulario de entrada limpio");
    });
}

/* =========================
   BLOQUEAR CAMPOS
========================= */
function bloquearEntrada() {

    document.getElementById('descripcion').readOnly = true;
    document.getElementById('cantidad').readOnly = true;
    document.getElementById('adscripcion').readOnly = true;

    ['unidad', 'estado', 'id_categoria'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.pointerEvents = 'none';
            el.style.backgroundColor = '#e9ecef';
        }
    });
}

/* =========================
   DESBLOQUEAR CAMPOS
========================= */
function desbloquearEntrada() {

    document.getElementById('descripcion').readOnly = false;
    document.getElementById('cantidad').readOnly = false;
    document.getElementById('adscripcion').readOnly = false;

    ['unidad', 'estado', 'id_categoria'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.pointerEvents = 'auto';
            el.style.backgroundColor = '';
        }
    });
}

/* =========================
   LIMPIAR CAMPOS
========================= */
function limpiarCampos() {
    document.getElementById('descripcion').value = '';
    document.getElementById('cantidad').value = '';
    document.getElementById('unidad').value = '';
    document.getElementById('estado').value = '';
    document.getElementById('id_categoria').value = '';
    document.getElementById('adscripcion').value = '';
}

/* =========================
   CARGAR MATERIAL
========================= */
async function cargarMaterial(folio) {

    if (!folio) return;

    const result = await MaterialesService.buscarPorFolio(folio);

    if (result.status !== 'ok' || !result.datos) {

        console.log('Material nuevo');

        desbloquearEntrada();
        limpiarCampos();

        return;
    }

    const d = result.datos;

    document.getElementById('descripcion').value =
        (d.descripcion_material || '').toUpperCase();

    document.getElementById('unidad').value = d.id_unidad_material || '';
    document.getElementById('estado').value = d.id_estado_material || '';
    document.getElementById('id_categoria').value = d.id_categoria_material || '';

    document.getElementById('adscripcion').value =
        (d.adscripcion_modulo || '').toUpperCase();

    bloquearEntrada();

    document.getElementById('cantidad').readOnly = false;
    document.getElementById('cantidad').value = '';
}

/* =========================
   FILTRAR MODAL
========================= */
function filtrarMaterialesModal(texto) {

    const filtro = texto.toUpperCase();

    const filas = document.querySelectorAll('#contenedor-materiales-modal table tbody tr');

    filas.forEach(tr => {

        const folio = tr.children[0]?.textContent.toUpperCase() || '';
        const descripcion = tr.children[1]?.textContent.toUpperCase() || '';

        tr.style.display =
            (folio.includes(filtro) || descripcion.includes(filtro))
                ? ''
                : 'none';
    });
}

/* =========================
   CONSULTAR REGISTROS
========================= */
async function cargarRegistros() {

    const res = await fetch('query_sql/consultas_materiales.php?tipo=entradas');
    const result = await res.json();

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
}

/* =========================
   GUARDAR ENTRADA
========================= */
document.getElementById('form-entrada-material')
    .addEventListener('submit', guardarEntrada);

async function guardarEntrada(e) {

    e.preventDefault();

    const data = {
        folio: document.getElementById('folio').value.toUpperCase(),
        descripcion: document.getElementById('descripcion').value.toUpperCase(),
        unidad: document.getElementById('unidad').value,
        estado: document.getElementById('estado').value,
        id_categoria: document.getElementById('id_categoria').value,
        adscripcion: document.getElementById('adscripcion').value.toUpperCase(),
        cantidad: document.getElementById('cantidad').value
    };

    const res = await fetch('query_sql/materiales_guardados.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.status === 'ok') {
        Swal.fire('Éxito', result.message, 'success');
        document.getElementById('form-entrada-material').reset();
    } else {
        Swal.fire('¡Atención!', 'Datos incompletos', 'warning');
    }
}