export function grafica_pastel(){
    const data = {
        labels: [
            'Operable',
            'En ruta',
            'Disponibles',
            'En mantenimiento',
            'Servicios Especiales'
        ],
        datasets: [{
            data: [500, 300, 100, 100, 20],
            backgroundColor: [
                'rgba(9, 255, 0, 1)',
                'rgba(0, 153, 255, 1)',
                'rgba(118, 234, 255, 1)',
                'rgba(0, 148, 62, 1)',
                'rgba(255, 0, 0, 1)',
            ],
            hoverOffset: 4
        }]
    };
    
    const config = {
      type: 'doughnut',
      data: data,
    };

    const ctx = document.getElementById('pastelChart').getContext('2d');
    
    const pastelChart = new Chart(
        ctx,
        config
    );
}