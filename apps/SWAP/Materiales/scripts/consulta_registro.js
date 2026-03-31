function inicializarConsultaRegistros(config) {
    const {
        botonId,
        tablaBodyId,
        contenedorId,
        endpoint,
        columnas,
        limite = 10,
        mensajeVacio = 'No hay resultados.'
    } = config;

    const btnConsultar = document.getElementById(botonId);
    const tablaBody = document.getElementById(tablaBodyId);
    const contenedorTabla = document.getElementById(contenedorId);

    if (!btnConsultar || !tablaBody || !contenedorTabla) return;

    let paginaActual = 1;
    let totalPaginas = 1;

    const paginacionId = `paginacion-${tablaBodyId}`;

    function obtenerContenedorPaginacion() {
        let nav = document.getElementById(paginacionId);
        if (!nav) {
            nav = document.createElement('nav');
            nav.id = paginacionId;
            nav.className = 'mt-3';
            nav.setAttribute('aria-label', 'Paginacion de registros');
            nav.innerHTML = '<ul class="pagination justify-content-end mb-0"></ul>';
            contenedorTabla.appendChild(nav);
        }
        return nav;
    }

    function renderTabla(datos) {
        if (!Array.isArray(datos) || datos.length === 0) {
            tablaBody.innerHTML = `<tr><td colspan="${columnas.length}" class="text-center">${mensajeVacio}</td></tr>`;
            return;
        }

        let html = '';
        datos.forEach(item => {
            html += '<tr>';
            columnas.forEach(col => {
                let valor = item[col.key];
                if (col.key === 'fecha_registro' && valor) {
                    valor = valor.substring(0, 10);
                }
                html += `<td>${valor !== undefined && valor !== null ? valor : ''}</td>`;
            });
            html += '</tr>';
        });

        tablaBody.innerHTML = html;
    }

    function renderPaginacion() {
        const nav = obtenerContenedorPaginacion();
        const ul = nav.querySelector('ul');
        ul.innerHTML = '';

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
                    cargarPagina(pagina);
                });
            }

            li.appendChild(a);
            return li;
        };

        ul.appendChild(crearItem('Anterior', paginaActual - 1, paginaActual === 1));

        const start = Math.max(1, paginaActual - 2);
        const end = Math.min(totalPaginas, start + 4);
        for (let p = start; p <= end; p++) {
            ul.appendChild(crearItem(String(p), p, false, p === paginaActual));
        }

        ul.appendChild(crearItem('Siguiente', paginaActual + 1, paginaActual === totalPaginas));
    }

    function construirUrlConPagina(pagina) {
        const sep = endpoint.includes('?') ? '&' : '?';
        return `${endpoint}${sep}pagina=${pagina}&limite=${limite}`;
    }

    function cargarPagina(pagina) {
        fetch(construirUrlConPagina(pagina))
            .then(res => {
                if (!res.ok) {
                    throw new Error('Error al consultar registros.');
                }
                return res.json();
            })
            .then(data => {
                if (data && data.status === 'error') {
                    throw new Error(data.message || 'Error al consultar registros.');
                }

                const datos = Array.isArray(data) ? data : (data.datos || []);
                paginaActual = Number(data.pagina || pagina);
                totalPaginas = Number(data.totalPaginas || 1);

                contenedorTabla.style.display = 'block';
                renderTabla(datos);
                renderPaginacion();
            })
            .catch(error => {
                contenedorTabla.style.display = 'block';
                tablaBody.innerHTML = `<tr><td colspan="${columnas.length}" class="text-center text-danger">${error.message || 'Error al consultar.'}</td></tr>`;
                const nav = document.getElementById(paginacionId);
                if (nav) nav.style.display = 'none';
                console.error('Error:', error);
            });
    }

    btnConsultar.addEventListener('click', () => {
        paginaActual = 1;
        cargarPagina(1);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Configuracion para pantalla de entradas
    if (
        document.getElementById('btn-consultar-entradas') && document.getElementById('tabla-registros') && document.getElementById('contenedor-tabla-registros')
    ) {
        inicializarConsultaRegistros({
            botonId: 'btn-consultar-entradas',
            tablaBodyId: 'tabla-registros',
            contenedorId: 'contenedor-tabla-registros',
            endpoint: 'query_sql/consultas_materiales.php?tipo=entrada',
            columnas: [
                { header: 'Folio', key: 'folio_entrada' },
                { header: 'Codigo', key: 'codigo_material' },
                { header: 'Descripcion', key: 'descripcion_material' },
                { header: 'Cantidad', key: 'cantidad' },
                { header: 'Fecha Registro', key: 'fecha_registro' }
            ],
            limite: 10,
            mensajeVacio: 'No hay resultados de entradas.'
        });
    }

    // Configuracion para pantalla de salidas
    if (
        document.getElementById('btn-consultar-salidas') &&
        document.getElementById('tabla-salidas') &&
        document.getElementById('contenedor-tabla-salidas')
    ) {
        inicializarConsultaRegistros({
            botonId: 'btn-consultar-salidas',
            tablaBodyId: 'tabla-salidas',
            contenedorId: 'contenedor-tabla-salidas',
            endpoint: 'query_sql/consultas_materiales.php?tipo=salida',
            columnas: [
                { header: 'Credencial', key: 'credencial' },
                { header: 'Codigo', key: 'codigo_material' },
                { header: 'Descripcion', key: 'descripcion_material' },
                { header: 'Cantidad', key: 'cantidad' },
                { header: 'Fecha Registro', key: 'fecha_registro' }
            ],
            limite: 10,
            mensajeVacio: 'No hay resultados de salidas.'
        });
    }
});
