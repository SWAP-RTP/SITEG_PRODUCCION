/************************************************* PANELES PRINCIPALES CON FUNCION DE DESPLIEGUE DE MAS INFORMACION *************************************************************/
const panels = {
    activos: {
        card: document.getElementById('card_trabajadores_activos'),
        panel: document.getElementById('trabajadores-activos')
    },
    inactivos: {
        card: document.getElementById('card_trabajadores_inactivos'),
        panel: document.getElementById('trabajadores-inactivos')
    }
};

function togglePanel(panelToOpen, panelToClose) {
    const isOpen = panelToOpen.panel.classList.contains('mostrar');

    if (panelToClose.panel.classList.contains('mostrar')) {
        panelToClose.panel.classList.remove('mostrar');
        setTimeout(() => {
            panelToClose.panel.setAttribute('hidden', 'true');
        }, 500);
    }

    if (isOpen) {
        panelToOpen.panel.classList.remove('mostrar');
        setTimeout(() => {
            panelToOpen.panel.setAttribute('hidden', 'true');
        }, 500);
    } else {
        panelToOpen.panel.removeAttribute('hidden');
        setTimeout(() => {
            panelToOpen.panel.classList.add('mostrar');
        }, 10);
    }
}

panels.activos.card.addEventListener('click', () => {
    togglePanel(panels.activos, panels.inactivos);
});

panels.inactivos.card.addEventListener('click', () => {
    togglePanel(panels.inactivos, panels.activos);
});

/*************************************************************************************** GRAFICAS *******************************************************************************/
function limpiarVista (){


    
}



const form = document.getElementById("formFiltro");
form.addEventListener("submit", function (event) {
    if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
    }
    form.classList.add("was-validated");
    const año = document.getElementById('año_trabajadores').value;
    const mes = document.getElementById('mes_trabajadores').value;
    const modulo = document.getElementById('modulo_trabajadores').value;

    event.preventDefault();
    console.log(año, mes, modulo)
    limpiarVista();


});


const gmodulos = document.getElementById('grafModulos');
if (gmodulos) {
    chartModulos = new Chart(gmodulos, {
        type: 'line',
        data: {
            labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            datasets: [
                {
                    label: 'MODULO 1',
                    data: [28, 32, 30, 35, 27, 33, 31, 29, 36, 34, 30, 32],
                    tension: 0.1
                },
                {
                    label: 'MODULO 2',
                    data: [22, 26, 24, 28, 20, 25, 27, 23, 29, 31, 26, 24],
                    tension: 0.1
                },
                {
                    label: 'MODULO 3',
                    data: [35, 30, 38, 33, 36, 34, 37, 39, 32, 35, 38, 36],
                    tension: 0.1
                },
                {
                    label: 'MODULO 4',
                    data: [15, 18, 20, 17, 19, 16, 21, 23, 20, 18, 17, 19],
                    tension: 0.1
                },
                {
                    label: 'MODULO 5',
                    data: [40, 38, 42, 37, 39, 41, 43, 45, 44, 40, 39, 42],
                    tension: 0.1
                },
                {
                    label: 'MMODULO 6',
                    data: [30, 28, 26, 27, 29, 31, 33, 32, 30, 28, 27, 29],
                    tension: 0.1
                },
                {
                    label: 'MODULO 7',
                    data: [45, 25, 35, 20, 32, 28, 34, 31, 33, 29, 27, 30],
                    tension: 0.1
                },
                {
                    label: 'OFICINAS CENTRALES',
                    data: [10, 12, 14, 13, 11, 15, 16, 14, 13, 12, 11, 10],
                    tension: 0.1
                }
            ]
        }
    });
}





document.addEventListener("DOMContentLoaded", function () {
    const counters = document.querySelectorAll('.value');
    const cards = document.querySelectorAll(".card-number");

    // CONTADOR DESDE CERO PARA LLEGAR A SU NUMERO
    counters.forEach(counter => {
        let finalValue = counter.innerText.replace(/,/g, '');
        let duration = 3000;
        let start = 0;
        let increment = finalValue / (duration / 30);

        let interval = setInterval(() => {
            start += increment;

            if (start >= finalValue) {
                start = finalValue;
                clearInterval(interval);
            }

            counter.innerText = Math.floor(start).toLocaleString('en-US');
        }, 30);
    });

    // tiempo de aparicion entre cards
    cards.forEach((card, i) => {
        card.style.animationDelay = `${i * 0.25}s`; // 0.25s entre cada card
    });

});
