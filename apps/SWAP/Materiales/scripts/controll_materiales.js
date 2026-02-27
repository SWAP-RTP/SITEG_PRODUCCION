/* ============================================================
    ARCHIVO: DOMINIO DE CONTROL DE MATERIALES
    DESCRIPCIÓN: Controla el registro y consulta conectando a PostgreSQL.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.querySelector('#form-materiales');
    const btnLimpiar = document.querySelector('button[type="reset"]'); 
    const reporte    = document.querySelector('#contenedor-reporte');
    const tabla      = document.querySelector('#tabla-existencias');
    const cargando   = document.querySelector('#mensaje-carga');

    const inputCredencial = document.querySelector('#id_credencial');
    const inputNombre = document.querySelector('#nombre_trabajador');

    // --- ACCIÓN: BUSCAR TRABAJADOR REAL EN BD ---
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
                } else {
                    inputNombre.classList.remove('bg-success-subtle');
                    inputNombre.readOnly = false;
                }
            } catch (error) {
                console.error("Error consultando trabajador:", error);
            }
        } else {
            inputNombre.value = "";
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

    // --- ACCIÓN: GUARDAR REGISTRO REAL EN BD ---
    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnGuardar = document.querySelector('#btn_alta');
        
        // Recolectamos TODOS los datos del formulario usando los "name" de los inputs
        const formData = new FormData(formulario);
        const datos = Object.fromEntries(formData.entries());

        // Validación preventiva antes de enviar
        if (!datos.codigo_material || !datos.cantidad_inicial_material || !datos.id_credencial) { 
            mostrarToast('Error: Faltan campos clave (Código, Cantidad o Credencial).', 'bg-danger');
            return;
        }

        cargando.classList.remove('d-none');
        btnGuardar.disabled = true;

        try {
            const response = await fetch('query_sql/insertar_material.php', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            // Verificamos si la respuesta es JSON válido
            const textoRespuesta = await response.text();
            let resultado;
            try {
                resultado = JSON.parse(textoRespuesta);
            } catch (e) {
                throw new Error("La respuesta del servidor no es un JSON válido: " + textoRespuesta);
            }

            if (resultado.status === 'success') {
                mostrarToast(resultado.message, 'bg-success');
                formulario.reset();
                inputNombre.classList.remove('bg-success-subtle');
                inputNombre.readOnly = false;
            } else {
                mostrarToast('Error: ' + resultado.message, 'bg-danger');
            }
        } catch (error) {
            console.error("Error en inserción:", error);
            mostrarToast('Error crítico: ' + error.message, 'bg-danger');
        } finally {
            cargando.classList.add('d-none');
            btnGuardar.disabled = false;
        }
    });
});