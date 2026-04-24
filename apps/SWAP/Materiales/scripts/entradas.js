import { cargarCatalogos } from './core/catalogosService.js';
import { ModalService } from './core/modalService.js';
import { MaterialesService } from './core/materialesService.js';


document.addEventListener('DOMContentLoaded', async () => {

    await cargarCatalogos();

    eventos();
});

function eventos() {

    //  ESCRIBIR FOLIO
    document.getElementById('folio').addEventListener('change', (e) => {
        cargarMaterial(e.target.value);
    });

    //  MODAL
    document.getElementById('modal-material-entrada').addEventListener('click', () => {
        ModalService.abrir({
            modalId: 'exampleModalCenter',
            contenedorId: 'contenedor-materiales-modal',
            callback: (folio) => {
                document.getElementById('folio').value = folio;
                cargarMaterial(folio);
            }
        });
    });

    // consultar registros
    document.getElementById('btn-consultar-entradas')
        .addEventListener('click', cargarRegistros);
}
// FUNCION PARA BLOQUEAR CAMPOS
function bloquearEntrada() {

    // inputs normales
    document.getElementById('descripcion').readOnly = true;
    document.getElementById('cantidad').readOnly = true;
    document.getElementById('adscripcion').readOnly = true;

    // selects 
    const selects = ['unidad', 'estado', 'id_categoria'];

    selects.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.pointerEvents = 'none';
            el.style.backgroundColor = '#e9ecef';
        }
    });
}
// FUNCIÓN CENTRAL
async function cargarMaterial(folio) {
    let materialExiste = false;

    if (!folio) return;

    const result = await MaterialesService.buscarPorFolio(folio);

    // 
    if (result.status !== 'ok' || !result.datos) {

        console.log('Material nuevo');

        materialExiste = false;

        desbloquearEntradaCompleta();
        limpiarCampos();

        return;
    }

    const d = result.datos;

    materialExiste = true;

    document.getElementById('descripcion').value = d.descripcion_material;
    document.getElementById('unidad').value = d.id_unidad_material || '';
    document.getElementById('estado').value = d.id_estado_material || '';
    document.getElementById('id_categoria').value = d.id_categoria_material || '';
    document.getElementById('adscripcion').value = d.adscripcion_modulo || '';

    bloquearSoloCatalogo();

    //
    document.getElementById('cantidad').readOnly = false;
    document.getElementById('cantidad').value = '';
}
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

function limpiarCampos() {
    document.getElementById('descripcion').value = '';
    document.getElementById('cantidad').value = '';
    document.getElementById('unidad').value = '';
    document.getElementById('estado').value = '';
    document.getElementById('id_categoria').value = '';
    document.getElementById('adscripcion').value = '';
}

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
//FUNCION PARA GUARDAR ENTRADA
document.getElementById('form-entrada-material').addEventListener('submit', guardarEntrada);
async function guardarEntrada(e) {

    e.preventDefault();

    const data = {
        folio: document.getElementById('folio').value,
        descripcion: document.getElementById('descripcion').value,
        unidad: document.getElementById('unidad').value,
        estado: document.getElementById('estado').value,
        id_categoria: document.getElementById('id_categoria').value,
        adscripcion: document.getElementById('adscripcion').value,
        cantidad: document.getElementById('cantidad').value
    };

    // console.log('DATA A ENVIAR:', data); 

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
        Swal.fire('Error', result.message, 'error');
    }
}