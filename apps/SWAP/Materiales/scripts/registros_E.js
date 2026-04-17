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

// Autocompletar al escribir folio manualmente en el formulario principal
const folioInput = document.getElementById('folio');
// Función para validar formato de folio
function folioValido(folio) {
    return /^MA-\d{8}$/.test(folio);
}

// Autocompletar al salir del campo (blur)
folioInput.addEventListener('blur', function() {
    const folio = this.value.trim();
    if (folioValido(folio)) {
        autocompletarFormulario(folio);
    }
});

// Autocompletar al escribir si el formato es válido
folioInput.addEventListener('input', function() {
    const folio = this.value.trim();
    if (folioValido(folio)) {
        autocompletarFormulario(folio);
    }
});


async function mostrarModal() {
    const url = 'query_sql/modales_datos.php';
    try {
        const response = await fetch(url);
        const resultado = await response.json();
        console.log('Respuesta modal:', resultado);

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
                            <button class="btn btn-primary btn-sm" onclick="autocompletarFormulario('${reg.folio_material}')">Seleccionar</button>
                        </td>
                    </tr>
                `;
            });
            tabla += `
                    </tbody>
                </table>
            `;
        }

        document.getElementById('contenedor-materiales-modal').innerHTML = tabla;
        var modal = new bootstrap.Modal(document.getElementById('exampleModalCenter'));
        modal.show();
    } catch (error) {
        console.error('Error en mostrarModal:', error);
        document.getElementById('contenedor-materiales-modal').innerHTML = '<p>Error al cargar los registros.</p>';
        var modal = new bootstrap.Modal(document.getElementById('exampleModalCenter'));
        modal.show();
    }
}

function seleccionarRegistro(folio, descripcion) {
    document.getElementById('folio').value = folio;
    document.getElementById('descripcion').value = descripcion;
    var modal = bootstrap.Modal.getInstance(document.getElementById('exampleModalCenter'));
    if (modal) modal.hide();
}

async function registrar(EnviarDAtos) {
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
                title: "¡El Material fue guardado con éxito!",
                icon: "success",
                confirmButtonText: "Aceptar",
                draggable: true
            });
            document.getElementById('form-entrada-material').reset();
        } else {
            Swal.fire({
                title: "Error",
                text: "No se pudo guardar el material.",
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

async function autocompletarFormulario(folio) {
    try {
        const response = await fetch(`query_sql/Autocompletar.php?folio=${encodeURIComponent(folio)}`);
        const result = await response.json();
        if (result.status === 'ok' && result.datos) {
            const d = result.datos;
            document.getElementById('folio').value = d.folio_material || '';
            document.getElementById('descripcion').value = d.descripcion_material_entrada || '';
            document.getElementById('cantidad').value = d.cantidad_material_entrada || '';
            document.getElementById('adscripcion').value = d.adscripcion_modulo || '';
            document.getElementById('estado').value = d.id_estado_material_entrada || '';
            document.getElementById('unidad').value = d.id_unidad_material || '';
            document.getElementById('id_categoria').value = d.id_categoria_material || '';
            // Bloquear campos solo si hay datos
            bloquearCamposMaterial(true);
            // Cierra el modal si está abierto
            var modal = bootstrap.Modal.getInstance(document.getElementById('exampleModalCenter'));
            if (modal) modal.hide();
        } else {
            limpiarFormularioMaterial();
            bloquearCamposMaterial(false);
            mostrarCampoFolio(false); // <-- Esto es lo importante
            Swal.fire({
                icon: 'warning',
                title: 'No encontrado',
                text: 'No se encontró información para el folio ingresado.',
                confirmButtonText: 'Aceptar'
            });
        }
    } catch (error) {
        limpiarFormularioMaterial();
        bloquearCamposMaterial(false);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al autocompletar el formulario.',
            confirmButtonText: 'Aceptar'
        });
    }
}

// Bloquear o desbloquear campos del formulario de materiales
function bloquearCamposMaterial(bloquear) {
    document.getElementById('folio').readOnly = bloquear;
    document.getElementById('descripcion').readOnly = bloquear;
    document.getElementById('cantidad').readOnly = bloquear;
    document.getElementById('adscripcion').disabled = bloquear;
    document.getElementById('estado').disabled = bloquear;
    document.getElementById('unidad').disabled = bloquear;
    document.getElementById('id_categoria').disabled = bloquear;
}


function mostrarCampoFolio(mostrar) {
    const folioDiv = document.getElementById('folio').closest('.col-md-3');
    let aviso = document.getElementById('aviso-folio-auto');
    if (!aviso) {
        aviso = document.createElement('div');
        aviso.id = 'aviso-folio-auto';
        aviso.className = 'alert alert-info mt-2';
        aviso.innerText = 'El código se generará automáticamente al guardar la información.';
        folioDiv.parentNode.insertBefore(aviso, folioDiv.nextSibling);
    }
    folioDiv.style.display = mostrar ? '' : 'none';
    aviso.style.display = mostrar ? 'none' : '';
}

function limpiarFormularioMaterial() {
    document.getElementById('descripcion').value = '';
    document.getElementById('cantidad').value = '';
    document.getElementById('adscripcion').value = '';
    document.getElementById('estado').value = '';
    document.getElementById('unidad').value = '';
    document.getElementById('id_categoria').value = '';
    bloquearCamposMaterial(false);
}


document.getElementById('btn-consultar-entradas').addEventListener('click', mostrarRegistrosEntradas);

document.getElementById('form-entrada-material').addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!this.checkValidity()) {
        Swal.fire({
            title: "¡Campos incompletos!",
            text: "Por favor, llena todos los campos obligatorios.",
            icon: "warning",
            confirmButtonText: "Aceptar",
            draggable: true
        });
        document.getElementById('form-entrada-material').reset();
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
        title: "¿Deseas guardar el registro de entrada?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Guardar",
        denyButtonText: "No guardar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
        
            const folioDiv = document.getElementById('folio').closest('.col-md-3');
            if (folioDiv.style.display === 'none') {
                datos.set('descripcion_material_entrada', datos.get('descripcion'));
                datos.set('id_unidad_material', datos.get('unidad'));
                datos.set('id_categoria_material', datos.get('id_categoria'));
                datos.set('id_estado_material_entrada', datos.get('estado'));
                datos.set('cantidad_material_entrada', datos.get('cantidad'));
                datos.set('adscripcion_modulo', datos.get('adscripcion'));
                datos.delete('descripcion');
                datos.delete('unidad');
                datos.delete('id_categoria');
                datos.delete('estado');
                datos.delete('cantidad');
                datos.delete('adscripcion');
                datos.delete('folio');
            }
            registrar(datos);
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

document.getElementById('modal').addEventListener('click', mostrarModal);