// ======================== 01) CATÁLOGOS Y SELECTS ========================

// Llenar un select a partir de un arreglo o de un endpoint
function llenarSelect(selectElement, origen, campoValue, campoText) {
    if (!selectElement) return;

    const pintarDatos = (data) => {
        selectElement.innerHTML = '';

        const opcionDefault = document.createElement('option');
        opcionDefault.value = '';
        opcionDefault.textContent = 'Seleccione...';
        selectElement.appendChild(opcionDefault);

        if (!Array.isArray(data)) return;

        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const option = document.createElement('option');
            option.value = item[campoValue] ?? '';
            option.textContent = item[campoText] ?? '';
            selectElement.appendChild(option);
        }
    };

    if (Array.isArray(origen)) {
        pintarDatos(origen);
        return;
    }

    fetch(origen)
        .then(response => response.json())
        .then(data => {
            pintarDatos(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Alias retrocompatible para llamadas antiguas
function llenarSelectConDatos(selectElement, data, campoValue, campoText) {
    return llenarSelect(selectElement, data, campoValue, campoText);
}

// Cargar catalogos unificados: categorias, estados y unidades
function cargarCatalogosMateriales(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo obtener el catalogo unificado');
            }
            return response.json();
        })
        .then(data => ({
            categorias: Array.isArray(data.categorias) ? data.categorias : [],
            estados: Array.isArray(data.estados) ? data.estados : [],
            unidades: Array.isArray(data.unidades) ? data.unidades : []
        }));
}

// ======================== 02) UTILIDADES BASE ========================

// Debounce para evitar llamadas excesivas
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// ======================== 03) ALERTAS ========================

// Alerta unificada para reducir duplicación
function mostrarAlerta({
    icon = 'info',
    title = '',
    text = '',
    confirmButtonColor,
    html,
    toast = false,
    position,
    showConfirmButton,
    timer,
    timerProgressBar,
    didOpen,
    ...opciones
} = {}) {
    const posicionFinal = position || (toast ? 'top' : 'center');

    return Swal.fire({
        icon,
        title,
        text,
        confirmButtonColor,
        html,
        toast,
        position: posicionFinal,
        showConfirmButton,
        timer,
        timerProgressBar,
        didOpen,
        ...opciones
    });
}

// Mostrar toast de material nuevo
function mostrarToastMaterialNuevo() {
    Swal.fire({
        icon: 'warning',
        title: '<strong>⚠ Se agregara un nuevo material</strong>',
        html: 'Este material no existe en el catalogo<br><small class="text-muted">Puedes registrarlo sin problema</small>',
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });
}

// Mostrar badge de material nuevo
function mostrarBadgeMaterialNuevo(estadoDivId) {
    const estadoDiv = document.getElementById(estadoDivId);
    if (estadoDiv) {
        estadoDiv.innerHTML = '<span class="badge bg-warning text-dark"><i class="bi bi-exclamation-triangle me-1"></i>Se agregara un nuevo material</span>';
        setTimeout(() => {
            estadoDiv.innerHTML = '';
        }, 7000);
    }
}

// Limpiar badge de estado
function limpiarBadgeMaterial(estadoDivId) {
    const estadoDiv = document.getElementById(estadoDivId);
    if (estadoDiv) {
        estadoDiv.innerHTML = '';
    }
}

// ======================== 04) TABLAS Y PAGINACIÓN DE MODAL ========================

