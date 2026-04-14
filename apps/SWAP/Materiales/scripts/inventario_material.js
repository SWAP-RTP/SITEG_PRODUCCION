document.addEventListener('DOMContentLoaded', function () {
    const codigoInput = document.getElementById('codigo');
    const descripcionInput = document.getElementById('descripcion');
    const cantidadInput = document.getElementById('cantidad');
    const unidadSelect = document.getElementById('unidad');
    const estadoSelect = document.getElementById('estado');
    const categoriaSelect = document.getElementById('id_categoria');
    const existenciaInput = document.getElementById('existencia');
    const stockMinimoInput = document.getElementById('stock_minimo');
    const formInventario = document.getElementById('form-inventario-material');
    const tablaInventario = document.getElementById('tabla-inventario');
    const contenedorTablaInventario = document.getElementById('contenedor-tabla-inventario');
    const estadoMaterialDiv = document.getElementById('estado-material');
    const kpiTotalMateriales = document.getElementById('kpi-total-materiales');
    const kpiStockTotal = document.getElementById('kpi-stock-total');
    const kpiBajoStock = document.getElementById('kpi-bajo-stock');
    const kpiAgotados = document.getElementById('kpi-agotados');
    const progresoDisponible = document.getElementById('progreso-disponible');
    const progresoBajo = document.getElementById('progreso-bajo');
    const progresoAgotado = document.getElementById('progreso-agotado');
    const progresoDisponibleTexto = document.getElementById('progreso-disponible-texto');
    const progresoBajoTexto = document.getElementById('progreso-bajo-texto');
    const progresoAgotadoTexto = document.getElementById('progreso-agotado-texto');
    const listaCriticosInventario = document.getElementById('lista-criticos-inventario');
    const inventarioLimiteSelect = document.getElementById('inventario-limite');
    const paginacionInventarioId = 'paginacion-tabla-inventario';
    let inventarioCompleto = [];
    let paginaInventarioActual = 1;
    let limiteInventario = 5;
    const limpiarFormularioInventario = limpiarFormularioCompleto(
        'form-inventario-material',
        'contenedor-tabla-inventario',
        'tabla-inventario',
        'btn-limpiar-inventario'
    );

    cargarYLlenarSelects({
        unidad: unidadSelect,
        estado: estadoSelect,
        categoria: categoriaSelect
    });

    // CREAR ELEMENTO PARA MOSTRAR ADVERTENCIA DE STOCK BAJO
    let advertenciaExistencia = document.getElementById('advertencia-existencia');
    if (!advertenciaExistencia) {
        advertenciaExistencia = document.createElement('div');
        advertenciaExistencia.id = 'advertencia-existencia';
        advertenciaExistencia.className = 'form-text text-danger fw-bold';
        existenciaInput.parentNode.appendChild(advertenciaExistencia);
    }

    // LIMPIAR VALIDACIÓN AL RESETEAR FORMULARIO
    if (formInventario) {
        formInventario.addEventListener('reset', function () {
            existenciaInput.classList.remove('is-invalid');
            if (advertenciaExistencia) advertenciaExistencia.textContent = '';
            if (cantidadInput) cantidadInput.value = 0;
        });
    }

    // BUSCAR MATERIAL Y AUTOCOMPLETAR CAMPOS
    codigoInput.addEventListener('input', debounce(() => {
        const codigo = codigoInput.value.trim();
        if (/^MA\d{8}$/.test(codigo)) {
            buscarMaterialParaInventario(codigo, descripcionInput, existenciaInput, stockMinimoInput, 'estado-material', {
                unidadSelect,
                estadoSelect,
                categoriaSelect
            });
        } else {
            // Si el código no es válido, limpiar y cerrar catálogos
            descripcionInput.value = '';
            existenciaInput.value = 0;
            if (stockMinimoInput) stockMinimoInput.value = '';
            if (unidadSelect) unidadSelect.value = '';
            if (estadoSelect) estadoSelect.value = '';
            if (categoriaSelect) categoriaSelect.value = '';
            if (window.CatalogosAbiertos) {
                CatalogosAbiertos({
                    unidadSelect,
                    estadoSelect,
                    categoriaSelect
                }, false);
            }
        }
    }, 300));

    // VALIDAR STOCK ACTUAL vs STOCK MÍNIMO
    function validarStock() {
        if (parseInt(existenciaInput.value, 10) <= parseInt(stockMinimoInput.value, 10)) {
            existenciaInput.classList.add('is-invalid');
        } else {
            existenciaInput.classList.remove('is-invalid');
        }
    }

    existenciaInput.addEventListener('input', validarStock);

    function obtenerBadgeEstatus(estatus) {
        if (estatus === 'agotado') {
            return '<span class="badge bg-danger">Agotado</span>';
        }
        if (estatus === 'bajo') {
            return '<span class="badge bg-warning text-dark">Bajo</span>';
        }
        return '<span class="badge bg-success">Disponible</span>';
    }

    function checkStockPorCodigo(inventario, codigoBuscado) {
        if (!Array.isArray(inventario) || !codigoBuscado) return 0;

        const codigo = codigoBuscado.trim().toUpperCase();
        return inventario.reduce((total, item) => {
            const codigoItem = String(item?.codigo_material || '').trim().toUpperCase();
            const stock = Number(item?.stock_actual) || 0;
            return codigoItem === codigo ? total + stock : total;
        }, 0);
    }

    function renderDashboardInventario(datos) {
        if (!Array.isArray(datos)) return;

        const totalMateriales = datos.length;
        const stockTotal = datos.reduce((acc, item) => acc + (Number(item.stock_actual) || 0), 0);
        const totalBajoStock = datos.filter(item => item.estatus_stock === 'bajo').length;
        const totalAgotados = datos.filter(item => item.estatus_stock === 'agotado').length;

        if (kpiTotalMateriales) kpiTotalMateriales.textContent = totalMateriales;
        if (kpiStockTotal) kpiStockTotal.textContent = stockTotal;
        if (kpiBajoStock) kpiBajoStock.textContent = totalBajoStock;
        if (kpiAgotados) kpiAgotados.textContent = totalAgotados;

        const total = totalMateriales || 1;
        const pctDisponible = Math.round(((totalMateriales - totalBajoStock - totalAgotados) / total) * 100);
        const pctBajo = Math.round((totalBajoStock / total) * 100);
        const pctAgotado = Math.round((totalAgotados / total) * 100);

        if (progresoDisponible) progresoDisponible.style.width = `${pctDisponible}%`;
        if (progresoBajo) progresoBajo.style.width = `${pctBajo}%`;
        if (progresoAgotado) progresoAgotado.style.width = `${pctAgotado}%`;

        if (progresoDisponibleTexto) progresoDisponibleTexto.textContent = `${pctDisponible}%`;
        if (progresoBajoTexto) progresoBajoTexto.textContent = `${pctBajo}%`;
        if (progresoAgotadoTexto) progresoAgotadoTexto.textContent = `${pctAgotado}%`;

        if (listaCriticosInventario) {
            const criticos = datos
                .filter(item => ['bajo', 'agotado'].includes(String(item.estatus_stock || '').toLowerCase()))
                .slice(0, 8);

            if (criticos.length === 0) {
                listaCriticosInventario.innerHTML = '<li class="list-group-item text-muted">Sin elementos críticos por mostrar.</li>';
            } else {
                listaCriticosInventario.innerHTML = criticos.map(item => {
                    const etiqueta = String(item.estatus_stock || '').toLowerCase() === 'agotado'
                        ? '<span class="badge bg-danger">Agotado</span>'
                        : '<span class="badge bg-warning text-dark">Bajo</span>';

                    return `<li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <div class="fw-semibold">${item.descripcion_material || item.codigo_material || 'Material'}</div>
                            <small class="text-muted">${item.codigo_material || ''} - Stock: ${item.stock_actual || 0} / Min: ${item.stock_minimo || 0}</small>
                        </div>
                        ${etiqueta}
                    </li>`;
                }).join('');
            }
        }
    }

    function renderTablaInventario(datos) {
        if (!Array.isArray(datos) || datos.length === 0) {
            tablaInventario.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">No hay materiales en el inventario.</td></tr>';
            return;
        }

        let html = '';
        datos.forEach(item => {
            const estatus = String(item.estatus_stock || '').toLowerCase();
            let estiloCelda = '';
            let claseFila = '';
            if (estatus === 'agotado') {
                claseFila = 'table-danger fw-bold';
            } else if (estatus === 'bajo') {
                estiloCelda = 'style="background-color:#ffd6d6 !important;color:#7a0010 !important;font-weight:600;"';
            }

            html += `<tr class="${claseFila}">
                <td ${estiloCelda}>${item.codigo_material || ''}</td>
                <td ${estiloCelda}>${item.descripcion_material || ''}</td>
                <td ${estiloCelda}>${item.categoria || ''}</td>
                <td ${estiloCelda}>${item.unidad || ''}</td>
                <td class="fw-bold" ${estiloCelda}>${item.stock_actual || 0}</td>
                <td ${estiloCelda}>${item.stock_minimo || 0}</td>
                <td ${estiloCelda}>${obtenerBadgeEstatus(item.estatus_stock)}</td>
            </tr>`;
        });
        tablaInventario.innerHTML = html;
    }

    function obtenerContenedorPaginacionInventario() {
        let nav = document.getElementById(paginacionInventarioId);
        if (!nav) {
            nav = document.createElement('nav');
            nav.id = paginacionInventarioId;
            nav.className = 'mt-3';
            nav.setAttribute('aria-label', 'Paginacion de materiales en inventario');
            nav.innerHTML = '<ul class="pagination justify-content-end mb-0"></ul>';
            contenedorTablaInventario.querySelector('.card-body').appendChild(nav);
        }
        return nav;
    }

    function renderPaginacionInventario() {
        const nav = obtenerContenedorPaginacionInventario();
        const ul = nav.querySelector('ul');
        ul.innerHTML = '';

        const totalPaginas = Math.max(1, Math.ceil(inventarioCompleto.length / limiteInventario));
        if (totalPaginas <= 1) {
            nav.style.display = 'none';
            return;
        }

        nav.style.display = 'block';

        const crearItem = (texto, pagina, disabled = false, active = false) => {
            const li = document.createElement('li');
            li.className = `page-item${disabled ? ' disabled' : ''}${active ? ' active' : ''}`;
            const a = document.createElement('a');
            a.className = 'page-link';
            a.href = '#';
            a.textContent = texto;
            if (!disabled) {
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    paginaInventarioActual = pagina;
                    renderTablaPaginadaInventario();
                    renderPaginacionInventario();
                });
            }
            li.appendChild(a);
            return li;
        };

        ul.appendChild(crearItem('Anterior', paginaInventarioActual - 1, paginaInventarioActual === 1));

        const start = Math.max(1, paginaInventarioActual - 2);
        const end = Math.min(totalPaginas, start + 4);
        for (let p = start; p <= end; p++) {
            ul.appendChild(crearItem(String(p), p, false, p === paginaInventarioActual));
        }

        ul.appendChild(crearItem('Siguiente', paginaInventarioActual + 1, paginaInventarioActual === totalPaginas));
    }

    function renderTablaPaginadaInventario() {
        const start = (paginaInventarioActual - 1) * limiteInventario;
        const end = start + limiteInventario;
        const paginaDatos = inventarioCompleto.slice(start, end);
        renderTablaInventario(paginaDatos);
    }

    function consultarInventarioCompleto() {
        if (!tablaInventario || !contenedorTablaInventario) return;

        contenedorTablaInventario.style.display = 'block';
        tablaInventario.innerHTML = '<tr><td colspan="7" class="text-center py-3">Cargando inventario...</td></tr>';

        fetch('query_sql/consultas_materiales.php?tipo=inventario')
            .then(res => {
                if (!res.ok) {
                    throw new Error('No se pudo consultar el inventario.');
                }
                return res.json();
            })
            .then(data => {
                if (data && data.status === 'error') {
                    throw new Error(data.message || 'Error al consultar inventario.');
                }

                inventarioCompleto = Array.isArray(data) ? data : (data.datos || []);
                paginaInventarioActual = 1;

                const codigoBuscado = codigoInput.value.trim();
                if (estadoMaterialDiv && codigoBuscado) {
                    const stockTotal = checkStockPorCodigo(inventarioCompleto, codigoBuscado);
                    estadoMaterialDiv.innerHTML = `<span class="badge bg-info text-dark">Stock total para ${codigoBuscado}: ${stockTotal}</span>`;
                }

                renderDashboardInventario(inventarioCompleto);
                renderTablaPaginadaInventario();
                renderPaginacionInventario();
            })
            .catch(error => {
                tablaInventario.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-3">${error.message || 'Error al consultar inventario.'}</td></tr>`;
                const nav = document.getElementById(paginacionInventarioId);
                if (nav) nav.style.display = 'none';
                console.error('Error:', error);
            });
    }

    if (formInventario) {
        formInventario.addEventListener('submit', function (e) {
            e.preventDefault();

            const codigo = codigoInput.value.trim();
            const descripcion = descripcionInput.value.trim();
            const stockMinimo = stockMinimoInput.value.trim();
            const hayCapturaParcial = Boolean(codigo || descripcion || stockMinimo);
            const camposClaveCompletos = Boolean(codigo && descripcion);

            if (hayCapturaParcial && !camposClaveCompletos) {
                mostrarAlerta({
                    icon: 'warning',
                    title: 'Campos incompletos',
                    text: 'Para consultar por material, captura código y descripción.',
                    confirmButtonColor: '#3085d6'
                });
                limpiarFormularioInventario();
                return;
            }

            consultarInventarioCompleto();
        });
    }

    if (inventarioLimiteSelect) {
        inventarioLimiteSelect.addEventListener('change', () => {
            limiteInventario = Number(inventarioLimiteSelect.value) || 5;
            paginaInventarioActual = 1;
            renderTablaPaginadaInventario();
            renderPaginacionInventario();
        });
    }

    // ABRIR MODAL DE MATERIALES CON PAGINACIÓN Y BÚSQUEDA
    BuscarModal('exampleModalCenter', 'contenedor-materiales-modal', 'materiales', 'buscar-material-modal-inventario',
        [
            { header: 'Código', key: 'codigo_material' },
            { header: 'Descripción', key: 'descripcion_material' }
        ],
        (item) => {
            codigoInput.value = item.codigo_material;
            descripcionInput.value = item.descripcion_material;
            buscarMaterialParaInventario(item.codigo_material, descripcionInput, existenciaInput, stockMinimoInput, 'estado-material', {
                unidadSelect,
                estadoSelect,
                categoriaSelect
            });
            const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModalCenter'));
            if (modal) modal.hide();
        },
        'nav-paginacion-materiales',
        'ul-paginacion-materiales'
    );

});