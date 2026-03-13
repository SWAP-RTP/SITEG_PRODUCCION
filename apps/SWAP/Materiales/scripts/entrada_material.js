document.addEventListener('DOMContentLoaded', () => {

    // --- REFERENCIAS AL DOM ---
    const inputCodigo = document.getElementById('codigo_material');
    const inputDesc = document.getElementById('descripcion');
    // Ahora 'inputUnidad' referenciará al <select>
    const inputUnidad = document.getElementById('unidad');
    const inputUbi = document.getElementById('ubicacion');
    const inputCant = document.getElementById('cantidad_material');
    const inputObs = document.getElementById('observaciones');
    const inputFecha = document.getElementById('fecha');

    const estadoAviso = document.getElementById('estado-material');
    const btnGuardar = document.getElementById('btn-guardar-entrada');

    let esMaterialNuevo = false;

    // --- 1. CARGAR UNIDADES DESDE LA BASE DE DATOS ---
    const cargarUnidades = async () => {
        try {
            const response = await fetch('query_sql/get_unidades.php');
            const unidades = await response.json();

            // Limpiar opciones previas
            inputUnidad.innerHTML = '<option value="">Seleccione unidad...</option>';

            unidades.forEach(uni => {
                const option = document.createElement('option');
                option.value = uni.nomenclatura_material;
                option.textContent = `${uni.nomenclatura_material} - ${uni.descripcion_unidad || ''}`;
                inputUnidad.appendChild(option);
            });
        } catch (error) {
            console.error("Error cargando unidades:", error);
        }
    };

    // Ejecutar carga de unidades al iniciar
    cargarUnidades();

    // --- BUSCAR MATERIAL ---
  // --- BUSCAR MATERIAL ---
    const buscarMaterial = async (codigo) => {
        // Limpiamos espacios y convertimos a MAYÚSCULAS para evitar errores de duplicados
        const codigoLimpio = codigo.trim().toUpperCase();
        if (!codigoLimpio) return;

        try {
            const response = await fetch(`query_sql/buscar_material.php?codigo=${encodeURIComponent(codigoLimpio)}`);
            
            if (!response.ok) throw new Error("El archivo PHP no respondió correctamente");

            // Obtenemos la respuesta como texto primero para ver si hay errores de PHP mezclados
            const text = await response.text();
            
            // Si ves esto en la consola, sabrás exactamente qué devolvió el servidor
            console.log("Respuesta servidor para " + codigoLimpio + ":", text);

            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
               
                throw new Error("La respuesta del servidor no es un JSON válido. Revisa la consola.");
            }

            if (data && !data.error) {
                inputDesc.value = data.descripcion_material;
                inputUnidad.value = data.nomenclatura_material;
                inputUbi.value = data.ubicacion_fisica_material || 'Sin ubicación';

                estadoAviso.innerHTML = `<span class="text-success">✔ Registrado (Stock: ${data.stock_actual})</span>`;
                esMaterialNuevo = false;
                toggleCampos(true); 
            } else {
                limpiarCamposParaNuevo();
                estadoAviso.innerHTML = `<span class="text-warning">⚠ Material Nuevo: Ingrese descripción y unidad</span>`;
                esMaterialNuevo = true;
                toggleCampos(false); 
            }
        } catch (error) {
            console.error("Detalle del error:", error);
            estadoAviso.innerHTML = `<span class="text-danger">${error.message}</span>`;
        }
    };

    // --- GUARDAR ENTRADA ---
    const guardarEntrada = async () => {
        if (!inputCodigo.value || !inputCant.value || inputCant.value <= 0 || !inputUnidad.value) {
            estadoAviso.innerHTML = `<span class="text-danger">Complete todos los campos, incluyendo la unidad</span>`;
            return;
        }

        try {
            const formData = new FormData();
            formData.append('codigo_material', inputCodigo.value.trim());
            formData.append('descripcion', inputDesc.value.trim());
            formData.append('unidad', inputUnidad.value); 
            formData.append('ubicacion', inputUbi.value.trim());
            formData.append('cantidad_material', inputCant.value);
            formData.append('es_nuevo', esMaterialNuevo);

            const response = await fetch(`query_sql/guardar_material.php`, {
                method: 'POST',
                body: formData
            });

            const text = await response.text();
            const data = JSON.parse(text);

            if (data && data.success) {
                estadoAviso.innerHTML = `<span class="text-success">✔ Entrada guardada correctamente</span>`;
                limpiarFormulario();
            } else {
                estadoAviso.innerHTML = `<span class="text-danger">Error: ${data.error || "No se pudo guardar"}</span>`;
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
            estadoAviso.innerHTML = `<span class="text-danger">Error crítico al conectar con el servidor</span>`;
        }
    };

    // --- FUNCIONES AUXILIARES ---

    function toggleCampos(bloquear) {
        inputDesc.readOnly = bloquear;
        inputUnidad.disabled = bloquear;
        inputUbi.readOnly = bloquear;
    }

    function limpiarCamposParaNuevo() {
        inputDesc.value = '';
        inputUnidad.value = ''; // Resetea el select
        inputUbi.value = '';
    }

    function limpiarFormulario() {
        inputCodigo.value = '';
        inputDesc.value = '';
        inputUnidad.value = '';
        inputUnidad.disabled = false; // Habilitar de nuevo para el siguiente registro
        inputUbi.value = '';
        inputCant.value = '';
        inputObs.value = '';
        esMaterialNuevo = false;
    }

    // --- EVENTOS ---
    inputCodigo.addEventListener('input', (e) => {
        // Forzamos mayúsculas mientras el usuario escribe
        const valor = e.target.value.toUpperCase();
        e.target.value = valor;
        
        if (valor.trim().length >= 3) {
            buscarMaterial(valor);
        }
    });

    btnGuardar.addEventListener('click', guardarEntrada);

    // CARGA DESDE URL 
    const urlParams = new URLSearchParams(window.location.search);
    const codigoUrl = urlParams.get('codigo');
    if (codigoUrl) {
        inputCodigo.value = codigoUrl.toUpperCase();
        buscarMaterial(codigoUrl);
    }
});