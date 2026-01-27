document.addEventListener('DOMContentLoaded', () => {

    const DATOS_RUTAS = [
        // módulo 1
        { id: 1,  modulo: 1, ruta: "9-C",   origen: "CENTRO COMERCIAL SANTA FE",    destino: "PUERTA GRANDE" },
        { id: 2,  modulo: 1, ruta: "76",    origen: "CENTRO COMERCIAL SANTA FE",    destino: "METRO AUDITORIO POR PALMAS" },
        { id: 3,  modulo: 1, ruta: "76-A",  origen: "CENTRO COMERCIAL SANTA FE",    destino: "METRO AUDITORIO POR REFORMA" },
        { id: 4,  modulo: 1, ruta: "110",   origen: "SAN PABLO CHIMALPA",           destino: "METRO TACUBAYA" },
        { id: 5,  modulo: 1, ruta: "110-B", origen: "SAN LORENZO ACOPILCO",         destino: "METRO TACUBAYA" },
        { id: 6,  modulo: 1, ruta: "110-C", origen: "LA PILA",                      destino: "METRO TACUBAYA" },
        { id: 7,  modulo: 1, ruta: "112",   origen: "AMPLIACIÓN JALALPA",           destino: "METRO TACUBAYA (AV. JALISCO)" },
        { id: 8,  modulo: 1, ruta: "113-B", origen: "COL. NAVIDAD (LAS PIEDRAS)",   destino: "METRO TACUBAYA" },
        { id: 9,  modulo: 1, ruta: "114",   origen: "JESÚS DEL MONTE (CUAJIMALPA)", destino: "METRO TACUBAYA (AV. JALISCO)" },
        { id: 10, modulo: 1, ruta: "115-A", origen: "LAS ÁGUILAS",                  destino: "METRO CHAPULTEPEC" },
        { id: 11, modulo: 1, ruta: "118",   origen: "SANTA ROSA XOCHIAC",           destino: "METRO MIXCOAC" },
        { id: 12, modulo: 1, ruta: "118-A", origen: "SANTA ROSA XOCHIAC",           destino: "METRO TACUBAYA (AV. JALISCO)" },
        { id: 13, modulo: 1, ruta: "119",   origen: "PILOTO",                       destino: "METRO TACUBAYA (AV. JALISCO)" },
        { id: 14, modulo: 1, ruta: "119-B", origen: "PRESIDENTES",                  destino: "METRO MIXCOAC" },
        { id: 15, modulo: 1, ruta: "120",   origen: "SAN MATEO TLALTENANGO",        destino: "METRO ZAPATA" },
        { id: 16, modulo: 1, ruta: "121",   origen: "SAN BARTOLO AMEYALCO",         destino: "METRO ZAPATA" },
        { id: 17, modulo: 1, ruta: "124",   origen: "PUERTA GRANDE",                destino: "METRO MIXCOAC" },
        { id: 18, modulo: 1, ruta: "124-A", origen: "AMPLIACIÓN TEPEACA",           destino: "METRO MIXCOAC" },
        { id: 19, modulo: 1, ruta: "9D",    origen: "CENTRO COMERCIAL SANTA FE",    destino: "SAN BARTOLO" },

        // módulo 2
        { id: 20, modulo: 2, ruta: "2-A",   origen: "SAN PEDRO MÁRTIR POR FOVISSSTE",           destino: "IZAZAGA (METRO PINO SUÁREZ)" },
        { id: 21, modulo: 2, ruta: "13-A",  origen: "PARQUE MÉXICO/METRO CHAPULTEPEC",          destino: "PEDREGAL DE SAN NICOLÁS/TORRES DE PADIERNA" },
        { id: 22, modulo: 2, ruta: "17-E",  origen: "METRO UNIVERSIDAD",                        destino: "SAN PEDRO MÁRTIR POR CARRETERA FEDERAL" },
        { id: 23, modulo: 2, ruta: "17",    origen: "METRO TASQUEÑA",                           destino: "SAN PEDRO MÁRTIR POR FOVISSSTE" },
        { id: 24, modulo: 2, ruta: "34-B",  origen: "PARQUE DE LA BOMBILLA",                    destino: "CENTRO COMERCIAL SANTA FE" },
        { id: 25, modulo: 2, ruta: "69",    origen: "LOLOIGUE",                                 destino: "ESTADIO AZTECA" },
        { id: 26, modulo: 2, ruta: "113",   origen: "CASETA DE COBRO",                          destino: "IZAZAGA (METRO PINO SUÁREZ)" },
        { id: 27, modulo: 2, ruta: "116-A", origen: "RÍO GUADALUPE",                            destino: "METRO GENERAL ANAYA" },
        { id: 28, modulo: 2, ruta: "117",   origen: "PEDREGAL DE SAN NICOLÁS (POR GLORIETA)",   destino: "METRO UNIVERSIDAD" },
        { id: 29, modulo: 2, ruta: "125",   origen: "BOSQUES DEL PEDREGAL",                     destino: "METRO UNIVERSIDAD POR LÓPEZ PORTILLO" },
        { id: 30, modulo: 2, ruta: "129",   origen: "MAGDALENA ATLITIC (CONTRERAS)",            destino: "METRO COPILCO" },
        { id: 31, modulo: 2, ruta: "131",   origen: "SAN BERNABÉ/OYAMEL",                       destino: "METRO UNIVERSIDAD" },
        { id: 32, modulo: 2, ruta: "132",   origen: "CASETA DE COBRO",                          destino: "ESTADIO AZTECA" },
        { id: 33, modulo: 2, ruta: "133",   origen: "TLALMILIL",                                destino: "ESTADIO AZTECA" },
        { id: 34, modulo: 2, ruta: "134",   origen: "SANTO TOMÁS AJUSCO",                       destino: "ESTADIO AZTECA" },
        { id: 35, modulo: 2, ruta: "134-E", origen: "PARRES",                                   destino: "ESTADIO AZTECA" },
        { id: 36, modulo: 2, ruta: "136",   origen: "TOPILEJO",                                 destino: "ESTADIO AZTECA" },
        { id: 37, modulo: 2, ruta: "137",   origen: "SANTO TOMÁS AJUSCO",                       destino: "METRO UNIVERSIDAD" },
        { id: 38, modulo: 2, ruta: "138",   origen: "TOPILEJO",                                 destino: "METRO UNIVERSIDAD" },
        { id: 39, modulo: 2, ruta: "300-B", origen: "PASEO ACOPXA",                             destino: "SANTA FE (UAM CUAJIMALPA)" },

        // módulo 3
        { id: 40, modulo: 3, ruta: "31-B", origen: "DEPORTIVO XOCHIMILCO",         destino: "IZAZAGA (METRO PINO SUÁREZ)" },
        { id: 41, modulo: 3, ruta: "39-B", origen: "AV. SANTA ANA",                destino: "XOCHIMILCO/BOSQUE DE NATIVITAS" },
        { id: 42, modulo: 3, ruta: "81-A", origen: "SAN GREGORIO ATLAPULCO",       destino: "METRO TASQUEÑA" },
        { id: 43, modulo: 3, ruta: "141",  origen: "VILLA MILPA ALTA",             destino: "METRO TLÁHUAC" },
        { id: 44, modulo: 3, ruta: "142",  origen: "TULYEHUALCO",                  destino: "XOCHIMILCO/PALMAS" },
        { id: 45, modulo: 3, ruta: "143",  origen: "VILLA MILPA ALTA",             destino: "METRO TASQUEÑA" },
        { id: 46, modulo: 3, ruta: "144",  origen: "SAN PABLO OZTOTEPEC",          destino: "XOCHIMILCO/PALMAS" },
        { id: 47, modulo: 3, ruta: "144-C", origen: "SAN SALVADOR CUAUHTENCO",     destino: "VILLA MILPA ALTA" },
        { id: 48, modulo: 3, ruta: "145",  origen: "PEDREGAL DE SAN FRANCISCO",    destino: "XOCHIMILCO/PALMAS" },
        { id: 49, modulo: 3, ruta: "145-A", origen: "SANTIAGO TEPALCATLAPAN",      destino: "REPÚBLICA DE EL SALVADOR" },
        { id: 50, modulo: 3, ruta: "146",  origen: "SAN MIGUEL TEHUISCO",          destino: "XOCHIMILCO/PALMAS" },
        { id: 51, modulo: 3, ruta: "147",  origen: "SAN BARTOLOMÉ XICOMULCO",      destino: "XOCHIMILCO/PALMAS" },
        { id: 52, modulo: 3, ruta: "148",  origen: "SAN NICOLÁS TETELCO",          destino: "METRO TLÁHUAC" },
        { id: 53, modulo: 3, ruta: "149",  origen: "SAN ANDRÉS MIXQUIC",           destino: "METRO TLÁHUAC" },

        // módulo 4
        { id: 54, modulo: 4, ruta: "1-D",   origen: "METRO SANTA MARTA",             destino: "METRO MIXCOAC" },
        { id: 55, modulo: 4, ruta: "46",    origen: "SANTA CATARINA",                destino: "CENTRAL DE ABASTO" },
        { id: 56, modulo: 4, ruta: "47-A",  origen: "ALAMEDA ORIENTE",               destino: "XOCHIMILCO/BOSQUE DE NATIVITAS" },
        { id: 57, modulo: 4, ruta: "52-C",  origen: "METRO SANTA MARTA",             destino: "METRO ZAPATA" },
        { id: 58, modulo: 4, ruta: "59",    origen: "METRO CUATRO CAMINOS",          destino: "COL. MOCTEZUMA 2A. SECCIÓN" },
        { id: 59, modulo: 4, ruta: "159",   origen: "PALMITAS",                      destino: "METRO CONSTITUCIÓN DE 1917" },
        { id: 60, modulo: 4, ruta: "161",   origen: "AMPLIACIÓN SANTIAGO",           destino: "METRO CONSTITUCIÓN DE 1917" },
        { id: 61, modulo: 4, ruta: "161-A", origen: "PALMAS",                        destino: "METRO CONSTITUCIÓN DE 1917" },
        { id: 62, modulo: 4, ruta: "162",   origen: "COL. BUENAVISTA (PARAJES)",     destino: "CENTRAL DE ABASTO" },
        { id: 63, modulo: 4, ruta: "162-A", origen: "SAN JOSÉ BUENAVISTA",           destino: "METRO CONSTITUCIÓN DE 1917" },
        { id: 64, modulo: 4, ruta: "162-B", origen: "BARRANCA DE GUADALUPE",         destino: "METRO CONSTITUCIÓN DE 1917" },
        { id: 65, modulo: 4, ruta: "162-C", origen: "SANTA CATARINA",                destino: "METRO CONSTITUCIÓN DE 1917" },
        { id: 66, modulo: 4, ruta: "162-D", origen: "CAMPESTRE POTRERO",             destino: "METRO ZARAGOZA" },
        { id: 67, modulo: 4, ruta: "162-E", origen: "SANTA CATARINA",                destino: "METRO UNIVERSIDAD" },
        { id: 68, modulo: 4, ruta: "162-F", origen: "SAN MIGUEL TEOTONGO/TORRES",    destino: "METRO ZARAGOZA" },
        { id: 69, modulo: 4, ruta: "163-B", origen: "SAN MIGUEL TEOTONGO/AVISADERO", destino: "METRO ZARAGOZA" },
        { id: 70, modulo: 4, ruta: "163-C", origen: "COL. MIGUEL DE LA MADRID",      destino: "METRO ZARAGOZA" },
        { id: 71, modulo: 4, ruta: "165-A", origen: "EJÉRCITO DE ORIENTE",           destino: "METRO CONSTITUCIÓN DE 1917" },
        { id: 72, modulo: 4, ruta: "170",   origen: "IXTLAHUACAN/MIRAVALLE",         destino: "METRO ZARAGOZA" },
        { id: 73, modulo: 4, ruta: "172",   origen: "PASEO ACOXPA",                  destino: "METRO AUDITORIO" },
        { id: 74, modulo: 4, ruta: "162-E", origen: "SAN FRANCISCO APOLOCALCO",      destino: "METRO TLÁHUAC" },
        { id: 75, modulo: 4, ruta: "162-F", origen: "SAN FRANCISCO APOLOCALCO",      destino: "LA VIRGEN" },

        // módulo 5
        { id: 76, modulo: 5, ruta: "11-A", origen: "ARAGÓN POR AV. 604",             destino: "METRO CHAPULTEPEC" },
        { id: 77, modulo: 5, ruta: "12",   origen: "ARAGÓN",                         destino: "PANTEÓN SAN ISIDRO" },
        { id: 78, modulo: 5, ruta: "33",   origen: "LEÓN DE LOS ALDAMA",             destino: "METRO CHABACANO" },
        { id: 79, modulo: 5, ruta: "37",   origen: "U.C.T.M. ATZACOALCO",            destino: "CARMEN SERDÁN" },
        { id: 80, modulo: 5, ruta: "43",   origen: "SAN FELIPE/LEÓN DE LOS ALDAMA",  destino: "CENTRAL DE ABASTO" },
        { id: 81, modulo: 5, ruta: "168",  origen: "ARENAL 4A. SECCIÓN",             destino: "METRO PANTITLÁN" },
        { id: 82, modulo: 5, ruta: "169",  origen: "AGRICOLA PANTITLÁN",             destino: "METRO PUEBLA" },

        // módulo 6
        { id: 83, modulo: 6, ruta: "23",    origen: "COL. EL TEPETATAL (EL CHARCO)",  destino: "METRO LA RAZA" },
        { id: 84, modulo: 6, ruta: "25",    origen: "ZACATENCO",                      destino: "METRO POTRERO" },
        { id: 85, modulo: 6, ruta: "27-A",  origen: "RECLUSORIO NORTE",               destino: "METRO HIDALGO/ALAMEDA CENTRAL" },
        { id: 86, modulo: 6, ruta: "101",   origen: "COL. LOMAS DE CUAUTEPEC",        destino: "METRO INDIOS VERDES" },
        { id: 87, modulo: 6, ruta: "101-A", origen: "AMPLIACIÓN MALACATES",           destino: "LA VILLA (FERROPLAZA)" },
        { id: 88, modulo: 6, ruta: "101-B", origen: "COL. FORESTAL",                  destino: "LA VILLA (FERROPLAZA)" },
        { id: 89, modulo: 6, ruta: "101-D", origen: "LA BRECHA",                      destino: "LA VILLA (FERROPLAZA)" },
        { id: 90, modulo: 6, ruta: "102",   origen: "LA BRECHA",                      destino: "METRO INDIOS VERDES" },
        { id: 91, modulo: 6, ruta: "106",   origen: "AMPLIACIÓN MALACATES",           destino: "METRO LA RAZA" },
        { id: 92, modulo: 6, ruta: "107-A", origen: "COL. EL TEPETATAL (EL CHARCO)",  destino: "METRO POTRERO" },
        { id: 93, modulo: 6, ruta: "107-B", origen: "LA VILLA (CANTERA)",             destino: "METRO TACUBA POR CEYLÁN" },
        { id: 94, modulo: 6, ruta: "108",   origen: "COL. EL TEPETATAL (EL CHARCO)",  destino: "METRO INDIOS VERDES" },
        { id: 95, modulo: 6, ruta: "200",   origen: "CIRCUITO BICENTENARIO NORTE",    destino: "METRO INDIOS VERDES" },
        { id: 96, modulo: 6, ruta: "200",   origen: "CIRCUITO BICENTENARIO SUR",      destino: "METRO INDIOS VERDES" },
        
        // módulo 7
        { id: 97,  modulo: 7, ruta: "19",   origen: "METRO EL ROSARIO", destino: "PARQUE MÉXICO POR CUITLÁHUAC" },
        { id: 98,  modulo: 7, ruta: "19-A", origen: "METRO EL ROSARIO", destino: "PARQUE MÉXICO POR NORMAL" },
        { id: 99,  modulo: 7, ruta: "57",   origen: "TOREO",            destino: "METRO CONSTITUCIÓN DE 1917" },
        { id: 100, modulo: 7, ruta: "59",   origen: "METRO EL ROSARIO", destino: "METRO CHAPULTEPEC" },
        { id: 101, modulo: 7, ruta: "59-A", origen: "METRO EL ROSARIO", destino: "SULLIVAN" },
        { id: 102, modulo: 7, ruta: "107",  origen: "METRO EL ROSARIO", destino: "METRO TACUBA" },
        { id: 103, modulo: 7, ruta: "34-A", origen: "METRO BALDERAS",   destino: "CENTRO COMERCIAL SANTA FE" }
    ];


    const contModulos      = document.getElementById('listaModulos');
    const tbodyRutas       = document.getElementById('tbodyRutasModulo');
    const tituloModuloSel  = document.getElementById('tituloModuloSel');
    const mensajeSinDatos  = document.getElementById('mensajeSinDatos');

    if (!contModulos || !tbodyRutas || !tituloModuloSel) return;


function construirListaModulos() {
    const modulos = [...new Set(DATOS_RUTAS.map(r => r.modulo))].sort((a, b) => a - b);

    // clases de color por módulo
    const colores = {
        1: 'mod-color-1',
        2: 'mod-color-2',
        3: 'mod-color-3',
        4: 'mod-color-4',
        5: 'mod-color-5',
        6: 'mod-color-6',
        7: 'mod-color-7'
        
    };

    modulos.forEach(mod => {
        const totalRutas = DATOS_RUTAS.filter(r => r.modulo === mod).length;

        const card = document.createElement('div');
        card.className = `mod-card btn-modulo ${colores[mod] || 'mod-color-default'}`;
        card.dataset.modulo = mod;
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');

        card.innerHTML = `
            <div class="mod-card-title">Módulo ${mod}</div>
            <div class="mod-card-number">${totalRutas}</div>
        `;

        contModulos.appendChild(card);
    });
}


    function mostrarRutasDeModulo(modulo) {
        const modNum = parseInt(modulo, 10);
        const rutasFiltradas = DATOS_RUTAS.filter(r => r.modulo === modNum);

        tituloModuloSel.textContent = `Rutas del Módulo ${modNum}`;
        tbodyRutas.innerHTML = '';

        if (!rutasFiltradas.length) {
            if (mensajeSinDatos) mensajeSinDatos.classList.remove('d-none');
            return;
        }
        if (mensajeSinDatos) mensajeSinDatos.classList.add('d-none');

        rutasFiltradas.forEach((r, index) => {
            const tr = document.createElement('tr');
            tr.classList.add('fila-ruta');

            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${r.ruta}</td>
                <td>${r.origen}</td>
                <td>${r.destino}</td>
            `;

            tbodyRutas.appendChild(tr);
        });
    }

    
    contModulos.addEventListener('click', (e) => {
        const card = e.target.closest('.btn-modulo');
        if (!card) return;

        document.querySelectorAll('.btn-modulo').forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        mostrarRutasDeModulo(card.dataset.modulo);
    });

    contModulos.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const card = e.target.closest('.btn-modulo');
        if (!card) return;

        e.preventDefault();
        card.click();
    });

    // Inicializar
    construirListaModulos();

    const cardModulo1 = contModulos.querySelector('[data-modulo="1"]');
    if (cardModulo1) {
        cardModulo1.classList.add('active');
        mostrarRutasDeModulo(1);
    }
});
