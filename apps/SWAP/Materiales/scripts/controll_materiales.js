/* ============================================================
    ARCHIVO: CONTROL DE MATERIALES (REGISTRO) 
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    const refs = {
        formulario: document.querySelector('#form-materiales'),
        reporte: document.querySelector('#contenedor-reporte'),
        tablaBody: document.querySelector('#tabla-existencias'),
        cargando: document.querySelector('#mensaje-carga'),
        inputCredencial: document.querySelector('#id_credencial'),
        inputNombre: document.querySelector('#nombre_trabajador'),
        btnConsulta: document.querySelector('#btn_consulta'),
        btnLimpiar: document.querySelector('#btn_limpiar')
    };

    // --- MAYÚSCULAS REAL-TIME ---
    document.querySelectorAll('input[type="text"], textarea').forEach(input => {
        input.addEventListener('input', (e) => {
            const start = e.target.selectionStart;
            e.target.value = e.target.value.toUpperCase();
            e.target.setSelectionRange(start, start);
        });
    });

    // --- FUNCIÓN GLOBAL: CARGAR REGISTROS ---
    // La exponemos a window para que el script de inventario pueda llamarla
    window.cargarRegistros = async (mostrarTabla = false) => {
        try {
            const resp = await fetch('query_sql/obtener_registros.php');
            const text = await resp.text();
            
            console.log('Respuesta cruda del servidor:', text); 

            let resultado;
            try {
                resultado = JSON.parse(text);
            } catch (e) {
                console.error("Error al parsear JSON:", text);
                return mostrarToast("Error en el formato de datos del servidor", "bg-danger");
            }

            if (resultado.status === 'success' && resultado.data) {
                // Control de visibilidad del contenedor de la tabla
                if (mostrarTabla) {
                    refs.reporte.classList.remove('d-none');
                    refs.reporte.scrollIntoView({ behavior: 'smooth' });
                }

                if (resultado.data.length === 0) {
                    refs.tablaBody.innerHTML = `<tr><td colspan="6" class="p-4 text-muted">No se encontraron registros recientes</td></tr>`;
                    return;
                }

                refs.tablaBody.innerHTML = resultado.data.map(reg => {
                    const fechaLimpia = (reg.fecha_registro_material || '').split('.')[0].replace('T', ' ');
                    return `
                        <tr>
                            <td><span class="badge bg-dark">${reg.codigo_material || 'N/A'}</span></td>
                            <td class="text-start small fw-bold">${reg.descripcion_material || 'S/D'}</td>
                            <td class="text-start small">
                                <i class="fa-solid fa-user-check me-2 text-primary opacity-75"></i>
                                ${reg.nombre_recibio || 'ANÓNIMO'}
                            </td>
                            <td class="fw-bold text-primary">${reg.cantidad_salida_material || '0'}</td>
                            <td class="text-muted small">${fechaLimpia}</td> 
                            <td>
                                <span class="badge rounded-pill bg-success-subtle text-success border border-success-subtle" style="font-size: 0.65rem;">
                                    REGISTRADO
                                </span>
                            </td>
                        </tr>`;
                }).join('');
            } else {
                mostrarToast(resultado.message || "Error al obtener datos", "bg-warning");
            }
        } catch (err) { 
            console.error("Error crítico en bitácora:", err);
            mostrarToast("Error de conexión al obtener historial", "bg-danger");
        }
    };

    // --- FUNCIÓN: GUARDAR NUEO REGISTRO ---
    refs.formulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnGuardar = document.querySelector('#btn_alta');
        const fechaRegistro = document.getElementById('fecha_registro');

        if (!fechaRegistro?.value) return mostrarToast('Ingresa fecha y hora.', 'bg-danger');

        const datos = Object.fromEntries(new FormData(refs.formulario));
        // Limpieza y mayúsculas
        Object.keys(datos).forEach(k => {
            if(typeof datos[k] === 'string') datos[k] = datos[k].toUpperCase().trim();
        });

        refs.cargando.classList.remove('d-none');
        btnGuardar.disabled = true;

        try {
            const resp = await fetch('query_sql/insertar_material.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            const res = await resp.json();

            if (res.status === 'success') {
                mostrarToast(res.message, 'bg-success');
                refs.formulario.reset();
                refs.inputNombre.readOnly = false;
                refs.inputNombre.classList.remove('bg-success-subtle');
                // Recargar tabla automáticamente después de guardar
                await window.cargarRegistros(true);
            } else {
                mostrarToast(res.message, 'bg-danger');
            }
        } catch (err) { 
            mostrarToast('Error de conexión al guardar', 'bg-danger'); 
        } finally {
            refs.cargando.classList.add('d-none');
            btnGuardar.disabled = false;
        }
    });

    // --- BUSCADOR TRABAJADOR ---
    refs.inputCredencial.addEventListener('input', async (e) => {
        const val = e.target.value.trim();
        if (val.length >= 3) {
            try {
                const resp = await fetch(`query_sql/buscar_trabajador.php?credencial=${val}`);
                const data = await resp.json();
                if (data.status === 'success') {
                    refs.inputNombre.value = data.nombre.toUpperCase();
                    refs.inputNombre.classList.add('bg-success-subtle');
                    refs.inputNombre.readOnly = true;
                }
            } catch (e) { console.error("Error en buscador de trabajadores"); }
        }
    });

    // --- EVENTOS DE BOTONES ---
    if(refs.btnConsulta) {
        refs.btnConsulta.addEventListener('click', () => window.cargarRegistros(true));
    }

    if(refs.btnLimpiar) {
        refs.btnLimpiar.addEventListener('click', () => {
            refs.reporte.classList.add('d-none');
            refs.inputNombre.classList.remove('bg-success-subtle');
            refs.inputNombre.readOnly = false;
            refs.formulario.reset();
        });
    }
});

// --- HELPER: TOAST MESSAGES ---
function mostrarToast(mensaje, color = 'bg-success') {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white ${color} border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fa-solid fa-circle-info me-2"></i> ${mensaje}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>`;
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    const elementoToast = document.getElementById(toastId);
    const bsToast = new bootstrap.Toast(elementoToast, { delay: 4000 });
    bsToast.show();
    elementoToast.addEventListener('hidden.bs.toast', () => { elementoToast.remove(); });
}