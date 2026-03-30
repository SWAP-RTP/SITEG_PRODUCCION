// Funciones reutilizables para formularios de entrada y salida de materiales

// Llenar un select a partir de un arreglo de objetos
function llenarSelectConDatos(selectElement, data, campoValue, campoText) {
    if (!selectElement) return;
    selectElement.innerHTML = '';

    const opcionDefault = document.createElement('option');
    opcionDefault.value = '';
    opcionDefault.textContent = 'Seleccione...';
    selectElement.appendChild(opcionDefault);

    if (!Array.isArray(data)) return;

    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item[campoValue] ?? '';
        option.textContent = item[campoText] ?? '';
        selectElement.appendChild(option);
    });
}

// Llenar un select con datos de un endpoint que devuelve un arreglo
function llenarSelect(selectElement, url, campoValue, campoText) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            llenarSelectConDatos(selectElement, data, campoValue, campoText);
        })
        .catch(error => {
            console.error('Error:', error);
        });
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

// Mostrar tabla modal con paginación funcional
function mostrarTablaModalConPaginacion(contenedor, respuesta, columnas, onSelect, navPaginacionId, ulPaginacionId, fetchCallback) {
    // respuesta debe tener: {datos, total, pagina, totalPaginas, limite}
    const { datos, pagina, totalPaginas } = respuesta;

    if (!Array.isArray(datos) || datos.length === 0) {
        contenedor.innerHTML = '<p>No hay resultados.</p>';
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
                <i class="bi bi-plus-circle"></i> Agregar
            
            </button>
        </td></tr>`;
    });
    html += `</tbody></table>`;
    contenedor.innerHTML = html;

    // Event listeners de selección
    contenedor.querySelectorAll('.seleccionar-modal').forEach(btn => {
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

// Mostrar toast de material nuevo
function mostrarToastMaterialNuevo() {
    Swal.fire({
        icon: 'warning',
        title: '<strong>⚠ Material Nuevo</strong>',
        html: 'Este material no existe<br><small class="text-muted">Puedes registrarlo sin problema</small>',
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 4000,
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
        estadoDiv.innerHTML = '<span class="badge bg-warning text-dark"><i class="bi bi-exclamation-triangle me-1"></i>Material Nuevo</span>';
        setTimeout(() => {
            estadoDiv.innerHTML = '';
        }, 4000);
    }
}

// Limpiar badge de estado
function limpiarBadgeMaterial(estadoDivId) {
    const estadoDiv = document.getElementById(estadoDivId);
    if (estadoDiv) {
        estadoDiv.innerHTML = '';
    }
}

// Buscar material con callback (para entrada que necesita materialOriginal)
function buscarMaterialConCallback(codigo, descripcionInput, estadoDivId, callback) {
    if (!codigo) {
        descripcionInput.value = '';
        limpiarBadgeMaterial(estadoDivId);
        return;
    }
    fetch('query_sql/buscar_datos.php?tipo=material&codigo=' + encodeURIComponent(codigo))
        .then(res => res.json())
        .then(data => {
            if (data.descripcion_material) {
                descripcionInput.value = data.descripcion_material;
                limpiarBadgeMaterial(estadoDivId);
                if (callback) callback(data);
            } else {
                descripcionInput.value = '';
                mostrarBadgeMaterialNuevo(estadoDivId);
                mostrarToastMaterialNuevo();
                if (callback) callback(null);
            }
        })
        .catch(error => {
            descripcionInput.value = '';
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

// ======================== FUNCIONES GENÉRICAS PARA ENTRADA, SALIDA E INVENTARIO ========================

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
            console.error('Error al cargar catálogos:', error);
            mostrarAlertaError('No se pudieron cargar las listas.');
        });
}

// Abrir modal con paginación y búsqueda (genérico para materiales y trabajadores)
function abrirModalConPaginacion(modalId, contenedorId, tipo, inputBusquedaId, columnas, onSelect, navPaginacionId, ulPaginacionId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.addEventListener('shown.bs.modal', () => {
        const contenedor = document.getElementById(contenedorId);
        const inputBusqueda = document.getElementById(inputBusquedaId);
        let terminoBusqueda = '';
        
        if (!contenedor) return;
        contenedor.innerHTML = '<div class="text-center p-3"><div class="spinner-border text-primary" role="status"></div></div>';
        
        const cargarPagina = (pagina = 1) => {
            const limit = tipo === 'trabajadores' ? 10 : 5;
            fetch(`query_sql/modales_datos.php?tipo=${tipo}&pagina=${pagina}&limit=${limit}&search=${encodeURIComponent(terminoBusqueda)}`)
                .then(res => res.json())
                .then(respuesta => {
                    mostrarTablaModalConPaginacion(contenedor, respuesta, columnas, onSelect, navPaginacionId, ulPaginacionId, cargarPagina);
                })
                .catch(() => contenedor.innerHTML = '<p class="text-danger">Error al cargar los datos.</p>');
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

