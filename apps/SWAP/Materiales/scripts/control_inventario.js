document.addEventListener('DOMContentLoaded', () => {
    const tabla = document.querySelector('#tabla-body-maestro');
    const inputBusqueda = document.querySelector('#busqueda-inventario');
    const btnRefresh = document.querySelector('#btn-refresh'); // El botón del HTML
    const loader = document.querySelector('#loader-inventario');

    let inventarioLocal = [];

   

    function cargarDatos() {
        loader.classList.remove('d-none');
        setTimeout(() => {
            const registros = JSON.parse(localStorage.getItem('mis_recibos')) || [];
            const inventarioMap = {};

            registros.forEach(reg => {
                const codigo = reg.codigo;
                if (!inventarioMap[codigo]) {
                    inventarioMap[codigo] = {
                        codigo: codigo,
                        nombre: reg.nombre,
                        total: 0,
                        minimo: parseFloat(reg.minimo) || 5,
                        unidad: reg.unidad || 'Pza',
                        ubicacion: reg.ubicacion || 'ALMACÉN'
                    };
                }
                inventarioMap[codigo].total += parseFloat(reg.cuanto);
            });

            inventarioLocal = Object.values(inventarioMap);
            renderizar(inventarioLocal);
            actualizarResumen(inventarioLocal);
            loader.classList.add('d-none');
        }, 500);
    }

    function renderizar(datos) {
        tabla.innerHTML = '';
        if (datos.length === 0) {
            tabla.innerHTML = '<tr><td colspan="6" class="py-5 text-muted">No hay materiales registrados.</td></tr>';
            return;
        }

        datos.forEach(item => {
            const stock = parseFloat(item.total);
            const min = parseFloat(item.minimo) || 1;
            
            // Lógica de Barra (Meta = 3 veces el mínimo)
            const maxVisual = min * 3; 
            let porcentaje = (stock / maxVisual) * 100;
            if (porcentaje > 100) porcentaje = 100; 
            const porcentajeTexto = Math.round(porcentaje);

            // --- LÓGICA DE FRASES ENTENDIBLES ---
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
                                ${stock} <small class="text-muted fw-normal">${item.unidad}</small>
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
        if(totalArt) totalArt.innerText = datos.length;
        if(totalCrit) {
            const criticos = datos.filter(i => parseFloat(i.total) <= (parseFloat(i.minimo) || 0)).length;
            totalCrit.innerText = criticos;
        }
    }

    // El botón Refresh ahora solo recarga localmente por seguridad
    btnRefresh.addEventListener('click', cargarDatos);

    inputBusqueda.addEventListener('input', (e) => {
        const busqueda = e.target.value.toLowerCase().trim();
        if (busqueda === "") { renderizar(inventarioLocal); return; }
        const filtrados = inventarioLocal.filter(item => 
            item.nombre.toLowerCase().includes(busqueda) || 
            item.codigo.toLowerCase().includes(busqueda)
        );
        renderizar(filtrados);
    });

    cargarDatos();
});