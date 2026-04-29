import { cargarCatalogos } from './core/catalogosService.js';
import { ModalService } from './core/modalService.js';
import { MaterialesService } from './core/materialesService.js';

document.addEventListener('DOMContentLoaded', async () => {
    await cargarCatalogos();
    eventos();
    prepararVistaNuevoRegistro();
});


function eventos() {
    const folioInput = document.getElementById('folio');
    let timeoutBusqueda = null;

    if (folioInput) {
        folioInput.readOnly = false;
        folioInput.placeholder = "Ingrese código...";

        
        folioInput.addEventListener('input', () => {
            const folioValue = folioInput.value.trim().toUpperCase();
            
            // 1. Limpiamos el temporizador cada que el usuario presiona una tecla
            clearTimeout(timeoutBusqueda);

            // 2. Si el campo está vacío, reseteamos la vista
            if (!folioValue) {
                prepararVistaNuevoRegistro();
                return;
            }

            // 3. Esperamos 500ms después de la última tecla para buscar (Debounce)
            // Esto evita que el sistema sature el servidor con cada letra
            timeoutBusqueda = setTimeout(async () => {
                
                // Si el folio cumple con tu longitud estándar (ej. 11 caracteres para MA-00000012)
                // O simplemente buscamos lo que el usuario haya escrito
                const result = await MaterialesService.buscarPorFolio(folioValue);

                if (result.status === 'ok' && result.datos) {
                    // SI EXISTE: Carga automática inmediata
                    cargarMaterial(folioValue);
                } else {
                    /* NOTA: Aquí no lanzamos el SweetAlert en cada error porque interrumpiría 
                       al usuario mientras escribe. Solo dejamos que los campos sigan libres.
                    */
                    document.getElementById('estado-material').style.display = 'none';
                    desbloquearEntrada();
                }
            }, 500); 
        });

        // Mantenemos el blur solo como respaldo final
        folioInput.addEventListener('blur', async () => {
            const folioValue = folioInput.value.trim().toUpperCase();
            if (folioValue) {
                const result = await MaterialesService.buscarPorFolio(folioValue);
                if (result.status !== 'ok' || !result.datos) {
                    // Si al salir el folio no existe, ahora sí avisamos
                    Swal.fire({
                        icon: 'info',
                        title: 'Código no registrado',
                        text: `El código "${folioValue}" no existe. Complete los campos para registrarlo.`,
                        confirmButtonText: 'Entendido'
                    });
                    folioInput.value = '';
                    prepararVistaNuevoRegistro();
                }
            }
        });
    }

    /* Forzar Mayúsculas en Descripción y Adscripción */
    ['descripcion', 'adscripcion'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => {
                input.value = input.value.toUpperCase();
            });
        }
    });

    /* Lupa de búsqueda (Modal) */
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
        document.getElementById('form-entrada-material').reset();
        document.getElementById('contenedor-tabla-registros').style.display = 'none';
        prepararVistaNuevoRegistro();
    });

    document.getElementById('form-entrada-material').addEventListener('submit', guardarEntrada);
}
function prepararVistaNuevoRegistro() {
    const folioInput = document.getElementById('folio');
    const estado = document.getElementById('estado-material');
    
    estado.style.display = 'none'; 
    
    desbloquearEntrada();
    limpiarCampos();
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
        Swal.fire('Atención', 'Ingrese una cantidad válida', 'warning');
        return;
    }

    Swal.fire({ title: 'Procesando registro...', didOpen: () => { Swal.showLoading() } });

    let folioParaGuardar = document.getElementById('folio').value.trim();

    if (folioParaGuardar === "") {
        try {
            const folioRes = await fetch('query_sql/generar_folio.php');
            const folioData = await folioRes.json();
            if (folioData.status === 'ok') {
                folioParaGuardar = folioData.folio;
            } else {
                throw new Error("Error obteniendo folio");
            }
        } catch (err) {
            Swal.fire('Error', 'No se pudo generar el folio automático', 'error');
            return;
        }
    }

    const data = {
        folio: folioParaGuardar,
        descripcion: document.getElementById('descripcion').value,
        unidad: document.getElementById('unidad').value,
        estado: document.getElementById('estado').value,
        id_categoria: document.getElementById('id_categoria').value,
        adscripcion: document.getElementById('adscripcion').value,
        cantidad: cantidad
    };

    try {
        const res = await fetch('query_sql/materiales_guardados.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();
if (result.status === 'ok') {

    await Swal.fire('Éxito', `Registro completado. Folio: ${folioParaGuardar}`, 'success');


    const formulario = document.getElementById('form-entrada-material');
    formulario.reset();
    if (confirm('¿Deseas realizar otro registro?')) {
        prepararVistaNuevoRegistro();
        document.getElementById('folio').focus(); 
    }
}
      
    } catch (error) {
        Swal.fire('Error', 'Error de comunicación', 'error');
    }
}
async function cargarRegistros() {
    try {
        const res = await fetch('query_sql/consultas_materiales.php?tipo=entradas');
        const result = await res.json();
        if (result.status !== 'ok') return;

        const tbody = document.getElementById('tabla-registros');
        tbody.innerHTML = '';

        result.datos.forEach(r => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${r.folio_material}</td><td>${r.descripcion_material_entrada}</td><td>${r.unidad}</td><td>${r.estado}</td><td>${r.cantidad}</td><td>${r.fecha_registro}</td>`;
            tbody.appendChild(tr);
        });
        document.getElementById('contenedor-tabla-registros').style.display = 'block';
    } catch (e) { console.error(e); }
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
function limpiarCampos() {
    document.getElementById('descripcion').value = '';
    document.getElementById('cantidad').value = '';
    document.getElementById('unidad').value = '';
    document.getElementById('estado').value = '';
    document.getElementById('id_categoria').value = '';
    document.getElementById('adscripcion').value = '';
}