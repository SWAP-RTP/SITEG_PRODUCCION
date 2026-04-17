async function cargarCatalogos() {
    try {
        const response = await fetch('query_sql/catalogo_listas.php');
        if (!response.ok) throw new Error('Error al obtener catálogos');
        const data = await response.json();

        // Unidad de Medida
        const unidadSelect = document.getElementById('unidad');
        unidadSelect.innerHTML = '<option value="" selected disabled>Selecciona una unidad</option>';
        data.unidades.forEach(u => {
            unidadSelect.innerHTML += `<option value="${u.id_unidad_material}">${u.descripcion_unidad_material}</option>`;
        });

        // Estado Físico Material
        const estadoSelect = document.getElementById('estado');
        estadoSelect.innerHTML = '<option value="" selected disabled>Selecciona un estado</option>';
        data.estados.forEach(e => {
            estadoSelect.innerHTML += `<option value="${e.id_estado_material}">${e.descripcion_estado_material}</option>`;
        });

        // Categoría
        const categoriaSelect = document.getElementById('id_categoria');
        categoriaSelect.innerHTML = '<option value="" selected disabled>Selecciona una categoría</option>';
        data.categorias.forEach(c => {
            categoriaSelect.innerHTML += `<option value="${c.id_categoria_material}">${c.descripcion_categoria_material}</option>`;
        });

    } catch (error) {
        // Si hay error, muestra mensaje en los selects
        ['unidad', 'estado', 'id_categoria'].forEach(id => {
            const select = document.getElementById(id);
            if (select) select.innerHTML = '<option value="">Error al cargar</option>';
        });
    }
}

// Llama cargarCatalogos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    cargarCatalogos();
});

// Autocompletar al escribir fsiolio manualmente en el formulario de salida
const fsiolioInput = document.getElementById('fsiolio');
function fsiolioValido(fsiolio) {
    return /^MA-\d{8}$/.test(fsiolio);
}

if (fsiolioInput) {
    fsiolioInput.addEventListener('blur', function() {
        const fsiolio = this.value.trim();
        if (fsiolioValido(fsiolio)) {
            autocompletarFormularioSalida(fsiolio);
        }
    });
    fsiolioInput.addEventListener('input', function() {
        const fsiolio = this.value.trim();
        if (fsiolioValido(fsiolio)) {
            autocompletarFormularioSalida(fsiolio);
        }
    });
}


