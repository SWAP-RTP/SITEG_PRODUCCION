// ======================
// PARQUE VEHICULAR
// ======================
// new Chart(document.getElementById("graficaParque"), {
    
//     type: 'doughnut',
//     data: {
//         labels: ["INACTIVO", "ACTIVO"],
//         datasets: [{
//             data: [17, 73],
//             backgroundColor: [
//                 "#e91616ff",  // rojo para "INACTIVO"
//                 "#25df25ff"   // azul para "ACTIVO"
//             ],
//             borderColor: [
//                 "#e91616ff",  // rojo para "INACTIVO"
//                 "#25df25ff"   // azul para "ACTIVO"
//             ],
//         }]
//     }
// });

// ======================
// MANTENIMIENTO
// ======================
// new Chart(document.getElementById("graficaMantenimiento"), {
//     type: 'doughnut',
//     data: {
//         labels: ["PREVENTIVO", "CORRECTIVO"],
//         datasets: [{
//             data: [80, 20],
//             backgroundColor: [
//                 "#00d9ffff",  // rojo para "PREVENTIVO"
//                 "#0026ffff"   // azul para "CORRECTIVO"
//             ],
//             borderColor: [
//                 "#00d9ffff",  // rojo para "PREVENTIVO"
//                 "#0026ffff"   // azul para "CORRECTIVO"
//             ],
//         }]
//     }
// });

// // ======================
// // SEGURIDAD
// // ======================
// new Chart(document.getElementById("graficaSeguridad"), {
//     type: 'doughnut',
//     data: {
//         labels: ["PROCESO", "CONCLUIDOS", "CANCELADO"],
//         datasets: [{
//             data: [593, 1025, 6],
//             backgroundColor: [
//                 "#FF8D23",  // amarillo para "PROCESO"
//                 "#00ff15ff",   // gris para "CONCLUIDO"
//                 "#ff0000ff"    // rojo para "CANCELADO"
//             ],
//             borderColor: [
//                 "#FF8D23",  // amarillo para "PROCESO"
//                 "#00ff15ff",   // gris para "CONCLUIDO"
//                 "#ff0000ff"    // rojo para "CANCELADO"
//             ],
//         }]
//     }
// });

// // ======================
// // SERVICIO
// // ======================
// new Chart(document.getElementById("graficaServicio"), {
//     type: 'doughnut',
//     data: {
//         labels: ["Cumplimiento", "Pendiente"],
//         datasets: [{
//             data: [84, 16],
//         }]
//     }
// });

function graficas_percepcion(){
    const chartMedioElement = document.getElementById("graficaQuejasMedio");
    if (chartMedioElement) { // si existe
        new Chart(chartMedioElement, {
            type: 'line',
            data: {
                labels: ['SEM 1', 'SEM 2', 'SEM 3', 'SEM 4', 'SEM 5'],
                datasets: [
                    {
                        label: 'Correo',
                        data: [20, 15, 10, 30, 25],
                        borderColor: '#00c853', 
                        backgroundColor: '#00c853',
                        borderWidth: 2,
                        tension: 0.3,
                        pointRadius: 6,
                        pointBackgroundColor: '#00c853'
                    },
                    {
                        label: 'X',
                        data: [12, 16, 20, 7, 10],
                        borderColor: '#000',
                        backgroundColor: '#000',
                        borderWidth: 2,
                        tension: 0.3,
                        pointRadius: 6,
                        pointBackgroundColor: '#000'
                    },
                    {
                        label: 'FB',
                        data: [18, 25, 10, 10, 12],
                        borderColor: '#2196f3', 
                        backgroundColor: '#2196f3',
                        borderWidth: 2,
                        tension: 0.3,
                        pointRadius: 6,
                        pointBackgroundColor: '#2196f3'
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        font: {
                            size: 24,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    const chartRutaElement = document.getElementById("graficaQuejasRuta");
    if (chartRutaElement) { // si existe
        new Chart(chartRutaElement, {
            type: 'bar',
            data: {
                labels: ['Ruta 1', 'Ruta 2', 'Ruta 3'],
                datasets: [
                    {
                        data: [20, 15, 10], 
                        backgroundColor: [
                            '#00c853',
                            '#d400ff',
                            '#00eeff'
                        ],
                        borderWidth: 1
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false 
                    }
                }
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", function() {
    graficas_percepcion();

    const counters = document.querySelectorAll('.value');
    const cards = document.querySelectorAll(".card-number");

    // CONTADOR DESDE CERO PARA LLEGAR A SU NUMERO
    counters.forEach(counter => {
        let finalValue = counter.innerText.replace(/,/g, ''); // quitar comas
        let duration = 2000; // 2 segundos
        let start = 0;
        let increment = finalValue / (duration / 30); // velocidad

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