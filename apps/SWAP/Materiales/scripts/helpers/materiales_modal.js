(function (global) {
    function mostrarTablaModal(tabla, datos, columnas, onSelect) {
        if (!Array.isArray(datos) || datos.length === 0) {
            tabla.innerHTML = '<p>No hay resultados.</p>';
            return;
        }

        const tablaId = 'tabla-modal-' + Math.random().toString(36).substr(2, 9);
        let html = `<table id="${tablaId}" class="table table-striped table-bordered"><thead><tr>`;
        columnas.forEach(col => {
            html += `<th>${col.header}</th>`;
        });
        html += '<th>Accion</th></tr></thead><tbody>';
        datos.forEach(item => {
            html += '<tr>';
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
        html += '</tbody></table>';
        tabla.innerHTML = html;

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
                        sPageButtonDisabled: 'disabled'
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

    function mostrarTablaModalConPaginacion(tabla, respuesta, columnas, onSelect, navPaginacionId, ulPaginacionId, fetchCallback, textoAccion = 'Agregar material') {
        const { datos, pagina, totalPaginas } = respuesta;

        if (!Array.isArray(datos) || datos.length === 0) {
            tabla.innerHTML = '<p>Sin registros disponibles.</p>';
            const navPag = document.getElementById(navPaginacionId);
            if (navPag) navPag.style.display = 'none';
            return;
        }

        const tablaId = 'tabla-modal-' + Math.random().toString(36).substr(2, 9);
        let html = `<table id="${tablaId}" class="table table-striped table-bordered"><thead><tr>`;
        columnas.forEach(col => {
            html += `<th>${col.header}</th>`;
        });
        html += '<th>Accion</th></tr></thead><tbody>';
        datos.forEach(item => {
            html += '<tr>';
            columnas.forEach(col => {
                html += `<td>${item[col.key]}</td>`;
            });
            html += `<td>
                <button type="button" class="btn btn-success btn-sm seleccionar-modal"
                    data-item='${JSON.stringify(item)}'>
                    <i class="bi bi-plus-circle"></i> ${textoAccion}
                </button>
            </td></tr>`;
        });
        html += '</tbody></table>';
        tabla.innerHTML = html;

        tabla.querySelectorAll('.seleccionar-modal').forEach(btn => {
            btn.addEventListener('click', function () {
                const item = JSON.parse(this.getAttribute('data-item'));
                onSelect(item);
            });
        });

        const navPag = document.getElementById(navPaginacionId);
        const ulPag = document.getElementById(ulPaginacionId);
        if (!navPag || !ulPag) return;

        if (totalPaginas <= 1) {
            navPag.style.display = 'none';
            return;
        }

        navPag.style.display = 'block';
        ulPag.innerHTML = '';

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

    function BuscarModal(modalId, contenedorId, tipo, inputBusquedaId, columnas, onSelect, navPaginacionId, ulPaginacionId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.addEventListener('shown.bs.modal', () => {
            const tabla = document.getElementById(contenedorId);
            const inputBusqueda = document.getElementById(inputBusquedaId);
            let terminoBusqueda = '';

            const normalizarBusqueda = () => {
                if (!inputBusqueda) return '';

                const valorMayusculas = inputBusqueda.value.toUpperCase();
                if (inputBusqueda.value !== valorMayusculas) {
                    inputBusqueda.value = valorMayusculas;
                }

                return valorMayusculas.trim();
            };

            if (!tabla) return;
            tabla.innerHTML = '<div class="text-center p-3"><div class="spinner-border text-primary" role="status"></div></div>';

            const cargarPagina = (pagina = 1) => {
                const limit = tipo === 'trabajadores' ? 10 : 5;
                const textoAccion = tipo === 'trabajadores' ? 'Agregar trabajador' : 'Agregar material';
                fetch(`query_sql/modales_datos.php?tipo=${tipo}&pagina=${pagina}&limit=${limit}&search=${encodeURIComponent(terminoBusqueda)}`)
                    .then(res => res.json())
                    .then(respuesta => {
                        mostrarTablaModalConPaginacion(tabla, respuesta, columnas, onSelect, navPaginacionId, ulPaginacionId, cargarPagina, textoAccion);
                    })
                    .catch(() => {
                        tabla.innerHTML = '<p class="text-danger">Error al cargar los datos.</p>';
                    });
            };

            const buscarConDebounce = global.MaterialesUtils.debounce(() => {
                terminoBusqueda = normalizarBusqueda();
                cargarPagina(1);
            }, 300);

            if (inputBusqueda) {
                inputBusqueda.value = '';
                inputBusqueda.style.textTransform = 'uppercase';
                inputBusqueda.addEventListener('input', normalizarBusqueda);
                inputBusqueda.oninput = buscarConDebounce;
            }
            cargarPagina(1);
        }, { once: true });
    }

    function abrirModalConPaginacion(modalId, contenedorId, tipo, inputBusquedaId, columnas, onSelect, navPaginacionId, ulPaginacionId) {
        return BuscarModal(modalId, contenedorId, tipo, inputBusquedaId, columnas, onSelect, navPaginacionId, ulPaginacionId);
    }

    global.MaterialesModal = {
        mostrarTablaModal,
        mostrarTablaModalConPaginacion,
        BuscarModal,
        abrirModalConPaginacion
    };

    global.mostrarTablaModal = mostrarTablaModal;
    global.mostrarTablaModalConPaginacion = mostrarTablaModalConPaginacion;
    global.BuscarModal = BuscarModal;
    global.abrirModalConPaginacion = abrirModalConPaginacion;
})(window);
