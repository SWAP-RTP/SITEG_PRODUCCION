document.addEventListener('DOMContentLoaded', () => {
    const adscripcionSelect = document.getElementById('adscripcion');
    //es una expresion regular para validar el formato del codigo MA seguido de 8 digitos
    const CODIGO_MA_REGEX = /^MA\d{8}$/;

    const materialForm = FormularioMateriales({formId: 'form-salida-material',codigoInputId: 'codigo',descripcionInputId: 'descripcion',cantidadInputId: 'cantidad',
        unidadSelectId: 'unidad',estadoSelectId: 'estado',categoriaSelectId: 'id_categoria',modalMaterialId: 'modalMaterial',
        modalMaterialContenedorId: 'contenedor-materiales-modal-salida',modalMaterialInputId: 'buscar-material-modal-salida',navPaginacionMaterialId: 'nav-paginacion-materiales-salida',
        ulPaginacionMaterialId: 'ul-paginacion-materiales-salida',contenedorTablaId: 'contenedor-tabla-salidas',
        tablaId: 'tabla-salidas',btnLimpiarId: 'btn-limpiar-entrada',
        columnasMaterial: [
            { header: 'Código', key: 'codigo_material' },
            { header: 'Descripción', key: 'descripcion_material' }
        ],
        alElegirMaterial: (item) => {
            const codigoInput = document.getElementById('codigo');
            const descripcionInput = document.getElementById('descripcion');
            if (codigoInput) codigoInput.value = item.codigo_material;
            if (descripcionInput) descripcionInput.value = item.descripcion_material;
            autoCompletarMaterialPorCodigo(
                item.codigo_material,
                descripcionInput,
                'estado-material',
                null,
                {
                    unidadSelect: materialForm.unidadSelect,
                    estadoSelect: materialForm.estadoSelect,
                    categoriaSelect: materialForm.categoriaSelect
                }
            );
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalMaterial'));
            if (modal) modal.hide();
        }
    });

    if (!materialForm.formulario) return;

    const obtenerDatosFormulario = () => ({codigo: materialForm.codigoInput.value.trim(),descripcion: materialForm.descripcionInput.value.trim(),
        unidad: materialForm.unidadSelect.value,estado: materialForm.estadoSelect.value,cantidad: materialForm.cantidadInput.value.trim(),id_categoria: materialForm.categoriaSelect.value,
        adscripcion: adscripcionSelect ? adscripcionSelect.value : ''
    });

    const normalizarCodigoMA = (valor = '') => {
        const limpio = String(valor).toUpperCase().replace(/[^A-Z0-9]/g, '');

        if (limpio === '') return '';
        if (limpio === 'M' || limpio === 'MA') return limpio;

        let digitos = '';
        if (limpio.startsWith('MA')) {
            digitos = limpio.slice(2).replace(/\D/g, '');
        } else {
            digitos = limpio.replace(/\D/g, '');
        }

        return `MA${digitos.slice(0, 8)}`;
    };

    if (materialForm.codigoInput) {
        materialForm.codigoInput.addEventListener('input', () => {
            materialForm.codigoInput.value = normalizarCodigoMA(materialForm.codigoInput.value);
        });
    }

    const camposRequeridosCompletos = (datos) => Object.values(datos).every(Boolean);

    const limpiarEstadoVisualMaterial = () => {
        if (typeof limpiarBadgeMaterial === 'function') {
            limpiarBadgeMaterial('estado-material');
        }
    };

    const limpiarFormularioSalida = () => {
        materialForm.limpiarFormulario();
        limpiarEstadoVisualMaterial();
    };

    const btnLimpiarSalida = document.getElementById('btn-limpiar-entrada');
    if (btnLimpiarSalida) {
        btnLimpiarSalida.addEventListener('click', limpiarEstadoVisualMaterial);
    }

    const confirmarGuardado = () => mostrarAlerta({
        title: '¿Deseas guardar la salida del material?',
        showConfirmButton: true,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Guardar',
        denyButtonText: 'No guardar'
    });

    const guardarSalida = async (datos) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch('query_sql/guardar_materiales.php?tipo=salida', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos),
            signal: controller.signal
        }).finally(() => {
            clearTimeout(timeoutId);
        });

        const raw = await response.text();

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${raw.slice(0, 180)}`);
        }

        try {
            return JSON.parse(raw);
        } catch {
            throw new Error(`Respuesta no JSON: ${raw.slice(0, 180)}`);
        }
    };

    // VALIDACIÓN Y ENVÍO DEL FORMULARIO
    materialForm.formulario.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = materialForm.formulario.querySelector('button[type="submit"], button:not([type])');
        const textoOriginalBtn = submitBtn ? submitBtn.innerHTML : '';

        const datos = obtenerDatosFormulario();

        if (!camposRequeridosCompletos(datos)) {
            mostrarAlerta({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor, llena todos los campos obligatorios.',
                confirmButtonColor: '#3085d6'
            });
            limpiarFormularioSalida();
            return;
        }

        if (!CODIGO_MA_REGEX.test(datos.codigo)) {
            mostrarAlerta({
                icon: 'warning',
                title: 'Código inválido',
                text: 'El código debe tener el formato MA00000001 (MA + 8 dígitos).',
                confirmButtonColor: '#f39c12'
            });
            materialForm.codigoInput.focus();
            return;
        }

        const result = await confirmarGuardado();

        if (result.isDenied) {
            mostrarAlerta({
                icon: 'info',
                title: 'No se guardó la salida'
            });
            return;
        }

        if (!result.isConfirmed) return;

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Procesando...';
        }

        try {
            const respuesta = await guardarSalida(datos);
            if (respuesta.status === 'ok') {
                await mostrarAlerta({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'La salida fue registrada correctamente.'
                });
                limpiarFormularioSalida();
                return;
            }

            if (respuesta.status === 'warning') {
                await mostrarAlerta({
                    icon: 'warning',
                    title: '¡Atención!',
                    text: respuesta.message,
                    confirmButtonColor: '#f39c12'
                });
                limpiarFormularioSalida();
                return;
            }

            await mostrarAlerta({
                icon: 'error',
                title: 'Error',
                text: respuesta.message || 'Ocurrió un error inesperado.',
                confirmButtonColor: '#d33'
            });
        } catch (error) {
            const mensajeError = error.name === 'AbortError'
                ? 'La solicitud tardo demasiado en responder. Intenta nuevamente.'
                : (error.message || 'Error de red o respuesta no válida');

            await mostrarAlerta({
                icon: 'error',
                title: 'Error',
                text: mensajeError,
                confirmButtonColor: '#d33'
            });
            console.error('Error:', error);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = textoOriginalBtn;
            }
        }
    });

});