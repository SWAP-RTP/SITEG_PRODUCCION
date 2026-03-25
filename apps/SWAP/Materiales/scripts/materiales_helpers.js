// Funciones reutilizables para formularios de entrada y salida de materiales

// Llenar un select con datos de un endpoint
function llenarSelect(selectElement, url, campoValue, campoText) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            selectElement.innerHTML = '';
            const opcionDefault = document.createElement('option');
            opcionDefault.value = '';
            opcionDefault.textContent = 'Seleccione...';
            selectElement.appendChild(opcionDefault);
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item[campoValue];
                option.textContent = item[campoText];
                selectElement.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Debounce para evitar llamadas excesivas
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Mostrar alerta de campos incompletos
function mostrarAlertaCampos() {
    Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, llena todos los campos obligatorios.',
        confirmButtonColor: '#3085d6'
    });
}

// Mostrar alerta de error
function mostrarAlertaError(mensaje) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: mensaje || 'Ocurrió un error inesperado.',
        confirmButtonColor: '#d33'
    });
}

// Mostrar alerta de éxito
function mostrarAlertaExito(mensaje) {
    Swal.fire('¡Éxito!', mensaje || 'Operación realizada correctamente.', 'success');
}
// mostrar la tabla del modal de salida
function mostrarTablaModal(contenedor, datos, columnas, onSelect) {
    if (!Array.isArray(datos) || datos.length === 0) {
        contenedor.innerHTML = '<p>No hay resultados.</p>';
        return;
    }
    // Generar un id único para la tabla
    const tablaId = 'tabla-modal-' + Math.random().toString(36).substr(2, 9);
    let html = `<table id="${tablaId}" class="table table-striped table-bordered"><thead><tr>`;
    columnas.forEach(col => {
        html += `<th>${col.header}</th>`;
    });
    html += `<th>Acción</th></tr></thead><tbody>`;
    datos.forEach(item => {
        html += `<tr>`;
        columnas.forEach(col => {
            html += `<td>${item[col.key]}</td>`;
        });
        html += `<td>
            <button type="button" class="btn btn-success btn-sm seleccionar-modal"
                data-item='${JSON.stringify(item)}'>
                <i class="bi bi-plus-circle"></i> Seleccionar
            </button>
        </td></tr>`;
    });
    html += `</tbody></table>`;
    contenedor.innerHTML = html;

    // Inicializar DataTables si está disponible y destruir si ya existe
    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.DataTable) {
        setTimeout(() => {
            const $tabla = window.jQuery(`#${tablaId}`);
            if ($tabla.hasClass('dataTable')) {
                $tabla.DataTable().destroy();
            }
            $tabla.DataTable({
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
                },
                pageLength: 100,
                lengthMenu: [5, 10, 25, 50, 100],
                dom: 'lfrtip', 
                responsive: true,
                classes: {
                    sPaging: 'pagination justify-content-center',
                    sPageButton: 'page-link',
                    sPageButtonActive: 'active',
                    sPageButtonDisabled: 'disabled',
                }
            });
        }, 0);
    }

    contenedor.querySelectorAll('.seleccionar-modal').forEach(btn => {
        btn.addEventListener('click', function () {
            const item = JSON.parse(this.getAttribute('data-item'));
            onSelect(item);
        });
    });
}

