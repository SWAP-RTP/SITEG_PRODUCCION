/* ============================================================
    ARCHIVO: CONSULTA DE INVENTARIO MAESTRO
    DESCRIPCIÓN: Gestiona la visualización del stock real desde PostgreSQL.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    const tabla = document.querySelector('#tabla-body-maestro');
    const inputBusqueda = document.querySelector('#busqueda-inventario');
    const btnRefresh = document.querySelector('#btn-refresh'); 
    const loader = document.querySelector('#loader-inventario');

    let inventarioLocal = [];

    // --- IMPLEMENTACIÓN: CARGA REAL DESDE LA BASE DE DATOS ---
    async function cargarDatos() {
        if(loader) loader.classList.remove('d-none');
        
        try {
            // Llamamos a tu nuevo archivo PHP
            const response = await fetch('query_sql/inventario_materiales.php');
            const resultado = await response.json();

            if (resultado.status === 'success') {
                // Guardamos los datos que vienen de PostgreSQL
                inventarioLocal = resultado.data;
                
                // Pintamos la tabla y los cuadros de resumen
                renderizar(inventarioLocal);
                actualizarResumen(inventarioLocal);
            } else {
                console.error("Error del servidor:", resultado.message);
                tabla.innerHTML = `<tr><td colspan="6" class="py-5 text-danger">Error: ${resultado.message}</td></tr>`;
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            tabla.innerHTML = '<tr><td colspan="6" class="py-5 text-danger">Error crítico de conexión al servidor.</td></tr>';
        } finally {
            if(loader) loader.classList.add('d-none');
        }
    }

    function renderizar(datos) {
        tabla.innerHTML = '';
        if (!datos || datos.length === 0) {
            tabla.innerHTML = '<tr><td colspan="6" class="py-5 text-muted">No hay materiales registrados en el inventario.</td></tr>';
            return;
        }

        datos.forEach(item => {
            const stock = parseFloat(item.total) || 0;
            const min = parseFloat(item.minimo) || 1;
            
            // Lógica de barras de progreso
            const maxVisual = min * 3; 
            let porcentaje = (stock / maxVisual) * 100;
            if (porcentaje > 100) porcentaje = 100; 
            if (porcentaje < 0) porcentaje = 0;
            const porcentajeTexto = Math.round(porcentaje);

            let colorBarra = 'bg-success';
            let textoEstado = '<i class="fa-solid fa-check-circle me-1"></i> Stock disponible';
            let badgeColor = 'bg-success-subtle text-success border-success';

            if (stock <= min) {
                colorBarra = 'bg-danger';
                textoEstado = '<i class="fa-solid fa-triangle-exclamation me-1"></i> ¡Surtir de inmediato!';
                badgeColor = 'bg-danger text-white';
            } else if (stock <= min * 1.5) {
                colorBarra = 'bg-warning text-dark';
                textoEstado = '<i class="fa-solid fa-clock me-1"></i> Próximo a agotarse';
                badgeColor = 'bg-warning-subtle text-warning border-warning';
            }

            tabla.innerHTML += `
                <tr>
                    <td class="fw-bold text-secondary small">${item.codigo}</td>
                    <td class="text-start"><div class="fw-bold text-dark">${item.nombre}</div></td>
                    <td style="min-width: 220px;">
                        <div class="d-flex justify-content-between mb-1 small">
                            <span class="fw-bold ${stock <= min ? 'text-danger' : 'text-dark'}">
                                ${stock} ${item.unidad || ''}
                            </span>
                        </div>
                        <div class="progress" style="height: 20px; background-color: #e9ecef; border-radius: 10px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);">
                            <div class="progress-bar progress-bar-striped progress-bar-animated ${colorBarra}" 
                                 role="progressbar" 
                                 style="width: ${porcentaje}%; font-size: 0.8rem; font-weight: bold; line-height: 20px;" 
                                 aria-valuenow="${porcentajeTexto}">
                                ${porcentajeTexto >= 15 ? porcentajeTexto + '%' : ''}
                            </div>
                        </div>
                    </td>
                    <td class="text-muted small">${min}</td>
                    <td><span class="badge bg-light text-dark border">${item.ubicacion}</span></td>
                    <td>
                        <span class="badge-stock ${badgeColor}" style="padding: 8px 15px; border-radius: 20px; font-size: 0.75rem; min-width: 150px; display: inline-block;">
                            ${textoEstado}
                        </span>
                    </td>
                </tr>`;
        });
    }

    function actualizarResumen(datos) {
        const totalArt = document.querySelector('#total-articulos');
        const totalCrit = document.querySelector('#total-critico');
        const contenedorDetalle = document.querySelector('#contenedor-detalles-produccion');

        if(totalArt) totalArt.innerText = datos.length;
        if(totalCrit) {
            const criticos = datos.filter(i => parseFloat(i.total) <= parseFloat(i.minimo)).length;
            totalCrit.innerText = criticos;
        }

        if (contenedorDetalle) {
            contenedorDetalle.innerHTML = ''; 
            datos.forEach(item => {
                const esCritico = parseFloat(item.total) <= parseFloat(item.minimo);
                contenedorDetalle.innerHTML += `
                    <div class="col-6 col-md-3 mb-3">
                        <div class="p-3 border rounded shadow-sm bg-white text-center h-100">
                            <div class="small text-muted text-uppercase fw-bold" style="font-size: 0.65rem;">${item.nombre}</div>
                            <div class="h4 fw-bold mb-0 ${esCritico ? 'text-danger' : 'text-primary'}">${item.total}</div>
                            <div class="text-muted small">${item.unidad || 'Pza'}</div>
                        </div>
                    </div>`;
            });
        }
    }

    // Eventos
    if(btnRefresh) btnRefresh.addEventListener('click', cargarDatos);

    if(inputBusqueda) {
        inputBusqueda.addEventListener('input', (e) => {
            const busqueda = e.target.value.toLowerCase().trim();
            if (busqueda === "") { renderizar(inventarioLocal); return; }
            const filtrados = inventarioLocal.filter(item => 
                item.nombre.toLowerCase().includes(busqueda) || 
                item.codigo.toLowerCase().includes(busqueda)
            );
            renderizar(filtrados);
        });
    }

    // Carga inicial
    cargarDatos();
});