// ======================================================================
// DATOS DE EJEMPLO (por módulo), incluye porcentajes y desglose
// ======================================================================
export function indi_modulos(){
    const datosModulos = {
        "Oficinas Centrales": {
            porcentajes: { operable: 60, enRuta: 22, disponible: 10, mantenimiento: 6, especiales: 2 },
            desglose: {
                operable:      { Expresos: 6, Ordinarios: 20, Articulados: 8, Nochebus: 2 },
                enRuta:        { Expresos: 5, Ordinarios: 10, Articulados: 3, Nochebus: 2 },
                disponible:    { Expresos: 2, Ordinarios: 5, Articulados: 1, Nochebus: 1 },
                mantenimiento: { Expresos: 1, Ordinarios: 2, Articulados: 1, Nochebus: 2 },
                especiales:    { Expresos: 0, Ordinarios: 1, Articulados: 0, Nochebus: 1 }
            },
        },
    
        "Módulo 1": {
            porcentajes: { operable: 70, enRuta: 15, disponible: 8, mantenimiento: 5, especiales: 2 },
            desglose: {
                operable:      { Expresos: 12, Ordinarios: 20, Articulados: 5, Nochebus: 2 },
                enRuta:        { Expresos: 3, Ordinarios: 10, Articulados: 4, Nochebus: 1 },
                disponible:    { Expresos: 1, Ordinarios: 5, Articulados: 2, Nochebus: 1 },
                mantenimiento: { Expresos: 0, Ordinarios: 2, Articulados: 1, Nochebus: 1 },
                especiales:    { Expresos: 0, Ordinarios: 1, Articulados: 0, Nochebus: 0 }
            },
            salidas: 20,
            entradas: 15
        },
    
        "Módulo 2": {
            porcentajes: { operable: 62, enRuta: 20, disponible: 10, mantenimiento: 6, especiales: 2 },
            desglose: {
                operable:      { Expresos: 10, Ordinarios: 22, Articulados: 6, Nochebus: 2 },
                enRuta:        { Expresos: 4, Ordinarios: 12, Articulados: 3, Nochebus: 0 },
                disponible:    { Expresos: 2, Ordinarios: 6, Articulados: 1, Nochebus: 0 },
                mantenimiento: { Expresos: 1, Ordinarios: 2, Articulados: 2, Nochebus: 1 },
                especiales:    { Expresos: 0, Ordinarios: 1, Articulados: 0, Nochebus: 0 }
            },
            salidas: 20,
            entradas: 15
        },
    
        "Módulo 3": {
            porcentajes: { operable: 68, enRuta: 18, disponible: 8, mantenimiento: 4, especiales: 2 },
            desglose: {
                operable:      { Expresos: 11, Ordinarios: 18, Articulados: 6, Nochebus: 3 },
                enRuta:        { Expresos: 5, Ordinarios: 7, Articulados: 3, Nochebus: 1 },
                disponible:    { Expresos: 2, Ordinarios: 4, Articulados: 1, Nochebus: 0 },
                mantenimiento: { Expresos: 0, Ordinarios: 1, Articulados: 1, Nochebus: 2 },
                especiales:    { Expresos: 0, Ordinarios: 1, Articulados: 0, Nochebus: 0 }
            },
            salidas: 20,
            entradas: 15
        },
    
        "Módulo 4": {
            porcentajes: { operable: 66, enRuta: 19, disponible: 9, mantenimiento: 5, especiales: 1 },
            desglose: {
                operable:      { Expresos: 9, Ordinarios: 20, Articulados: 7, Nochebus: 2, Metrobus: 2 },
                enRuta:        { Expresos: 3, Ordinarios: 10, Articulados: 4, Nochebus: 1, Metrobus: 2 },
                disponible:    { Expresos: 2, Ordinarios: 4, Articulados: 2, Nochebus: 0, Metrobus: 2 },
                mantenimiento: { Expresos: 1, Ordinarios: 2, Articulados: 1, Nochebus: 1, Metrobus: 2 },
                especiales:    { Expresos: 0, Ordinarios: 1, Articulados: 0, Nochebus: 0 }
            },
            salidas: 20,
            entradas: 15
        },
    
        "Módulo 5": {
            porcentajes: { operable: 72, enRuta: 14, disponible: 7, mantenimiento: 5, especiales: 2 },
            desglose: {
                operable:      { Expresos: 14, Ordinarios: 18, Articulados: 6, Nochebus: 2 },
                enRuta:        { Expresos: 3, Ordinarios: 8, Articulados: 2, Nochebus: 0 },
                disponible:    { Expresos: 1, Ordinarios: 4, Articulados: 1, Nochebus: 0 },
                mantenimiento: { Expresos: 0, Ordinarios: 2, Articulados: 0, Nochebus: 1 },
                especiales:    { Expresos: 0, Ordinarios: 1, Articulados: 0, Nochebus: 0 }
            },
            salidas: 20,
            entradas: 15
        },
    
        "Módulo 6": {
            porcentajes: { operable: 64, enRuta: 18, disponible: 11, mantenimiento: 5, especiales: 2 },
            desglose: {
                operable:      { Expresos: 10, Ordinarios: 16, Articulados: 7, Nochebus: 3 },
                enRuta:        { Expresos: 4, Ordinarios: 8, Articulados: 3, Nochebus: 1 },
                disponible:    { Expresos: 2, Ordinarios: 6, Articulados: 2, Nochebus: 0 },
                mantenimiento: { Expresos: 1, Ordinarios: 2, Articulados: 1, Nochebus: 1 },
                especiales:    { Expresos: 0, Ordinarios: 1, Articulados: 0, Nochebus: 0 }
            },
            salidas: 20,
            entradas: 15
        },
    
        "Módulo 7": {
            porcentajes: { operable: 63, enRuta: 20, disponible: 10, mantenimiento: 5, especiales: 2 },
            desglose: {
                operable:      { Expresos: 9, Ordinarios: 18, Articulados: 8, Nochebus: 2 },
                enRuta:        { Expresos: 5, Ordinarios: 8, Articulados: 3, Nochebus: 2 },
                disponible:    { Expresos: 2, Ordinarios: 5, Articulados: 2, Nochebus: 0 },
                mantenimiento: { Expresos: 1, Ordinarios: 2, Articulados: 1, Nochebus: 1 },
                especiales:    { Expresos: 0, Ordinarios: 1, Articulados: 0, Nochebus: 0 }
            },
            salidas: 20,
            entradas: 15
        }
    };
    
    
    
    // ======================================================================
    // BOTÓN DE FILTROS – LÓGICA FUTURA PARA CONEXIÓN A BACKEND
    // ======================================================================
    const btnCargar = document.getElementById("btnCargar");
    if (btnCargar) {
        btnCargar.addEventListener("click", () => {
            // Integración futura con backend
            alert("Aquí se aplicarán los filtros cuando conectes el backend.");
        });
    }
    
    // ======================================================================
    // CLICK EN CARDS – ABRIR MODAL Y RELLENAR DATOS
    // ======================================================================
    document.querySelectorAll(".card-info").forEach(card => {
        card.addEventListener("click", () => {
            const moduleName = card.dataset.module || card.querySelector("h3").textContent.trim();
            const info = datosModulos[moduleName];
    
            // Si no hay datos para el módulo, mostramos un aviso simple
            if (!info) {
                // construir una estructura vacía conservadora
                alert("No hay datos de ejemplo para: " + moduleName);
                return;
            }
    
            // Título del modal
            document.getElementById("tituloModalModulo").textContent = moduleName;
    
            // Contenedor donde inyectaremos las tarjetas de segmentos
            const cont = document.getElementById("contenedorDetallesModulo");
            cont.innerHTML = "";
    
            // CARD DE NETRADAS Y SALIDAS POR MODULO
            cont.innerHTML += `
                <div class="d-flex gap-3">
                    <div class="col card-segmento">
                        <p class="m-0 fs-3"><strong>Entradas:</strong> ${info.entradas}</p>
                    </div>
                    <div class="col card-segmento">
                        <p class="m-0 fs-3"><strong>Salidas:</strong> ${info.salidas}</p>
                    </div>
                </div>
            `;
    
            const segmentos = [
                { key: "operable", titulo: "Operable" },
                { key: "enRuta", titulo: "En Ruta" },
                { key: "disponible", titulo: "Disponible" },
                { key: "mantenimiento", titulo: "Mantenimiento" },
                { key: "especiales", titulo: "Servicios Especiales" }
            ];
    
            // Categorías internas
            const categorias = ["Expresos", "Ordinarios", "Articulados", "Nochebus", "Metrobus"];
    
            segmentos.forEach(seg => {
                const pct = info.porcentajes[seg.key] ?? 0;
                const desg = info.desglose[seg.key] ?? { Expresos:0, Ordinarios:0, Articulados:0, Nochebus:0, Metrobus:0};
    
                // construir lista
                let listaHtml = "";
                categorias.forEach(cat => {
                    const val = desg[cat] ?? 0;
                    listaHtml += `<li><strong>${cat}:</strong> ${val}</li>`;
                });
    
                cont.innerHTML += `
                    <div class="col-lg-4 col-md-6 col-12">
                        <div class="card-segmento">
                            <h3>${seg.titulo}</h3>
                            <div class="porcentaje">${pct}%</div>
                            <ul>
                                ${listaHtml}
                            </ul>
                        </div>
                    </div>
                `;
            });
    
            // Mostrar modal (Bootstrap 5)
            const bsModal = new bootstrap.Modal(document.getElementById("modalDetalleModulo"));
            bsModal.show();
        });
    });
}

