/* ============================================================
    ARCHIVO: CONTROL_MATERIALES.JS (Versión Final Blindada)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.querySelector('#form-materiales');
    const btnLimpiar = document.querySelector('button[type="reset"]'); 
    const reporte    = document.querySelector('#contenedor-reporte');
    const tabla      = document.querySelector('#tabla-existencias');
    const cargando   = document.querySelector('#mensaje-carga');

    const inputCredencial = document.querySelector('#id_credencial');
    const inputNombre = document.querySelector('#nombre_trabajador');

    const esperar = (ms) => new Promise(res => setTimeout(res, ms));

    const diccionarioEmpleados = {
        "1020": "JUAN PÉREZ GARCÍA",
        "2030": "MARÍA ELENA LÓPEZ",
        "3040": "RICARDO RAMÍREZ SOTO",
        "4050": "BEATRIZ ADRIANA DÍAZ",
        "8080": "SOLIS SALAZAR LUIS ENRIQUE",
        "1000": "LUIS FERNANDO GÓMEZ",
    };

    // Autocompletado de trabajadores
    inputCredencial.addEventListener('input', (e) => {
        const valor = e.target.value.trim();
        if (diccionarioEmpleados[valor]) {
            inputNombre.value = diccionarioEmpleados[valor];
            inputNombre.classList.add('bg-success-subtle'); 
            inputNombre.readOnly = true; 
        } else {
            inputNombre.classList.remove('bg-success-subtle');
            inputNombre.readOnly = false;
        }
    });

    function mostrarToast(mensaje, color = 'bg-success') {
        let toast = document.createElement('div');
        toast.className = `toast align-items-center text-white ${color} border-0 toast-custom-pos toast-success-big shadow-lg`;
        toast.setAttribute('role', 'alert');
        const icono = color === 'bg-success' ? 'fa-circle-check' : 'fa-circle-exclamation';
        toast.innerHTML = `<div class="d-flex"><div class="toast-body"><i class="fa-solid ${icono} me-2"></i> ${mensaje}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
        document.body.appendChild(toast);
        let bsToast = new bootstrap.Toast(toast, { delay: 3000 });
        bsToast.show();
        toast.addEventListener('hidden.bs.toast', () => toast.remove());
    }

    btnLimpiar.addEventListener('click', () => {
        reporte.classList.add('d-none');
        tabla.innerHTML = '';
        inputNombre.classList.remove('bg-success-subtle');
        inputNombre.readOnly = false;
        cargando.classList.add('d-none');
    });

    // --- ACCIÓN: GUARDAR REGISTRO ---
    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnGuardar = document.querySelector('#btn_alta');
        const formData = new FormData(formulario);
        const datos = Object.fromEntries(formData.entries());

        /* ------------------------------------------------------------
           VALIDACIÓN BLINDADA: Incluye código, nombre, cantidad, 
           unidad Y FECHA obligatoriamente.
        ------------------------------------------------------------ */
        if (!datos.codigo_material || !datos.descripcion_material || !datos.cantidad_inicial_material || !datos.unidad_medida_material || !datos.fecha_registro_material) { 
            mostrarToast('Error: Debes llenar todos los campos.', 'bg-danger');
            return;
        }

        cargando.classList.remove('d-none');
        btnGuardar.disabled = true;

        await esperar(800); 

        // Limpiar registros viejos corruptos (opcional, por mantenimiento)
        let historial = JSON.parse(localStorage.getItem('mis_recibos')) || [];
        historial = historial.filter(r => r.unidad && r.unidad !== 'undefined');

        const nuevoRegistro = {
            fecha: (datos.fecha_registro_material || "").replace('T', ' '),
            codigo: datos.codigo_material.toUpperCase().trim(),
            nombre: datos.descripcion_material.toUpperCase().trim(),
            cuanto: parseFloat(datos.cantidad_inicial_material),
            unidad: datos.unidad_medida_material,
            quien: datos.nombre_trabajador_material || 'N/A',
            ubicacion: datos.ubicacion_almacen_material || 'ALMACEN',
            minimo: parseFloat(datos.stock_minimo_material) || 5
        };

        historial.push(nuevoRegistro);
        localStorage.setItem('mis_recibos', JSON.stringify(historial));

        mostrarToast('¡Campos registrados exitosamente!', 'bg-success');
        
        // Reset de Interfaz
        formulario.reset();
        inputNombre.classList.remove('bg-success-subtle');
        inputNombre.readOnly = false;
        cargando.classList.add('d-none');
        btnGuardar.disabled = false;
    });

    // --- ACCIÓN: CONSULTA DE ACTIVIDAD ---
    document.querySelector('#btn_consulta').addEventListener('click', async () => {
        const historial = JSON.parse(localStorage.getItem('mis_recibos')) || [];
        if (historial.length === 0) { mostrarToast('No hay registros para mostrar.', 'bg-danger'); return; }
        
        cargando.classList.remove('d-none');
        await esperar(500);
        mostrarHistorialDetallado(historial);
        cargando.classList.add('d-none');
        reporte.scrollIntoView({ behavior: 'smooth' });
    });

    function mostrarHistorialDetallado(datos) {
        // 1. Limpiamos la tabla
        tabla.innerHTML = '';

  
        // CÓDIGO | DESCRIPCIÓN | RESPONSABLE | CANTIDAD | FECHA | ESTADO
        [...datos].reverse().slice(0, 10).forEach(reg => {
            tabla.innerHTML += `<tr>
                <td class="fw-bold text-dark">${reg.codigo}</td>
                <td class="small">${reg.nombre}</td>
                <td class="small text-muted">${reg.quien}</td>
                <td class="text-success fw-bold">+ ${reg.cuanto}</td>
                <td class="small text-secondary">${reg.fecha}</td>
                <td>
                    <span class="badge bg-success-subtle text-success border border-success" style="font-size: 0.7rem;">
                        <i class="fa-solid fa-check me-1"></i>REGISTRADO
                    </span>
                </td>
            </tr>`;
        });

        // 3. Mostramos el contenedor de la tabla
        reporte.classList.remove('d-none');
    }
});