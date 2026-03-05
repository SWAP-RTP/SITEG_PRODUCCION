/* ============================================================
    ARCHIVO: CONSULTA DE INVENTARIO - MODO COMPACTO
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    const tabla = document.querySelector('#tabla-body-maestro');
    const loader = document.querySelector('#loader-inventario');
    const buscador = document.getElementById('busqueda-inventario');
    const btnRefresh = document.getElementById('btn-refresh');
    let inventarioLocal = [];

    // --- FORZAR DISEÑO COMPACTO VÍA JS ---
    const aplicarEstilosCompactos = () => {
        const contenedorTabla = document.querySelector('.table-responsive');
        if (contenedorTabla) {
            // Limitamos la altura y forzamos el scroll interno
            contenedorTabla.style.maxHeight = "350px"; 
            contenedorTabla.style.overflowY = "auto";
            contenedorTabla.style.boxShadow = "inset 0 0 10px rgba(0,0,0,0.05)";
        }
    };

    async function cargarDatos() {
        if (loader) loader.classList.remove('d-none');
        try {
            const response = await fetch('query_sql/inventario_materiales.php');
            const res = await response.json();

            if (res.status === 'success') {
                inventarioLocal = res.data || [];
                renderizar(inventarioLocal);
                actualizarResumen(inventarioLocal);
                aplicarEstilosCompactos(); // Se aplica justo después de cargar
            }
        } catch (err) {
            console.error("Error:", err);
        } finally {
            if (loader) loader.classList.add('d-none');
        }
    }

    function renderizar(datos) {
        if (!tabla) return;
        // Usamos una fuente más pequeña y menos padding para ahorrar espacio
        tabla.innerHTML = datos.map(item => {
            const stock = parseFloat(item.total) || 0;
            const min = parseFloat(item.minimo) || 1;
            const colorStock = stock <= min ? 'text-danger fw-bold' : 'text-dark';
            
            return `
                <tr style="font-size: 0.8rem; line-height: 1.2;">
                    <td class="py-1">#${item.codigo}</td>
                    <td class="text-start py-1"><strong>${item.nombre}</strong></td>
                    <td class="py-1 ${colorStock}">${stock}</td>
                    <td class="py-1 text-muted">${min}</td>
                    <td class="py-1"><span class="badge bg-light text-dark border" style="font-size: 0.65rem;">${item.ubicacion || 'N/A'}</span></td>
                    <td class="py-1">
                        <span class="badge ${stock <= min ? 'bg-danger' : 'bg-success'}" style="width: 70px; font-size: 0.6rem;">
                            ${stock <= min ? 'SURTIR' : 'OK'}
                        </span>
                    </td>
                </tr>`;
        }).join('');
    }


    function actualizarResumen(datos) {
        const contenedor = document.querySelector('#contenedor-detalles-produccion');
        if (!contenedor) return;

        // Tarjetas de resumen por artículo
        contenedor.innerHTML = datos.map(item => {
            const stock = parseFloat(item.total) || 0;
            const min = parseFloat(item.minimo) || 1;
            const color = stock <= min ? 'danger' : (stock <= min * 1.5 ? 'warning' : 'success');
            return `
                <div class="col-4 col-md-2 mb-2 px-1">
                    <div class="card h-100 border-0 border-top border-3 border-${color} shadow-sm">
                        <div class="card-body p-1 text-center">
                            <div class="text-truncate fw-bold text-muted" style="font-size: 0.55rem;">${item.nombre}</div>
                            <div class="h6 m-0 fw-bold text-${color}">${stock}</div>
                            <div class="progress" style="height: 3px; margin-top: 2px;">
                                <div class="progress-bar bg-${color}" style="width: ${(stock/(min*2))*100}%"></div>
                            </div>
                        </div>
                    </div>
                </div>`;
        }).join('');

        // Actualizar variedad de productos
        const totalArticulos = document.getElementById('total-articulos');
        if (totalArticulos) {
            totalArticulos.textContent = datos.length;
        }

        // Actualizar alertas de stock crítico
        const totalCriticos = document.getElementById('total-criticos');
        if (totalCriticos) {
            const criticos = datos.filter(item => (parseFloat(item.total) || 0) <= (parseFloat(item.minimo) || 1)).length;
            totalCriticos.textContent = criticos;
        }
    }

    // Buscador
    if (buscador) {
        buscador.addEventListener('input', () => {
            const texto = buscador.value.toUpperCase();
            const filtrados = inventarioLocal.filter(i => 
                i.nombre.toUpperCase().includes(texto) || i.codigo.toUpperCase().includes(texto)
            );
            renderizar(filtrados);
        });
    }

    // Evento para el botón de sincronizar stock
    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            // Feedback visual: deshabilitar mientras carga
            btnRefresh.disabled = true;
            btnRefresh.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sincronizando...';
            cargarDatos().finally(() => {
                btnRefresh.disabled = false;
                btnRefresh.innerHTML = '<i class="fa-solid fa-arrows-rotate me-1"></i> Sincronizar Stock';
            });
        });
    }

    cargarDatos();
});