export function grafica_lineal(){
    const labels = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    const data = {
        labels: labels,

        datasets: [
            {
                label: 'Modulo 1',
                data: [10, 20, 30, 25, 40, 35, 50, 80, 50, 60, 60, 70],
                fill: false,
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            },
            {
                label: 'Modulo 2',
                data: [5, 15, 10, 20, 15, 10, 25, 50, 50, 30, 40, 40],
                fill: false,
                borderColor: 'rgb(54, 162, 235)',
                tension: 0.1
            },
            {
                label: 'Modulo 3',
                data: [12, 18, 22, 30, 28, 26, 34, 50, 50, 40, 40, 30],
                fill: false,
                borderColor: 'rgb(255, 205, 86)',
                tension: 0.1
            },
            {
                label: 'Modulo 4',
                data: [30, 28, 35, 40, 38, 42, 45, 50, 60, 60, 30, 20],
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            },
            {
                label: 'Modulo 5',
                data: [30, 28, 35, 40, 38, 42, 45, 50, 60, 60, 30, 20],
                fill: false,
                borderColor: 'rgba(255, 0, 255, 1)',
                tension: 0.1
            },
            {
                label: 'Modulo 6',
                data: [10, 20, 30, 25, 40, 35, 50, 80, 50, 60, 60, 70],
                fill: false,
                borderColor: 'rgba(87, 90, 255, 1)',
                tension: 0.1
            },
            {
                label: 'Modulo 7',
                data: [5, 15, 10, 20, 15, 10, 25, 50, 50, 30, 40, 40],
                fill: false,
                borderColor: 'rgba(255, 102, 0, 1)',
                tension: 0.1
            }
        ]
    };

    const config = {
        type: 'line',
        data: data,
    };

    const ctx = document.getElementById('pastelChart2').getContext('2d');
    new Chart(ctx, config);
}