document.addEventListener('DOMContentLoaded', () => {
    const btnConsultar = document.getElementById('btn-consultar-entradas');
    const tablaRegistros = document.getElementById('tabla-registros');
    const contenedorTabla = document.getElementById('contenedor-tabla-registros');
    const codigoInput = document.getElementById('codigo');
    const descripcionInput = document.getElementById('descripcion');
    const unidadSelect = document.getElementById('unidad');
    const estadoSelect = document.getElementById('estado');
    const cantidadInput = document.getElementById('cantidad');
    const categoriaSelect = document.getElementById('categoria');



    function TablaConsulta(contenedor, datos, columnas) {
        if (!Array.isArray(datos) || datos.length === 0) {
            contenedor.innerHTML = '<tr><td colspan="' + columnas.length + '">No hay resultados.</td></tr>';
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
                html += `<td>${valor !== undefined ? valor : ''}</td>`;
            });
            html += '</tr>';
        });
        contenedor.innerHTML = html;
    }

    const columnas = [
        { header: 'Folio', key: 'folio_entrada' },
        { header: 'Código', key: 'codigo_material' },
        { header: 'Descripción', key: 'descripcion_material' },
        { header: 'Cantidad', key: 'cantidad' },
        { header: 'Fecha Registro', key: 'fecha_registro' }
    ];

    btnConsultar.addEventListener('click', () => {
    fetch('query_sql/consulta_entrada.php')
        .then(res => res.json())
        .then(data => {
            contenedorTabla.style.display = 'block';
            TablaConsulta(tablaRegistros, data, columnas);
        })
        .catch(error => {
            tablaRegistros.innerHTML = '<tr><td colspan="4">Error al consultar.</td></tr>';
            console.error('Error:', error);
        });
    });
});