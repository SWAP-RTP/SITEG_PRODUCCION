document.addEventListener('DOMContentLoaded', function () {
       
    const codigoInput = document.getElementById('codigo');
    const descripcionInput = document.getElementById('descripcion');
    const existenciaInput = document.getElementById('existencia'); 
    const stockMinimoInput = document.getElementById('stock_minimo');
    // Crear o seleccionar el contenedor para el mensaje de advertencia
    let advertenciaExistencia = document.getElementById('advertencia-existencia');
    if (!advertenciaExistencia) {
        advertenciaExistencia = document.createElement('div');
        advertenciaExistencia.id = 'advertencia-existencia';
        advertenciaExistencia.className = 'form-text text-danger fw-bold';
        existenciaInput.parentNode.appendChild(advertenciaExistencia);
    }
     //limpiar 
        const formInventario = document.getElementById('form-inventario-material');
        if (formInventario) {
            formInventario.addEventListener('reset', function () {
                existenciaInput.classList.remove('is-invalid');
                if (advertenciaExistencia) advertenciaExistencia.textContent = '';
            });
        }
    

    // Debounce se usa para moderar las llamadas excesivas
    function debounce(func, delay) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }
    function inventarioMaterial() {
        const codigo = codigoInput.value.trim();
        if (!codigo) {
            descripcionInput.value = '';
            existenciaInput.value = 0;
            if (stockMinimoInput) stockMinimoInput.value = '';
            return;
        }
        console.log('Consultando material con código:', codigo);
        fetch(`query_sql/buscar_material.php?codigo=${encodeURIComponent(codigo)}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    descripcionInput.value = '';
                    existenciaInput.value = 0;
                    if (stockMinimoInput) stockMinimoInput.value = '';
                 
                    console.warn('Error del servidor:', data.error);
                    return;
                }
                    if (data && data.descripcion_material) {
                    descripcionInput.value = data.descripcion_material;
                    existenciaInput.value = data.stock_actual || 0;
                    if (stockMinimoInput) stockMinimoInput.value = data.stock_minimo || '';

                        // Alerta tipo toast si stock actual <= stock mínimo
                        const existencia = parseInt(existenciaInput.value, 10) || 0;
                        const stockMinimo = parseInt(stockMinimoInput.value, 10) || 0;
                        if (existencia <= stockMinimo && stockMinimo > 0) {
                            // Resalta el campo de existencia en rojo
                            existenciaInput.classList.add('is-invalid');
                            advertenciaExistencia.textContent = '¡Advertencia! El stock actual está en el mínimo o por debajo.';
                           
                        } else {
                            existenciaInput.classList.remove('is-invalid');
                            advertenciaExistencia.textContent = '';
                        }
                } else {
                    descripcionInput.value = '';
                    existenciaInput.value = 0;
                    if (stockMinimoInput) stockMinimoInput.value = '';
                }
            })
            .catch(error => {
                descripcionInput.value = '';
                existenciaInput.value = 0;
                if (stockMinimoInput) stockMinimoInput.value = '';
                console.error('Error:', error);
            });
    }
    // Evento input para consulta dinámica usando la nueva función
    codigoInput.addEventListener('input', debounce(inventarioMaterial, 300));
    //funcion que valida el stock actual con el stock minimo y muestra una alerta si es necesario
    function validarStock() {
        if (parseInt(existenciaInput.value, 10) <= parseInt(stockMinimoInput.value, 10)) {
            existenciaInput.classList.add('is-invalid');
            Swal.fire({
                icon: 'warning',
                title: '¡Advertencia!',
                text: 'El stock actual está en el mínimo o por debajo. Considera reabastecer.',
                confirmButtonColor: '#d33'
            });
        } else {
            existenciaInput.classList.remove('is-invalid');
        }
    }
    // Evento input para validar el stock
    existenciaInput.addEventListener('input', validarStock);
    // Mostrar tabla en modal al abrirlo
    const modalBootstrap = document.getElementById('exampleModalCenter');
    if (modalBootstrap) {
        modalBootstrap.addEventListener('shown.bs.modal', () => {
            const contenedor = document.getElementById('contenedor-materiales-modal');
            contenedor.innerHTML = '<div class="text-center p-3"><div class="spinner-border text-primary" role="status"></div></div>';
            fetch('query_sql/modal.php')
                .then(res => res.json())
                .then(data => {
                    mostrarTablaModal(
                        contenedor,
                        data,
                        [
                            { header: 'Código', key: 'codigo_material' },
                            { header: 'Descripción', key: 'descripcion_material' }
                        ],
                        (item) => {
                            codigoInput.value = item.codigo_material;
                            descripcionInput.value = item.descripcion_material;
                            // Si quieres cerrar el modal:
                            const modal = bootstrap.Modal.getInstance(modalBootstrap);
                            if (modal) modal.hide();
                        }
                    );
                })
                .catch(() => contenedor.innerHTML = '<p class="text-danger">Error al cargar los materiales.</p>');
        });
    }
});