document.addEventListener('DOMContentLoaded', () => {
    // 1. Referencias al DOM
    const formulario = document.querySelector('#form-materiales');
    const btnLimpiar = document.querySelector('button[type="reset"]'); 
    const reporte    = document.querySelector('#contenedor-reporte'); // El div de la consulta
    const tablaBody  = document.querySelector('#tabla-existencias');
    const cargando   = document.querySelector('#mensaje-carga');
    const inputCredencial = document.querySelector('#id_credencial');
    const inputNombre     = document.querySelector('#nombre_trabajador');
    const btnConsulta     = document.querySelector('#btn_consulta');

    // --- FUNCIÓN: CARGAR REGISTROS ---
    const cargarRegistros = async (mostrarTabla = false) => {
        try {
            const resp = await fetch('query_sql/obtener_registros.php');
            const resultado = await resp.json();

            if (resultado.status === 'success') {
                // Solo mostramos el contenedor si se solicita explícitamente (al guardar o consultar)
                if (mostrarTabla && resultado.data.length > 0) {
                    reporte.classList.remove('d-none');
                }

                tablaBody.innerHTML = ''; 
                resultado.data.forEach(reg => {
                    const fila = document.createElement('tr');
                    // Usamos fecha_formateada enviada desde el PHP para evitar el "Invalid Date"
                    fila.innerHTML = `
                        <td><span class="badge bg-dark">${reg.codigo_material}</span></td>
                        <td class="text-start">${reg.descripcion_material}</td>
                        <td class="text-start"><i class="fa-solid fa-user me-2 text-primary"></i>${reg.nombre_recibio}</td>
                        <td class="fw-bold">${reg.cantidad_salida_material}</td>
                        <td>${reg.fecha_formateada || reg.fecha_registro_material}</td>
                        <td><span class="badge bg-success">Registrado</span></td>
                    `;
                    tablaBody.appendChild(fila);
                });
            }
        } catch (error) {
            console.error("Error en la carga:", error);
        }
    };

    

    // --- ACCIÓN: GUARDAR REGISTRO ---
    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnGuardar = document.querySelector('#btn_alta');
        const formData = new FormData(formulario);
        const datos = Object.fromEntries(formData.entries());

        cargando.classList.remove('d-none');
        btnGuardar.disabled = true;

        try {
            const response = await fetch('query_sql/insertar_material.php', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            const resultado = await response.json();

            if (resultado.status === 'success') {
                mostrarToast(resultado.message, 'bg-success');
                formulario.reset();
                inputNombre.classList.remove('bg-success-subtle');
                inputNombre.readOnly = false;
               
                // Cargamos y le decimos que SÍ muestre la tabla (true)
                cargarRegistros(true); 
            } else {
                mostrarToast('Error: ' + resultado.message, 'bg-danger');
            }
        } catch (error) {
            mostrarToast('Error de conexión', 'bg-danger');
        } finally {
            cargando.classList.add('d-none');
            btnGuardar.disabled = false;
        }
    });

    // --- ACCIÓN: BOTÓN CONSULTA ---
    btnConsulta.addEventListener('click', () => {
        // Al hacer clic manual, también queremos ver los registros recientes, así que llamamos a la función con true para mostrar la tabla
        cargarRegistros(true);
        mostrarToast('Mostrando registros recientes', 'bg-primary');
    });

    // --- ACCIÓN: LIMPIAR (Vuelve a ocultar todo) ---
    btnLimpiar.addEventListener('click', () => {
        reporte.classList.add('d-none');
        inputNombre.classList.remove('bg-success-subtle');
        inputNombre.readOnly = false;
    });

    // --- BUSCADOR DE TRABAJADOR (Mantenemos tu automatización) ---
    inputCredencial.addEventListener('input', async (e) => {
        const valor = e.target.value.trim();
        if (valor.length >= 3) {
            try {
                const resp = await fetch(`query_sql/buscar_trabajador.php?credencial=${valor}`);
                const data = await resp.json();
                if (data.status === 'success') {
                    inputNombre.value = data.nombre; 
                    inputNombre.classList.add('bg-success-subtle');
                    inputNombre.readOnly = true;
                }
            } catch (error) { console.error(error); }
        }
    });

    function mostrarToast(mensaje, color) {
        let toast = document.createElement('div');
        toast.className = `toast align-items-center text-white ${color} border-0 toast-custom-pos shadow-lg`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `<div class="d-flex"><div class="toast-body">${mensaje}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
        document.body.appendChild(toast);
        new bootstrap.Toast(toast, { delay: 3000 }).show();
    }
});