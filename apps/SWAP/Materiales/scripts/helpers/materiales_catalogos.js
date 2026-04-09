(function (global) {
    function llenarSelect(selectElement, data, campoValue, campoText) {
        if (!selectElement) return;

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
    }

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

    function cargarYLlenarSelects(selectors, url = 'query_sql/catalogo_listas.php') {
        return cargarCatalogosMateriales(url)
            .then(catalogos => {
                if (selectors.unidad) {
                    llenarSelect(selectors.unidad, catalogos.unidades, 'id_unidad', 'descripcion_unidad');
                }
                if (selectors.estado) {
                    llenarSelect(selectors.estado, catalogos.estados, 'id_estado_material', 'descripcion_estado_material');
                }
                if (selectors.categoria) {
                    llenarSelect(selectors.categoria, catalogos.categorias, 'id_categoria_material', 'nombre_categoria_material');
                }
            })
            .catch(error => {
                console.error('Error al cargar listas:', error);
                global.MaterialesAlertas.mostrarAlerta({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar las listas.',
                    confirmButtonColor: '#d33'
                });
            });
    }

    global.MaterialesCatalogos = {
        llenarSelect,
        cargarCatalogosMateriales,
        cargarYLlenarSelects
    };

    global.llenarSelect = llenarSelect;
    global.cargarCatalogosMateriales = cargarCatalogosMateriales;
    global.cargarYLlenarSelects = cargarYLlenarSelects;
})(window);