// Mostrar la tabla del modal de salida
function mostrarTablaModal(tabla, datos, columnas, onSelect) {
    if (!Array.isArray(datos) || datos.length === 0) {
        tabla.innerHTML = '<p>No hay resultados.</p>';
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
    tabla.innerHTML = html;

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

    tabla.querySelectorAll('.seleccionar-modal').forEach(btn => {
        btn.addEventListener('click', function () {
            const item = JSON.parse(this.getAttribute('data-item'));
            onSelect(item);
        });
    });
}

// Mostrar tabla modal con paginación funcional
function mostrarTablaModalConPaginacion(tabla, respuesta, columnas, onSelect, navPaginacionId, ulPaginacionId, fetchCallback) {
    // respuesta debe tener: {datos, total, pagina, totalPaginas, limite}
    const { datos, pagina, totalPaginas } = respuesta;

    if (!Array.isArray(datos) || datos.length === 0) {
        tabla.innerHTML = '<p>Sin registros disponibles.</p>';
        // Ocultar paginación si no hay datos
        const navPag = document.getElementById(navPaginacionId);
        if (navPag) navPag.style.display = 'none';
        return;
    }

    // Renderizar tabla
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
                <i class="bi bi-plus-circle"></i> Agregar material
            
            </button>
        </td></tr>`;
    });
    html += `</tbody></table>`;
    tabla.innerHTML = html;

    // Event listeners de selección
    tabla.querySelectorAll('.seleccionar-modal').forEach(btn => {
        btn.addEventListener('click', function () {
            const item = JSON.parse(this.getAttribute('data-item'));
            onSelect(item);
        });
    });

    // Renderizar paginación
    const navPag = document.getElementById(navPaginacionId);
    const ulPag = document.getElementById(ulPaginacionId);
    
    if (!navPag || !ulPag) return;

    if (totalPaginas <= 1) {
        navPag.style.display = 'none';
        return;
    }

    navPag.style.display = 'block';
    ulPag.innerHTML = '';

    // Botón anterior
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${pagina === 1 ? 'disabled' : ''}`;
    const prevA = document.createElement('a');
    prevA.className = 'page-link';
    prevA.href = '#';
    prevA.textContent = 'Anterior';
    if (pagina > 1) {
        prevA.addEventListener('click', (e) => {
            e.preventDefault();
            fetchCallback(pagina - 1);
        });
    } else {
        prevA.style.pointerEvents = 'none';
    }
    prevLi.appendChild(prevA);
    ulPag.appendChild(prevLi);

    // Números de página (máximo 5 botones)
    const startPage = Math.max(1, pagina - 2);
    const endPage = Math.min(totalPaginas, startPage + 4);
    
    if (startPage > 1) {
        const dots = document.createElement('li');
        dots.className = 'page-item disabled';
        const dotsA = document.createElement('a');
        dotsA.className = 'page-link';
        dotsA.textContent = '...';
        dots.appendChild(dotsA);
        ulPag.appendChild(dots);
    }

    for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === pagina ? 'active' : ''}`;
        const a = document.createElement('a');
        a.className = 'page-link';
        a.href = '#';
        a.textContent = i;
        
        if (i !== pagina) {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                fetchCallback(i);
            });
        } else {
            a.style.pointerEvents = 'none';
        }
        
        li.appendChild(a);
        ulPag.appendChild(li);
    }

    if (endPage < totalPaginas) {
        const dots = document.createElement('li');
        dots.className = 'page-item disabled';
        const dotsA = document.createElement('a');
        dotsA.className = 'page-link';
        dotsA.textContent = '...';
        dots.appendChild(dotsA);
        ulPag.appendChild(dots);
    }

    // Botón siguiente
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${pagina === totalPaginas ? 'disabled' : ''}`;
    const nextA = document.createElement('a');
    nextA.className = 'page-link';
    nextA.href = '#';
    nextA.textContent = 'Siguiente';
    if (pagina < totalPaginas) {
        nextA.addEventListener('click', (e) => {
            e.preventDefault();
            fetchCallback(pagina + 1);
        });
    } else {
        nextA.style.pointerEvents = 'none';
    }
    nextLi.appendChild(nextA);
    ulPag.appendChild(nextLi);
}

// ======================== 05) BÚSQUEDAS DE NEGOCIO ========================

// Autocompletar descripción cuando se ingresa el código del material
function autoCompletarMaterialPorCodigo(codigo, descripcionInput, estadoDivId, callback) {
    if (!codigo) {
        descripcionInput.value = '';
        delete descripcionInput.dataset.autodescripcion;
        limpiarBadgeMaterial(estadoDivId);
        return;
    }

    fetch('query_sql/buscar_datos.php?tipo=material&codigo=' + encodeURIComponent(codigo))
        .then(res => res.json())
        .then(data => {
            if (data.descripcion_material) {
                descripcionInput.value = data.descripcion_material;
                descripcionInput.dataset.autodescripcion = data.descripcion_material;
                limpiarBadgeMaterial(estadoDivId);
                if (callback) callback(data);
            } else {
                const descripcionActual = (descripcionInput.value || '').trim();
                const descripcionAuto = (descripcionInput.dataset.autodescripcion || '').trim();

                // Solo limpiar si el texto actual proviene del autocompletado anterior.
                if (!descripcionActual || descripcionActual === descripcionAuto) {
                    descripcionInput.value = '';
                }

                delete descripcionInput.dataset.autodescripcion;
                mostrarBadgeMaterialNuevo(estadoDivId);
                mostrarToastMaterialNuevo();
                if (callback) callback(null);
            }
        })
        .catch(error => {
            if (!(descripcionInput.value || '').trim()) {
                descripcionInput.value = '';
            }
            console.error('Error:', error);
        });
}

// Buscar material para inventario con campos adicionales
function buscarMaterialParaInventario(codigo, descripcionInput, existenciaInput, stockMinimoInput, estadoDivId) {
    if (!codigo) {
        descripcionInput.value = '';
        existenciaInput.value = 0;
        if (stockMinimoInput) stockMinimoInput.value = '';
        limpiarBadgeMaterial(estadoDivId);
        return;
    }

    fetch('query_sql/buscar_datos.php?tipo=material&codigo=' + encodeURIComponent(codigo))
        .then(res => res.json())
        .then(data => {
            if (data && data.descripcion_material) {
                descripcionInput.value = data.descripcion_material;
                existenciaInput.value = data.stock_actual || 0;
                if (stockMinimoInput) stockMinimoInput.value = data.stock_minimo || '';
                existenciaInput.classList.remove('is-invalid');
                limpiarBadgeMaterial(estadoDivId);
            } else {
                descripcionInput.value = '';
                existenciaInput.value = 0;
                if (stockMinimoInput) stockMinimoInput.value = '';
                mostrarBadgeMaterialNuevo(estadoDivId);
                mostrarToastMaterialNuevo();
            }
        })
        .catch(error => {
            descripcionInput.value = '';
            existenciaInput.value = 0;
            if (stockMinimoInput) stockMinimoInput.value = '';
            console.error('Error:', error);
        });
}

