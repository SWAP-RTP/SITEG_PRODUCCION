// -------------------------------------------------------------
// Helpers modularizados para RolesCargados
// Funciones auxiliares para cálculo de días, comparación de horarios,
// y obtención de día de la semana en español.
// Extraídos desde RolesCargados.tsx para mejor organización.
// -------------------------------------------------------------

// Obtener día de la semana en español
export function getDiaSemana(fecha: string): string {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const d = new Date(fecha);
    return dias[d.getDay()];
}

// Comparar hora de salida vs hora inicio (tolerancia 5 minutos, amarillo hasta 20 min, rojo después)
export function compararHoraSalida(horaInicio: string, momento: string) {
    if (!horaInicio || !momento) return { status: 'sin-dato', minutos: null };
    const fechaSalida = new Date(momento);
    const horaInicioArr = horaInicio.split(':');
    const fechaComparar = new Date(fechaSalida);
    fechaComparar.setHours(Number(horaInicioArr[0]), Number(horaInicioArr[1]), 0, 0);

    const diffMs = fechaSalida.getTime() - fechaComparar.getTime();
    const diffMin = Math.round(diffMs / 60000);

    if (diffMin < -5) return { status: 'adelantado', minutos: diffMin }; // Azul
    if (diffMin <= 5) return { status: 'a-tiempo', minutos: diffMin }; // Verde
    if (diffMin > 5 && diffMin <= 20) return { status: 'retraso-moderado', minutos: diffMin }; // Amarillo
    if (diffMin > 20) return { status: 'retraso', minutos: diffMin }; // Rojo
    return { status: 'sin-dato', minutos: diffMin };
}

// Calcular días laborados del periodo (mes completo menos sábados y domingos)
export function getDiasLaborados(periodo: any): number {
    if (!periodo?.fecha_inicio || !periodo?.fecha_fin) return 0;
    const fechaIni = new Date(periodo.fecha_inicio);
    const fechaFin = new Date(periodo.fecha_fin);
    const y1 = fechaIni.getFullYear(), m1 = fechaIni.getMonth(), d1 = fechaIni.getDate();
    const y2 = fechaFin.getFullYear(), m2 = fechaFin.getMonth(), d2 = fechaFin.getDate();
    let diasLaborados = 0;
    let d = new Date(y1, m1, d1);
    const end = new Date(y2, m2, d2);
    while (d <= end) {
        const dia = d.getDay(); // 0=Domingo, 6=Sábado
        if (dia !== 0 && dia !== 6) {
            diasLaborados++;
        }
        d.setDate(d.getDate() + 1);
    }
    return diasLaborados;
}

// Contar días únicos con registro en caseta
export function getDiasCumplidos(casetaRegistros: any[]): number {
    const diasUnicos = new Set(
        casetaRegistros.map(reg => {
            const fecha = new Date(reg.momento);
            fecha.setHours(0, 0, 0, 0);
            return fecha.getTime();
        })
    );
    return diasUnicos.size;
}
