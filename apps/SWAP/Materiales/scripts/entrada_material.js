document.addEventListener('DOMContentLoaded', () => {
    // --- REFERENCIAS AL DOM ---
    const inputCodigo = document.getElementById('codigo_material');
    const inputDesc = document.getElementById('descripcion');
    const inputUnidad = document.getElementById('unidad');
    const inputUbi = document.getElementById('ubicacion');
    const inputCant = document.getElementById('cantidad_material');
    const inputObs = document.getElementById('observaciones');
    const estadoAviso = document.getElementById('estado-material');
    const btnGuardar = document.getElementById('btn-guardar-entrada');
     // --- FORZAR MAYÚSCULAS EN CAMPOS DE TEXTO ---
    [inputCodigo, inputDesc, inputUbi, inputObs].forEach(input => {
        if (input) {
            input.addEventListener('input', function(e) {
                e.target.value = e.target.value.toUpperCase();
            });
        }
    });
    // --- FUNCIÓN PARA CARGAR MATERIALES EN EL MODAL ---
function cargarMaterialesEnModal() {
    fetch('query_sql/lista_modal.php')
        .then(response => {
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            return response.json();
        })
        .then(materiales => {
            const contenedor = document.getElementById('contenedor-materiales-modal');
            if (!contenedor) return;

            // Si hay error en la respuesta, mostrar mensaje
            if (materiales.error) {
                contenedor.innerHTML = `<div class="text-danger">${materiales.mensaje || 'Error al cargar registros.'}</div>`;
                return;
            }

            // Si no hay registros, mostrar mensaje
            if (!Array.isArray(materiales) || materiales.length === 0) {
                contenedor.innerHTML = '<div class="text-center text-muted">No hay registros.</div>';
                return;
            }

            // Renderizar la tabla de materiales
            let tabla = `<table class="table table-striped table-bordered">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Descripción</th>
                    </tr>
                </thead>
                <tbody>`;
            materiales.forEach(mat => {
                tabla += `<tr class="fila-material" data-codigo="${mat.codigo_material}" data-desc="${mat.descripcion_material}">
                    <td>${mat.codigo_material}</td>
                    <td>${mat.descripcion_material}</td>
                </tr>`;
            });
            tabla += '</tbody></table>';
            contenedor.innerHTML = `
    <div class="mb-2 text-muted" style="font-size: 0.95em;">
        <i class="bi bi-hand-index-thumb me-1"></i>Haz clic en una fila para seleccionarla y luego presiona <b>Agregar</b>.
    </div>
` + tabla;

            // Permitir seleccionar una fila (se marca visualmente)
            document.querySelectorAll('.fila-material').forEach(fila => {
                fila.addEventListener('click', function() {
                    document.querySelectorAll('.fila-material').forEach(f => f.classList.remove('table-active'));
                    this.classList.add('table-active');
                });
            });

            // Al dar clic en "Agregar", copiar los datos al formulario principal
            const btnAgregar = document.querySelector('#exampleModalCenter .btn-success');
            btnAgregar.onclick = function() {
                const seleccionada = document.querySelector('.fila-material.table-active');
                if (seleccionada) {
                    inputCodigo.value = seleccionada.dataset.codigo;
                    inputDesc.value = seleccionada.dataset.desc;
                    // Aquí puedes agregar lógica para buscar unidad y ubicación si lo necesitas
                    const modalInstance = bootstrap.Modal.getInstance(document.getElementById('exampleModalCenter'));
                    modalInstance.hide();
                } else {
                    Swal.fire('Selecciona un material de la lista');
                }
            };
        })
        .catch(error => {
            const contenedor = document.getElementById('contenedor-materiales-modal');
            if (contenedor) {
                contenedor.innerHTML = `<div class="text-danger">Error al cargar registros: ${error.message}</div>`;
            }
        });
}

// --- EVENTO PARA ABRIR EL MODAL Y CARGAR LOS DATOS ---
const modal = document.getElementById('exampleModalCenter');
if (modal) {
    modal.addEventListener('show.bs.modal', cargarMaterialesEnModal);
}
    let esMaterialNuevo = false;

    // --- 1. CARGAR UNIDADES ---
    const cargarUnidades = async () => {
        try {
            const response = await fetch('query_sql/get_unidades.php');
            if (!response.ok) return;
            const unidades = await response.json();

            inputUnidad.innerHTML = '<option value="">Seleccione unidad...</option>';
            if (Array.isArray(unidades)) {
                unidades.forEach(uni => {
                    const option = document.createElement('option');
                    option.value = uni.nomenclatura_material;
                    option.textContent = `${uni.nomenclatura_material} - ${uni.descripcion_unidad || ''}`;
                    inputUnidad.appendChild(option);
                });
            }
        } catch (error) {
            console.error("Error cargando unidades:", error);
        }
    };

    // --- 2. BUSCAR MATERIAL ---
    const buscarMaterial = async (codigo) => {
        const codigoLimpio = codigo.trim().toUpperCase();
        if (codigoLimpio.length < 3) return;

        try {
            const response = await fetch(`query_sql/buscar_material.php?codigo=${encodeURIComponent(codigoLimpio)}`);
            if (!response.ok) throw new Error("Error en servidor");

            const data = await response.json();

            if (data && !data.error) {
                inputDesc.value = data.descripcion_material;
                inputUnidad.value = data.nomenclatura_material;
                inputUbi.value = data.ubicacion_fisica_material || 'ALMACEN';
                estadoAviso.innerHTML = `<span class="text-info">
    <i class="bi bi-box-seam me-1"></i>Material existente (Stock actual: ${data.stock_actual})
</span>`;
                esMaterialNuevo = false;
                toggleCampos(true);
                Swal.fire({
                    icon: 'info',
                    title: 'Material encontrado',
                    html: `Stock actual: <b>${data.stock_actual}</b>`,
                    confirmButtonColor: '#3085d6'
                });
            } else {
                limpiarCamposParaNuevo();
                estadoAviso.innerHTML = `<span class="text-warning"> Material Nuevo: Complete los datos</span>`;
                esMaterialNuevo = true;
                toggleCampos(false);
            }
        } catch (error) {
            console.error("Error en buscarMaterial:", error);
        }
    };

    // --- 3. GUARDAR ENTRADA ---
   const guardarEntrada = async () => {
    const codigo = inputCodigo.value.trim().toUpperCase();
    const cant = parseFloat(inputCant.value);
    const ubicacion = inputUbi.value.trim();

    if (!codigo || isNaN(cant) || cant <= 0 || !inputUnidad.value || !ubicacion) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos obligatorios',
            text: 'Por favor, complete todos los campos requeridos antes de guardar.',
            confirmButtonColor: '#3085d6'
        });
        return;
    }



        try {
            const formData = new FormData();
            formData.append('codigo_material', codigo);
            formData.append('descripcion', inputDesc.value.trim().toUpperCase());
            formData.append('unidad', inputUnidad.value);
            formData.append('ubicacion', inputUbi.value.trim().toUpperCase());
            formData.append('cantidad_material', cant);
            if (inputObs) formData.append('observaciones', inputObs.value);

            const response = await fetch(`query_sql/guardar_material.php`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                estadoAviso.innerHTML = `<span class="text-success">✔ ${data.mensaje || 'Guardado correctamente'}</span>`;
                setTimeout(() => {
                    limpiarFormulario();
                }, 1500);
            } else {
                estadoAviso.innerHTML = `<span class="text-danger">Error: ${data.error}</span>`;
            }
        } catch (error) {
            console.error("Error al guardar:", error);
            estadoAviso.innerHTML = `<span class="text-danger">Error crítico al guardar</span>`;
        }
    };

    // --- INICIALIZACIÓN Y EVENTOS ---
    cargarUnidades();

    inputCodigo.addEventListener('input', (e) => {
        buscarMaterial(e.target.value);
    });

    btnGuardar.addEventListener('click', (e) => {
        e.preventDefault();
        guardarEntrada();
    });

    // --- FUNCIONES DE APOYO ---
    function toggleCampos(bloquear) {
        inputDesc.readOnly = bloquear;
        inputUnidad.disabled = bloquear;
        inputUbi.readOnly = bloquear;
    }

    function limpiarCamposParaNuevo() {
        inputDesc.value = '';
        inputUnidad.value = '';
        inputUbi.value = '';
    }

    function limpiarFormulario() {
        const form = document.getElementById('form-entrada-material');
        if (form) form.reset();
        estadoAviso.innerHTML = '';
        toggleCampos(false);
        esMaterialNuevo = false;
    }

   
});