// ======================== 06) FLUJOS GENÉRICOS DE PANTALLA ========================

// Cargar catálogos y llenar múltiples selects
function cargarYLlenarSelects(selectors, url = 'query_sql/catalogo_listas.php') {
    cargarCatalogosMateriales(url)
        .then(catalogos => {
            if (selectors.unidad) {
                llenarSelectConDatos(selectors.unidad, catalogos.unidades, 'id_unidad', 'descripcion_unidad');
            }
            if (selectors.estado) {
                llenarSelectConDatos(selectors.estado, catalogos.estados, 'id_estado_material', 'descripcion_estado_material');
            }
            if (selectors.categoria) {
                llenarSelectConDatos(selectors.categoria, catalogos.categorias, 'id_categoria_material', 'nombre_categoria_material');
            }
        })
        .catch(error => {
            console.error('Error al cargar listas:', error);
            mostrarAlerta({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar las listas.',
                confirmButtonColor: '#d33'
            });
        });
}

// Buscar en modal con paginación y búsqueda (genérico para materiales y trabajadores)
function BuscarModal(modalId, contenedorId, tipo, inputBusquedaId, columnas, onSelect, navPaginacionId, ulPaginacionId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.addEventListener('shown.bs.modal', () => {
        const tabla = document.getElementById(contenedorId);
        const inputBusqueda = document.getElementById(inputBusquedaId);
        let terminoBusqueda = '';
        
        if (!tabla) return;
        tabla.innerHTML = '<div class="text-center p-3"><div class="spinner-border text-primary" role="status"></div></div>';
        
        const cargarPagina = (pagina = 1) => {
            const limit = tipo === 'trabajadores' ? 10 : 5;
            fetch(`query_sql/modales_datos.php?tipo=${tipo}&pagina=${pagina}&limit=${limit}&search=${encodeURIComponent(terminoBusqueda)}`)
                .then(res => res.json())
                .then(respuesta => {
                    mostrarTablaModalConPaginacion(tabla, respuesta, columnas, onSelect, navPaginacionId, ulPaginacionId, cargarPagina);
                })
                .catch(() => tabla.innerHTML = '<p class="text-danger">Error al cargar los datos.</p>');
        };
        
        const buscarConDebounce = debounce(() => {
            terminoBusqueda = inputBusqueda ? inputBusqueda.value.trim() : '';
            cargarPagina(1);
        }, 300);
        
        if (inputBusqueda) {
            inputBusqueda.value = '';
            inputBusqueda.oninput = buscarConDebounce;
        }        
        cargarPagina(1);
    }, { once: true });
}

// Alias retrocompatible para vistas que aun llamen al nombre anterior
function abrirModalConPaginacion(modalId, contenedorId, tipo, inputBusquedaId, columnas, onSelect, navPaginacionId, ulPaginacionId) {
    return BuscarModal(modalId, contenedorId, tipo, inputBusquedaId, columnas, onSelect, navPaginacionId, ulPaginacionId);
}

// Buscar trabajador y autocompletar
function buscarYAutocompletarTrabajador(credencialInput, trabajadorInput, onResult) {
    const buscar = debounce(() => {
        const credencial = credencialInput.value.trim();
        if (!credencial) {
            trabajadorInput.value = '';
            if (onResult) onResult(false, null);
            return;
        }
        fetch(`query_sql/buscar_datos.php?tipo=trabajador&credencial=${encodeURIComponent(credencial)}`)
            .then(res => res.json())
            .then(data => {
                trabajadorInput.value = data.nombre || '';
                if (onResult) onResult(Boolean(data.nombre), data);
            })
            .catch(error => {
                trabajadorInput.value = '';
                if (onResult) onResult(false, null);
                console.error('Error:', error);
            });
    }, 300);
    
    credencialInput.addEventListener('input', buscar);
}

// Limpiar formulario y tablas asociadas
function limpiarFormularioCompleto(formularioId, contenedorTablaId, tablaId, btnLimpiarId) {
    const formulario = document.getElementById(formularioId);
    const btnLimpiar = document.getElementById(btnLimpiarId);
    
    const ejecutarLimpieza = () => {
        if (formulario) formulario.reset();
        const contenedor = document.getElementById(contenedorTablaId);
        const tabla = document.getElementById(tablaId);
        if (contenedor) contenedor.style.display = 'none';
        if (tabla) tabla.innerHTML = '';
    };
    
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', ejecutarLimpieza);
    }
    
    return ejecutarLimpieza;
}

