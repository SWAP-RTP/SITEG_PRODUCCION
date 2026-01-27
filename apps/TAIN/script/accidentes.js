document.addEventListener('DOMContentLoaded', function () {

    const contadoresSimples = document.querySelectorAll('.contador-simple');

    contadoresSimples.forEach(contador => {
        const valorFinal = parseInt(
            contador.dataset.final || contador.innerText.replace(/,/g, ''),
            10
        ) || 0;

        let actual = 0;
        const duracion = 2000;
        const paso = valorFinal / (duracion / 30);

        contador.innerText = '0';

        const intervalo = setInterval(() => {
            actual += paso;

            if (actual >= valorFinal) {
                actual = valorFinal;
                clearInterval(intervalo);
            }

            contador.innerText = Math.floor(actual).toLocaleString('en-US');

        }, 30);
    });

    const DATOS_TABLERO = {
    // Accidentes del periodo actual / previo (para variación)
    periodoActual: 120,
    periodoPrevio: 95,

    // Accidentes por módulo (para módulo más crítico)
    modulos: [
        { nombre: "Oficinas Centrales", accidentes: 1 },
        { nombre: "Módulo 1", accidentes: 450 },
        { nombre: "Módulo 2", accidentes: 143 },
        { nombre: "Módulo 3", accidentes: 300 },
        { nombre: "Módulo 4", accidentes: 338 },
        { nombre: "Módulo 5", accidentes: 115 },
        { nombre: "Módulo 6", accidentes: 170 },
        { nombre: "Módulo 7", accidentes: 108 }
    ],

    // Variación vs mes anterior POR MÓDULO
     variacionPorMes: [
        { nombre: "Oficinas Centrales", meses: { anterior: 8,   actual: 11 } },
        { nombre: "Módulo 1",           meses: { anterior: 120, actual: 150 } },
        { nombre: "Módulo 2",           meses: { anterior: 95,  actual: 100 } },
        { nombre: "Módulo 3",           meses: { anterior: 80,  actual: 72 } },
        { nombre: "Módulo 4",           meses: { anterior: 102, actual: 130 } },
        { nombre: "Módulo 5",           meses: { anterior: 60,  actual: 55 } },
        { nombre: "Módulo 6",           meses: { anterior: 75,  actual: 95 } },
        { nombre: "Módulo 7",           meses: { anterior: 30,  actual: 29 } }
    ],


    // Top 10 rutas riesgosas 
    topRutas: [
        { ruta: "Ruta 120", accidentes: 59 },
        { ruta: "Ruta 76", accidentes: 52 },
        { ruta: "Ruta SEFI", accidentes: 42 },
        { ruta: "Ruta 47X", accidentes: 38 },
        { ruta: "Ruta 110", accidentes: 31 },
        { ruta: "Ruta 52X", accidentes: 29 },
        { ruta: "Ruta SEFIL1", accidentes: 28 },
        { ruta: "Ruta 34A", accidentes: 28 },
        { ruta: "Ruta 9C", accidentes: 28 },
        { ruta: "Ruta 115A", accidentes: 26 }
    ],

     rutasPorModulo: [
        { modulo: "Oficinas Centrales", ruta: "CAPACITACION", accidentes: 1 },
        { modulo: "Módulo 01",         ruta: "120",           accidentes: 58 },
        { modulo: "Módulo 02",         ruta: "34B",           accidentes: 22 },
        { modulo: "Módulo 03",         ruta: "142",           accidentes: 20 },
        { modulo: "Módulo 04",         ruta: "47X",           accidentes: 38 },
        { modulo: "Módulo 05",         ruta: "33",            accidentes: 16 },
        { modulo: "Módulo 06",         ruta: "23",            accidentes: 18 },
        { modulo: "Módulo 07",         ruta: "34A",           accidentes: 28 }
    ],
    
    // Accidentes por tipo
    tipos: {
        labels: [
            "Colisión Laminero",
            "Usuario: caídas/golpes",
            "Otros",
            "Vandalismo",
            "Colisión"
        ],
        totales: [450, 36, 31, 30, 28],

        serieMensual: {
            labels: ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"],
        
            "Colisión Laminero":       [152,36,37,16,13,22,8,16,13,8,6,0],
            "Usuario: caídas/golpes":  [ 12, 4, 1, 5, 2, 1, 0, 1, 0, 0, 1, 0],
            "Otros":                   [ 4, 1, 4, 4, 1, 3, 0, 3, 4, 1, 1, 0],
            "Vandalismo":              [ 11, 4, 3, 2, 1, 1, 1, 1, 0, 0, 1, 0],
            "Colisión":                [ 9, 6, 4, 2, 1, 1, 0, 3, 0, 0, 0, 0]
        }
    },

    // Puntos para el mapa de calor (lat, lng, intensidad)
    heatPoints: [
        [19.433, -99.133, 1.0],
        [19.45,  -99.12, 0.9],
        [19.42,  -99.11, 1.0],
        [19.40,  -99.09, 0.95],
        [19.39,  -99.10, 0.85]
    ]
};

    const tarjetaVariacion    = document.getElementById('valorVariacionMes');
    const tarjetaModuloCrit   = document.getElementById('valorModuloCritico');
    const tarjetaRutaRiesgosa = document.getElementById('valorRutaRiesgosa');

    const variacionPorcentual = ((DATOS_TABLERO.periodoActual - DATOS_TABLERO.periodoPrevio) /
                                 DATOS_TABLERO.periodoPrevio) * 100;

    if (tarjetaVariacion) {
        const signo = variacionPorcentual >= 0 ? "+" : "";
        tarjetaVariacion.textContent = `${signo}${variacionPorcentual.toFixed(1)}%`;
        tarjetaVariacion.style.color = variacionPorcentual >= 0 ? "#4ade80" : "#fb7185";
    }

    const moduloMasCritico = DATOS_TABLERO.modulos.reduce(
        (max, m) => (m.accidentes > max.accidentes ? m : max),
        DATOS_TABLERO.modulos[0]
    );

    if (tarjetaModuloCrit) {
        tarjetaModuloCrit.textContent = `${moduloMasCritico.nombre} (${moduloMasCritico.accidentes})`;
    }

    const rutaMasRiesgosa = DATOS_TABLERO.topRutas[0];
    if (tarjetaRutaRiesgosa) {
        tarjetaRutaRiesgosa.textContent = `${rutaMasRiesgosa.ruta} (${rutaMasRiesgosa.accidentes})`;
    }

    function animarNumeroEnParentesis(selector, duracion = 1500) {
        const elemento = document.querySelector(selector);
        if (!elemento) return;

        const textoOriginal = elemento.innerText.trim();
        const match = textoOriginal.match(/\((\d+)\)/);
        if (!match) return;

        const valorFinal = parseInt(match[1], 10);
        const textoSinNumero = textoOriginal.replace(/\(\d+\)/, '').trim();

        let actual = 0;
        const paso = valorFinal / (duracion / 30);

        const intervalo = setInterval(() => {
            actual += paso;

            if (actual >= valorFinal) {
                actual = valorFinal;
                clearInterval(intervalo);
            }

            const valorMostrado = Math.floor(actual);
            elemento.innerText = `${textoSinNumero} (${valorMostrado})`;

        }, 30);
    }

    animarNumeroEnParentesis('#valorModuloCritico');
    animarNumeroEnParentesis('#valorRutaRiesgosa');

    if (tarjetaVariacion) {
        const textoFinal = tarjetaVariacion.textContent;
        const valorNum = parseFloat(textoFinal);
        let actual = 0;
        const duracion = 800;
        const paso = valorNum / (duracion / 30);
        const signo = valorNum >= 0 ? "+" : "";

        const intervalo = setInterval(() => {
            actual += paso;
            if ((paso >= 0 && actual >= valorNum) || (paso < 0 && actual <= valorNum)) {
                actual = valorNum;
                clearInterval(intervalo);
            }
            tarjetaVariacion.textContent = `${signo}${actual.toFixed(1)}%`;
        }, 30);
    }

    //  PANEL RANKING POR MÓDULOS
 
    const panelRanking = document.getElementById('panelRankingModulos');
    const listaRanking = panelRanking ? panelRanking.querySelector('.lista-modulos-ranking') : null;
    const btnCerrarRanking = document.getElementById('btnCerrarRanking');

    function llenarRankingModulos() {
        if (!panelRanking || !listaRanking) return;

        // limpiar
        listaRanking.innerHTML = "";

        // ordenar módulos por accidentes (desc)
        const modOrdenados = [...DATOS_TABLERO.modulos].sort((a, b) => b.accidentes - a.accidentes);
        const maxAcc = modOrdenados[0]?.accidentes || 1;

        modOrdenados.forEach((m, idx) => {
            const fila = document.createElement('div');
            fila.className = 'item-mod-ranking';

            fila.innerHTML = `
                <div class="etiqueta-mod">
                    ${idx + 1}. ${m.nombre}
                </div>
                <div class="barra-contenedor">
                    <div class="barra-valor" data-valor="${(m.accidentes / maxAcc) * 100}"></div>
                </div>
                <div class="valor-num contador-mod" data-final="${m.accidentes}">
                    0
                </div>
            `;
            listaRanking.appendChild(fila);
        });
    }

    function animarRankingModulos() {
        if (!panelRanking) return;

        panelRanking.querySelectorAll('.barra-valor').forEach(barra => {
            const porcentaje = parseFloat(barra.dataset.valor || "0");
            // pequeño delay para que aproveche el slide
            setTimeout(() => {
                barra.style.width = `${porcentaje}%`;
            }, 80);
        });

        panelRanking.querySelectorAll('.contador-mod').forEach(el => {
            const finalValue = parseInt(el.dataset.final || "0", 10);
            let actual = 0;
            const dur = 800;
            const paso = finalValue / (dur / 30);

            const intv = setInterval(() => {
                actual += paso;
                if (actual >= finalValue) {
                    actual = finalValue;
                    clearInterval(intv);
                }
                el.textContent = Math.floor(actual);
            }, 30);
        });
    }

    function abrirRankingModulos() {
        if (!panelRanking) return;
        llenarRankingModulos();          // llena con datos actuales
        panelRanking.hidden = false;     // lo hace visible en el DOM
        // forzar reflujo para que aplique transición
        void panelRanking.offsetHeight;
        panelRanking.classList.add('mostrar');
        animarRankingModulos();
    }

    function cerrarRankingModulos() {
        if (!panelRanking) return;
        panelRanking.classList.remove('mostrar');
        setTimeout(() => {
            panelRanking.hidden = true;
        }, 400); 
    }

    if (tarjetaModuloCrit && panelRanking) {
        tarjetaModuloCrit.style.cursor = "pointer";
        tarjetaModuloCrit.title = "Ver ranking por módulos";

        tarjetaModuloCrit.addEventListener('click', () => {
            // si ya está abierto, lo cerramos; si no, lo abrimos
            if (panelRanking.hidden || !panelRanking.classList.contains('mostrar')) {
                abrirRankingModulos();
            } else {
                cerrarRankingModulos();
            }
        });
    }

    if (btnCerrarRanking) {
        btnCerrarRanking.addEventListener('click', cerrarRankingModulos);
    }

 
    //  PANEL: VARIACIÓN VS MES ANTERIOR POR MÓDULO
    function construirPanelVariacionMes() {
    const contenedor = document.getElementById('listaVariacionModulos');
    if (!contenedor) return;

    contenedor.innerHTML = '';

    // Convertir datos en lista ordenada
    const variaciones = DATOS_TABLERO.variacionPorMes.map(m => {
        const anterior = m.meses.anterior;
        const actual   = m.meses.actual;
        const dif = actual - anterior;

        const pct = anterior > 0
            ? (dif / anterior) * 100
            : 0;

        return {
            nombre: m.nombre,
            anterior,
            actual,
            variacion: pct
        };
    }).sort((a, b) => b.variacion - a.variacion);

    // Escalado de barras
    const maxAbs = Math.max(...variaciones.map(v => Math.abs(v.variacion))) || 1;

    variaciones.forEach((m, i) => {
        const fila = document.createElement('div');
        fila.className = 'fila-variacion';

        const indice = document.createElement('div');
        indice.className = 'indice';
        indice.textContent = i + 1;

        const nombre = document.createElement('div');
        nombre.className = 'nombre-mod';
        nombre.textContent = m.nombre;

        const contenedorBarra = document.createElement('div');
        contenedorBarra.className = 'contenedor-barra';

        const barra = document.createElement('div');
        barra.className = 'barra-fill ' + (m.variacion >= 0 ? 'barra-positiva' : 'barra-negativa');
        barra.style.width = '0%'; // animación

        const ancho = (Math.abs(m.variacion) / maxAbs) * 100;

        contenedorBarra.appendChild(barra);

        const valor = document.createElement('div');
        valor.className = 'valor-var';
        const signo = m.variacion > 0 ? '+' : '';
        valor.textContent = `${signo}${m.variacion.toFixed(1)}%`;

        fila.appendChild(indice);
        fila.appendChild(nombre);
        fila.appendChild(contenedorBarra);
        fila.appendChild(valor);

        contenedor.appendChild(fila);

        // animar barra
        requestAnimationFrame(() => {
            barra.style.width = `${ancho}%`;
        });
    });
}


    // Click en la tarjeta "Variación vs Mes Anterior"
    const cardVariacionMes = document.querySelector('.card-indicador.ind-variacion');
    const panelVariacionMes = document.getElementById('panelVariacionMes');
    let panelVariacionConstruido = false;

    if (cardVariacionMes && panelVariacionMes) {
        cardVariacionMes.style.cursor = 'pointer';

        cardVariacionMes.addEventListener('click', () => {
            const visible = panelVariacionMes.classList.contains('mostrar');

            if (!visible) {
                // primera vez que lo abrimos -> construimos ranking
                if (!panelVariacionConstruido) {
                    construirPanelVariacionMes();
                    panelVariacionConstruido = true;
                }
                panelVariacionMes.removeAttribute('hidden');
                // pequeño delay para que el transition agarre
                requestAnimationFrame(() => {
                    panelVariacionMes.classList.add('mostrar');
                });
            } else {
                panelVariacionMes.classList.remove('mostrar');
                // esperamos a que termine la animación para ocultar
                setTimeout(() => {
                    panelVariacionMes.setAttribute('hidden', 'true');
                }, 500);
            }
        });
    }

//  PANEL: RUTAS TOP POR MÓDULO
const cardRuta       = document.querySelector('.card-indicador.ind-ruta');
const panelRutas     = document.getElementById('panelRutasModulos');
const listaRutas     = panelRutas ? panelRutas.querySelector('#listaRutasModulos') : null;
const btnCerrarRutas = document.getElementById('btnCerrarRutas');
let panelRutasConstruido = false;

function construirPanelRutas() {
    if (!panelRutas || !listaRutas) return;

    listaRutas.innerHTML = '';

    // Ordenar por accidentes desc
    const datosOrdenados = [...DATOS_TABLERO.rutasPorModulo]
        .sort((a, b) => b.accidentes - a.accidentes);

    const maxAcc = datosOrdenados[0]?.accidentes || 1;

    datosOrdenados.forEach((item, idx) => {
        const fila = document.createElement('div');
        fila.className = 'fila-ruta-mod';

        const indice = document.createElement('div');
        indice.className = 'indice';
        indice.textContent = idx + 1;

        const contTexto = document.createElement('div');
        contTexto.className = 'cont-texto-ruta';
        contTexto.innerHTML = `
            <div class="nombre-modulo">${item.modulo}</div>
            <div class="nombre-ruta">Ruta ${item.ruta}</div>
        `;

        const contBarra = document.createElement('div');
        contBarra.className = 'contenedor-barra-ruta';

        const barra = document.createElement('div');
        barra.className = 'barra-ruta';
        barra.style.width = '0%';

        const ancho = (item.accidentes / maxAcc) * 100;
        contBarra.appendChild(barra);

        const valor = document.createElement('div');
        valor.className = 'valor-ruta';
        valor.textContent = item.accidentes;

        fila.appendChild(indice);
        fila.appendChild(contTexto);
        fila.appendChild(contBarra);
        fila.appendChild(valor);

        listaRutas.appendChild(fila);

        requestAnimationFrame(() => {
            barra.style.width = `${ancho}%`;
        });
    });
}

// "Ruta más riesgosa"
if (cardRuta && panelRutas) {
    cardRuta.style.cursor = 'pointer';

    cardRuta.addEventListener('click', () => {
        const visible = panelRutas.classList.contains('mostrar');

        if (!visible) {
            if (!panelRutasConstruido) {
                construirPanelRutas();
                panelRutasConstruido = true;
            }
            panelRutas.removeAttribute('hidden');
            requestAnimationFrame(() => {
                panelRutas.classList.add('mostrar');
            });
        } else {
            panelRutas.classList.remove('mostrar');
            setTimeout(() => {
                panelRutas.setAttribute('hidden', 'true');
            }, 500);
        }
    });
}

if (btnCerrarRutas && panelRutas) {
    btnCerrarRutas.addEventListener('click', () => {
        panelRutas.classList.remove('mostrar');
        setTimeout(() => {
            panelRutas.setAttribute('hidden', 'true');
        }, 500);
    });
}


    const opcionesComunXY = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                ticks: { color: '#ffffff', font: { size: 11 } },
                grid: { color: 'rgba(255,255,255,0.1)' }
            },
            y: {
                beginAtZero: true,
                ticks: { color: '#ffffff', font: { size: 11 } },
                grid: { color: 'rgba(255,255,255,0.1)' }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: '#ffffff',
                    font: { size: 11 }
                }
            },
            tooltip: {
                callbacks: {
                    label: function (ctx) {
                        const etiqueta = ctx.dataset.label || ctx.label || '';
                        const valor = ctx.parsed.y ?? ctx.parsed;
                        return `${etiqueta}: ${valor}`;
                    }
                }
            }
        },
        layout: { padding: 10 }
    };

    // // ==========================
    // //  MAPA DE CALOR
    // // ==========================
    // const mapaDiv = document.getElementById('mapaCalor');

    // if (mapaDiv && window.L && L.heatLayer) {
    //     const centroCDMX = [19.433, -99.133];

    //     const mapa = L.map(mapaDiv).setView(centroCDMX, 12);
    //     window.mapaAcc = mapa;

    //     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    //         maxZoom: 19,
    //         attribution: "© OpenStreetMap",
       
    //     }).addTo(mapa);

    //     const basePoints = (Array.isArray(DATOS_TABLERO.heatPoints) && DATOS_TABLERO.heatPoints.length > 0)
    //         ? DATOS_TABLERO.heatPoints
    //         : [[19.433, -99.133, 1]];

    //     const puntosCalor = [];
    //     basePoints.forEach(([lat, lng, intensidad = 1]) => {
    //         for (let i = 0; i < 80; i++) {
    //             const jitterLat = lat + (Math.random() - 0.5) * 0.01;
    //             const jitterLng = lng + (Math.random() - 0.5) * 0.01;
    //             puntosCalor.push([jitterLat, jitterLng, intensidad]);
    //         }
    //     });

    //     window.capaHeatAcc = L.heatLayer(puntosCalor, {
    //         radius: 45,
    //         blur: 25,
    //         maxZoom: 17,
    //         minOpacity: 0.6,
    //         gradient: {
    //             0.0: "rgba(0,0,255,0)",
    //             0.4: "rgba(0,150,255,0.7)",
    //             0.65: "rgba(255,255,0,0.8)",
    //             1.0: "rgba(255,0,0,1)"
    //         }
    //     }).addTo(mapa);
    // }

   
    //  GRÁFICA: ACCIDENTES POR TIPO (BARRAS)
    const lienzoTipos = document.getElementById("grafTipos");
    if (lienzoTipos) {
        new Chart(lienzoTipos, {
            type: "bar",
            data: {
                labels: DATOS_TABLERO.tipos.labels,
                datasets: [{
                    label: "Accidentes",
                    data: DATOS_TABLERO.tipos.totales,
                    backgroundColor: ["#4da3ff","#ff6b81","#ffbf42","#34d399","#a78bfa"],
                    borderColor: "#0e1a2b",
                    borderWidth: 1
                }]
            },
            options: opcionesComunXY
        });
    }


    //  GRÁFICA: ACCIDENTES EN EL TIEMPO (LÍNEAS)
    const lienzoTiempo = document.getElementById("grafTiempoLineal");
    if (lienzoTiempo) {
        const serie = DATOS_TABLERO.tipos.serieMensual;
        new Chart(lienzoTiempo, {
            type: "line",
            data: {
                labels: serie.labels,
                datasets: [
                    {
                        label: "Colisión Laminero",
                        data: serie["Colisión Laminero"],
                        borderColor: "#4da3ff",
                        pointBackgroundColor: "#4da3ff",
                        tension: 0.3,
                        borderWidth: 2
                    },
                    {
                        label: "Usuario: caídas/golpes",
                        data: serie["Usuario: caídas/golpes"],
                        borderColor: "#34d399",
                        pointBackgroundColor: "#34d399",
                        tension: 0.3,
                        borderWidth: 2
                    },
                    {
                        label: "Otros",
                        data: serie["Otros"],
                        borderColor: "#f97316",
                        pointBackgroundColor: "#f97316",
                        tension: 0.3,
                        borderWidth: 2
                    },
                    {
                        label: "Vandalismo",
                        data: serie["Vandalismo"],
                        borderColor: "#eab308",
                        pointBackgroundColor: "#eab308",
                        tension: 0.3,
                        borderWidth: 2
                    },
                    {
                        label: "Colisión",
                        data: serie["Colisión"],
                        borderColor: "#a855f7",
                        pointBackgroundColor: "#a855f7",
                        tension: 0.3,
                        borderWidth: 2
                    }
                ]
            },
            options: opcionesComunXY
        });
    }

 
    //  GRÁFICA: TOP 10 RUTAS (BARRAS HORIZONTALES)
    const lienzoTopRutas = document.getElementById("grafTopRutas");
    if (lienzoTopRutas) {

        const etiquetasRutas = DATOS_TABLERO.topRutas.map(r => r.ruta);
        const valoresRutas   = DATOS_TABLERO.topRutas.map(r => r.accidentes);

        const colores = [
            "#f97316","#4da3ff","#34d399","#ff6b81","#a78bfa",
            "#ffbf42","#00c2d1","#ff8f6b","#86efac","#c084fc"
        ];

        new Chart(lienzoTopRutas, {
            type: "bar",
            data: {
                labels: etiquetasRutas,
                datasets: [{
                    label: "Accidentes",
                    data: valoresRutas,
                    backgroundColor: colores.slice(0, valoresRutas.length),
                    borderColor: "#0e1a2b",
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { color: "#ffffff", font: { size: 11 } },
                        grid: { color: "rgba(255,255,255,0.1)" }
                    },
                    y: {
                        ticks: { color: "#ffffff", font: { size: 11 } },
                        grid: { color: "rgba(255,255,255,0.1)" }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: "#ffffff",
                            font: { size: 11 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (ctx) {
                                const ruta  = ctx.label;
                                const valor = ctx.parsed.x ?? ctx.parsed;
                                return `${ruta}: ${valor} accidentes`;
                            }
                        }
                    }
                },
                layout: { padding: 10 }
            }
        });
    }

    //  TABLA + PAGINACIÓN + FILTROS
    const tabla = document.getElementById('tablaSeguridad');
    if (!tabla) return;

    const cuerpoTabla  = tabla.querySelector('tbody');
    const filas        = Array.from(cuerpoTabla.querySelectorAll('tr'));
    const inputsFiltro = tabla.querySelectorAll('thead input');
    const contPaginado = document.getElementById('paginacionSeg');
    const filasPorPagina = 10;
    let paginaActual = 1;
    let filtros = ['', '', '', '', '', ''];

    function obtenerFilasFiltradas() {
        return filas.filter(fila => {
            const celdas = fila.querySelectorAll('td');
            for (let i = 0; i < filtros.length; i++) {
                const textoFiltro = filtros[i].trim().toLowerCase();
                if (textoFiltro !== '') {
                    const textoCelda = (celdas[i].innerText || '').toLowerCase();
                    if (!textoCelda.includes(textoFiltro)) return false;
                }
            }
            return true;
        });
    }

    function dibujarTabla() {
        const filtradas = obtenerFilasFiltradas();
        const totalFilas = filtradas.length;
        const totalPaginas = Math.ceil(totalFilas / filasPorPagina) || 1;

        if (paginaActual > totalPaginas) paginaActual = totalPaginas;

        filas.forEach(f => f.style.display = 'none');

        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const paginaFilas = filtradas.slice(inicio, fin);
        paginaFilas.forEach(f => f.style.display = '');

        contPaginado.innerHTML = '';

        const btnPrev = document.createElement('button');
        btnPrev.textContent = 'Anterior';
        btnPrev.disabled = paginaActual === 1;
        btnPrev.className = 'btn btn-sm btn-outline-info me-1';
        btnPrev.onclick = () => {
            if (paginaActual > 1) {
                paginaActual--;
                dibujarTabla();
            }
        };
        contPaginado.appendChild(btnPrev);

        for (let i = 1; i <= totalPaginas; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className = 'btn btn-sm btn-outline-info me-1';
            if (i === paginaActual) btn.classList.add('active');
            btn.onclick = () => {
                paginaActual = i;
                dibujarTabla();
            };
            contPaginado.appendChild(btn);
        }

        const btnNext = document.createElement('button');
        btnNext.textContent = 'Siguiente';
        btnNext.disabled = paginaActual === totalPaginas;
        btnNext.className = 'btn btn-sm btn-outline-info';
        btnNext.onclick = () => {
            if (paginaActual < totalPaginas) {
                paginaActual++;
                dibujarTabla();
            }
        };
        contPaginado.appendChild(btnNext);
    }

    inputsFiltro.forEach((input, index) => {
        input.addEventListener('input', () => {
            filtros[index] = input.value;
            paginaActual = 1;
            dibujarTabla();
        });
    });

    dibujarTabla();


    //  BOTONES GRÁFICAS / TABLA
    const btnVerGraficas   = document.getElementById('btnVerGraficas');
    const btnVerTabla      = document.getElementById('btnVerTabla');
    const seccionGraficas  = document.getElementById('seccionGraficas');
    const seccionTabla     = document.getElementById('seccionTabla');
    const contenedorTabla  = document.querySelector('.table-container');

    if (btnVerGraficas && btnVerTabla && seccionGraficas && seccionTabla) {
        btnVerGraficas.addEventListener('click', () => {
            btnVerGraficas.classList.add('active');
            btnVerTabla.classList.remove('active');
            seccionGraficas.style.display = '';
            seccionTabla.style.display = '';
            seccionGraficas.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        btnVerTabla.addEventListener('click', () => {
            btnVerTabla.classList.add('active');
            btnVerGraficas.classList.remove('active');
            seccionGraficas.style.display = '';
            seccionTabla.style.display = '';
            contenedorTabla.classList.add('resaltar');
            contenedorTabla.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => contenedorTabla.classList.remove('resaltar'), 1000);
        });
    }


    //  EXPORTAR CSV / EXCEL
    function exportFilasAObjeto() {
        const ths = tabla.querySelectorAll('thead th');
        const encabezados = Array.from(ths).map(th =>
            (th.childNodes[0].textContent || '').trim()
        );

        const datosFiltrados = obtenerFilasFiltradas().map(tr => {
            const celdas = tr.querySelectorAll('td');
            return Array.from(celdas).map(td => td.innerText.trim());
        });

        return { encabezados, datosFiltrados };
    }

    function exportarCSV(nombreArchivo) {
        const { encabezados, datosFiltrados } = exportFilasAObjeto();
        let filasCSV = [];
        filasCSV.push(encabezados.join(','));

        datosFiltrados.forEach(row => {
            const fila = row.map(valor => {
                let v = valor.replace(/"/g, '""');
                if (v.search(/("|,|\n)/g) >= 0) v = `"${v}"`;
                return v;
            }).join(',');
            filasCSV.push(fila);
        });

        const csvString = filasCSV.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute('download', nombreArchivo);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    function exportarExcel(nombreArchivo) {
        const { encabezados, datosFiltrados } = exportFilasAObjeto();
        let html = '<table border="1"><thead><tr>';

        encabezados.forEach(h => { html += `<th>${h}</th>`; });
        html += '</tr></thead><tbody>';

        datosFiltrados.forEach(row => {
            html += '<tr>';
            row.forEach(col => { html += `<td>${col}</td>`; });
            html += '</tr>';
        });

        html += '</tbody></table>';

        const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute('download', nombreArchivo);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    const btnExportCSV   = document.getElementById('btnExportCSV');
    const btnExportExcel = document.getElementById('btnExportExcel');

    if (btnExportCSV) {
        btnExportCSV.addEventListener('click', () => {
            exportarCSV('accidentes_incidentes.csv');
        });
    }

    if (btnExportExcel) {
        btnExportExcel.addEventListener('click', () => {
            exportarExcel('accidentes_incidentes.xls');
        });
    }

    const btnCargarAcc = document.getElementById('btnCargarAcc');
    if (btnCargarAcc) {
        btnCargarAcc.addEventListener('click', () => {
            console.log('');
        });
    }
});