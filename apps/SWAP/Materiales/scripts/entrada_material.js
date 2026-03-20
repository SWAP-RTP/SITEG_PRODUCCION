document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-entrada-material');
    const campoCodigo = document.getElementById('codigo_material');
    const btnGuardar = document.getElementById('btn-guardar-entrada');
    const btnLimpiar = document.getElementById('btn-limpiar-entrada');
    const feedback = document.getElementById('estado-material');

    const inputs = {
        desc: document.getElementById('descripcion'),
        und: document.getElementById('unidad'),
        ubi: document.getElementById('ubicacion'),
        est: document.getElementById('estado_material'),
        cat: document.getElementById('id_categoria_material'), // NUEVO: Categoría
        cant: document.getElementById('cantidad_material')
    };

    const cargarSelect = async (url, elemento, key, label) => {
        if (!elemento) return;
        try {
            const res = await fetch(url);
            const text = await res.text();
            const start = text.indexOf('[');
            const end = text.lastIndexOf(']') + 1;
            if (start === -1) throw new Error("JSON no válido");
            
            const data = JSON.parse(text.substring(start, end));
            elemento.innerHTML = '<option value="">Seleccione...</option>';
            data.forEach(item => {
                const textoMostrar = item[label] || "Sin descripción";
                elemento.innerHTML += `<option value="${item[key]}">${item[key]} - ${textoMostrar}</option>`;
            });
        } catch (e) {
            console.error(`Error en ${url}:`, e);
            elemento.innerHTML = '<option value="">Error</option>';
        }
    };

    const buscarMaterial = async () => {
        const cod = campoCodigo.value.trim().toUpperCase();
        if (cod.length < 3) return;

        try {
            const res = await fetch(`query_sql/buscar_material.php?codigo=${cod}`);
            const data = await res.json();

            if (data && !data.error) {
                // Material existente: mostrar datos y bloquear campos
                inputs.desc.value = data.descripcion_material;
                inputs.und.value = data.id_unidad;
                inputs.ubi.value = data.ubicacion_fisica || '';
                inputs.est.value = data.id_estado_material;
                inputs.cat.value = data.id_categoria || '';
                alternarBloqueo(true);
                feedback.innerHTML = `<span class="badge bg-info">Stock Actual: ${data.stock_actual}</span>`;
                // Aviso visual
                Swal.fire({
                    icon: 'info',
                    title: 'Material existente',
                    text: 'La descripción y datos se han cargado automáticamente. Solo puedes registrar una nueva entrada para aumentar el stock.',
                    timer: 2500,
                    showConfirmButton: false
                });
            } else {
                // Material nuevo: desbloquear campos y mostrar aviso
                alternarBloqueo(false);
                feedback.innerHTML = `<span class="badge bg-warning text-dark">Material Nuevo</span>`;
                Swal.fire({
                    icon: 'warning',
                    title: 'Material nuevo',
                    text: 'Este código no existe. Ingresa los datos para registrar el material.',
                    timer: 2500,
                    showConfirmButton: false
                });
            }
        } catch (e) { console.warn("Error en búsqueda"); }
    };

    const alternarBloqueo = (bloquear) => {
        inputs.desc.readOnly = bloquear;
        inputs.und.disabled = bloquear;
        inputs.est.disabled = bloquear;
        inputs.cat.disabled = bloquear; // NUEVO
    };

    const registrarEntrada = async (e) => {
        e.preventDefault();
        if (!campoCodigo.value || !inputs.cant.value) return Swal.fire('Error', 'Faltan campos', 'warning');

        // IMPORTANTE: Habilitar selects temporalmente para que FormData capture los valores
        inputs.und.disabled = false;
        inputs.est.disabled = false;
        inputs.cat.disabled = false;

        const formData = new FormData(form);

        const confirm = await Swal.fire({ title: '¿Registrar?', icon: 'question', showCancelButton: true });
        if (confirm.isConfirmed) {
            try {
                const res = await fetch('query_sql/guardar_material.php', { method: 'POST', body: formData });
                const r = await res.json();
                if (r.success) {
                    Swal.fire('Éxito', r.mensaje, 'success');
                    btnLimpiar.click();
                } else {
                    Swal.fire('Error', r.error, 'error');
                }
            } catch (e) { Swal.fire('Error', 'Falla de red', 'error'); }
        }
    };

    const iniciar = () => {
        // CARGA DE CATÁLOGOS
        cargarSelect('query_sql/get_unidades.php', inputs.und, 'id_unidad', 'descripcion_unidad');
        cargarSelect('query_sql/get_estados_material.php', inputs.est, 'id_estado_material', 'descripcion_estado_material');
        cargarSelect('query_sql/get_categorias.php', inputs.cat, 'id_categoria_material', 'nombre_categoria_material'); 

        campoCodigo.addEventListener('blur', buscarMaterial);
        btnGuardar.addEventListener('click', registrarEntrada);
        btnLimpiar.addEventListener('click', () => {
            form.reset();
            feedback.innerHTML = '';
            alternarBloqueo(false);
        });
    };

    iniciar();
});