async function mostrarModalSalida() {
    const url = 'query_sql/modales_datos.php';
    try {
        const response = await fetch(url);
        const resultado = await response.json();
        let tabla = '';
        if (!resultado.datos || resultado.datos.length === 0) {
            tabla = '<p>No hay registros.</p>';
        } else {
            tabla = `
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Folio</th>
                            <th>Descripción</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            resultado.datos.forEach(reg => {
                tabla += `
                    <tr>
                        <td>${reg.folio_material || ''}</td>
                        <td>${reg.descripcion_material_entrada || ''}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="autocompletarFormularioSalida('${reg.folio_material}')">Seleccionar</button>
                        </td>
                    </tr>
                `;
            });
            tabla += `
                    </tbody>
                </table>
            `;
        }
        document.getElementById('contenedor-materiales-modal-salida').innerHTML = tabla;
        var modal = new bootstrap.Modal(document.getElementById('modalMaterial'));
        modal.show();
    } catch (error) {
        document.getElementById('contenedor-materiales-modal-salida').innerHTML = '<p>Error al cargar los registros.</p>';
        var modal = new bootstrap.Modal(document.getElementById('modalMaterial'));
        modal.show();
    }
}

function seleccionarRegistroSalida(fsiolio, descripcion) {
    document.getElementById('fsiolio').value = fsiolio;
    document.getElementById('descripcion').value = descripcion;
    var modal = bootstrap.Modal.getInstance(document.getElementById('modalMaterial'));
    if (modal) modal.hide();
}

async function registrarSalida(EnviarDAtos) {
    try {
        // Conviertir FormData a objeto plano
        const plainData = Object.fromEntries(EnviarDAtos.entries());
        const response = await fetch('query_sql/materiales_guardados.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(plainData)
        });

        if (response.ok) {
            const data = await response.json();
            Swal.fire({
                title: "¡La salida fue registrada con éxito!",
                icon: "success",
                confirmButtonText: "Aceptar",
                draggable: true
            });
            document.getElementById('form-salida-material').reset();
        } else {
            Swal.fire({
                title: "Error",
                text: "No se pudo registrar la salida.",
                icon: "error",
                confirmButtonText: "Aceptar"
            });
        }
    } catch (error) {
        Swal.fire({
            title: "Error",
            text: "Ocurrió un error en la petición.",
            icon: "error",
            confirmButtonText: "Aceptar"
        });
    }
}

async function mostrarRegistrosEntradas() {
    try {
        const response = await fetch('query_sql/consultas_materiales.php?tipo=entradas');
        const resultado = await response.json();

        if (!resultado.datos || resultado.datos.length === 0) {
            document.getElementById('tabla-registros').innerHTML = '<tr><td colspan="6" class="text-center">No hay registros.</td></tr>';
            document.getElementById('contenedor-tabla-registros').style.display = 'block';
            return;
        }

        let filas = '';
        resultado.datos.forEach(reg => {
            filas += `
                <tr>
                    <td>${reg.folio_material || ''}</td>
                    <td>${reg.descripcion_material_entrada || ''}</td>
                    <td>${reg.descripcion_unidad_material || ''}</td>
                    <td>${reg.descripcion_estado_material || ''}</td>
                    <td>${reg.cantidad_material_entrada || ''}</td>
                    <td>${reg.fecha_registro_entrada || ''}</td>
                </tr>
            `;
        });

        document.getElementById('tabla-registros').innerHTML = filas;
        document.getElementById('contenedor-tabla-registros').style.display = 'block';
    } catch (error) {
        document.getElementById('tabla-registros').innerHTML = '<tr><td colspan="6" class="text-center">Error al cargar los registros.</td></tr>';
        document.getElementById('contenedor-tabla-registros').style.display = 'block';
    }
}

async function autocompletarFormularioSalida(fsiolio) {
    try {
        const response = await fetch(`query_sql/Autocompletar.php?folio=${encodeURIComponent(fsiolio)}`);
        const result = await response.json();
        if (result.status === 'ok' && result.datos) {
            const d = result.datos;
            document.getElementById('fsiolio').value = d.folio_material || '';
            document.getElementById('descripcion').value = d.descripcion_material_entrada || '';
            document.getElementById('cantidad').value = d.cantidad_material_entrada || '';
            document.getElementById('adscripcion').value = d.adscripcion_modulo || '';
            document.getElementById('estado').value = d.id_estado_material_entrada || '';
            document.getElementById('unidad').value = d.id_unidad_material || '';
            document.getElementById('id_categoria').value = d.id_categoria_material || '';
            bloquearCamposMaterialSalida(true);
            var modal = bootstrap.Modal.getInstance(document.getElementById('modalMaterial'));
            if (modal) modal.hide();
        } else {
            limpiarFormularioMaterialSalida();
            bloquearCamposMaterialSalida(false);
            mostrarCampoFsiolio(false);
            Swal.fire({
                icon: 'warning',
                title: 'No encontrado',
                text: 'No se encontró información para el código ingresado.',
                confirmButtonText: 'Aceptar'
            });
        }
    } catch (error) {
        limpiarFormularioMaterialSalida();
        bloquearCamposMaterialSalida(false);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al autocompletar el formulario.',
            confirmButtonText: 'Aceptar'
        });
    }
}

// Bloquear o desbloquear campos del formulario de salida
function bloquearCamposMaterialSalida(bloquear) {
    document.getElementById('fsiolio').readOnly = bloquear;
    document.getElementById('descripcion').readOnly = bloquear;
    document.getElementById('cantidad').readOnly = bloquear;
    document.getElementById('adscripcion').disabled = bloquear;
    document.getElementById('estado').disabled = bloquear;
    document.getElementById('unidad').disabled = bloquear;
    document.getElementById('id_categoria').disabled = bloquear;
}


function mostrarCampoFsiolio(mostrar) {
    const fsiolioDiv = document.getElementById('fsiolio').closest('.col-md-3');
    let aviso = document.getElementById('aviso-fsiolio-auto');
    if (!aviso) {
        aviso = document.createElement('div');
        aviso.id = 'aviso-fsiolio-auto';
        aviso.className = 'alert alert-info mt-2';
        aviso.innerText = 'El código se generará automáticamente al guardar la información.';
        fsiolioDiv.parentNode.insertBefore(aviso, fsiolioDiv.nextSibling);
    }
    fsiolioDiv.style.display = mostrar ? '' : 'none';
    aviso.style.display = mostrar ? 'none' : '';
}

function limpiarFormularioMaterialSalida() {
    document.getElementById('descripcion').value = '';
    document.getElementById('cantidad').value = '';
    document.getElementById('adscripcion').value = '';
    document.getElementById('estado').value = '';
    document.getElementById('unidad').value = '';
    document.getElementById('id_categoria').value = '';
    bloquearCamposMaterialSalida(false);
}


// Eliminado: no debe haber eventListener para form-entrada-material en registros_S.js

document.getElementById('form-salida-material').addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!this.checkValidity()) {
        Swal.fire({
            title: "¡Campos incompletos!",
            text: "Por favor, llena todos los campos obligatorios.",
            icon: "warning",
            confirmButtonText: "Aceptar",
            draggable: true
        });
        document.getElementById('form-salida-material').reset();
        return;
    }

    const datos = new FormData(this);

    if (datos.get('cantidad') < 1) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "La cantidad debe ser mayor a 0!"
        });
        return;
    }

    Swal.fire({
        title: "¿Deseas guardar el registro de salida?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Guardar",
        denyButtonText: "No guardar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            const fsiolioDiv = document.getElementById('fsiolio').closest('.col-md-3');
            if (fsiolioDiv.style.display === 'none') {
                datos.set('descripcion_material_salida', datos.get('descripcion'));
                datos.set('id_unidad_material', datos.get('unidad'));
                datos.set('id_categoria_material', datos.get('id_categoria'));
                datos.set('id_estado_material_salida', datos.get('estado'));
                datos.set('cantidad_material_salida', datos.get('cantidad'));
                datos.set('adscripcion_modulo', datos.get('adscripcion'));
                datos.delete('descripcion');
                datos.delete('unidad');
                datos.delete('id_categoria');
                datos.delete('estado');
                datos.delete('cantidad');
                datos.delete('adscripcion');
                datos.delete('fsiolio');
            }
            registrarSalida(datos);
        } else if (result.isDenied) {
            Swal.fire({
                title: "Registro cancelado",
                text: "No se guardó el registro.",
                icon: "info",
                confirmButtonText: "Aceptar"
            });
        }
    });
});

const btnModalMaterial = document.getElementById('modal-material');
if (btnModalMaterial) {
    btnModalMaterial.addEventListener('click', function(e) {
        e.preventDefault();
        mostrarModalSalida();
    });
}