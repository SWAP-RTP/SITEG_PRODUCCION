import { dateToString } from "../../shared/helpers/datesFuncs";


function obtenerPrimerosLunes(anio) {
    const primerosLunes = [];
  
    for (let mes = 0; mes < 12; mes++) {
      // Crear fecha del primer día del mes
      const primerDiaDelMes = new Date(anio, mes, 1);
  
      // Calcular el día de la semana del primer día del mes
      const diaDeLaSemana = primerDiaDelMes.getDay();
  
      // Calcular la diferencia para llegar al primer lunes
      const diasHastaPrimerLunes = (8 - diaDeLaSemana) % 7;
  
      // Crear fecha del primer lunes
      const primerLunes = new Date(anio, mes, 1 + diasHastaPrimerLunes);
  
      // Agregar al array
      primerosLunes.push(primerLunes);
    }
  
    return primerosLunes;
}

function calcularSemanasEntreFechas(fechaInicio, fechaFin) {
    // Cantidad de milisegundos en una semana
    const milisegundosEnSemana = 7 * 24 * 60 * 60 * 1000;
  
    // Calcular la diferencia en milisegundos entre las dos fechas
    const diferenciaEnMilisegundos = Math.abs(fechaFin - fechaInicio);
  
    // Calcular el número de semanas redondeando hacia abajo
    // const semanas = (diferenciaEnMilisegundos / milisegundosEnSemana);
    const semanas = Math.round(diferenciaEnMilisegundos / milisegundosEnSemana);
    // const semanas = Math.floor(diferenciaEnMilisegundos / milisegundosEnSemana);
  
    return semanas;
}
  



/**
 * @param {number} finalYear 
 * @returns {{
 * id:       number,
 * year:     number
 * periodo:  number,
 * weeks:    number    
 * fechaIni: string, 
 * fechaFin: string
 * }[]}
 */
export const makePeriodos = (finalYear) => {
    const dates = []
    const startAt = new Date(2024,0,1);
    const finishAt = new Date(finalYear,0,1);

    //& Ajustar fecha fin al primer domingo (0) del año
    while(finishAt.getDay() != 0){
        finishAt.setDate( finishAt.getDate() +1 );
    }

    const fechasIniciales = []
    let year = startAt.getFullYear()
    while(year<finishAt.getFullYear()+2){
        let mondays = obtenerPrimerosLunes(year);

        if( year==finishAt.getFullYear()+1 ) mondays=mondays.slice(0,1)
            

        fechasIniciales.push(...mondays)
        // dates.push({year, periods: mondays.length, mondays})
        year++
    }

    const periodos = fechasIniciales.map( (inicia, i) => {
        const nextMonday = fechasIniciales[i+1]
        const finaliza = !!nextMonday ? new Date(nextMonday) : undefined;
        !!nextMonday ? finaliza.setDate( nextMonday.getDate()-1 ) : undefined;

        return { 
            id:       i+1, 
            year:     inicia.getFullYear(), 
            periodo:  inicia.getMonth()+1,      //(i+1)%12 || 12,
            weeks:    calcularSemanasEntreFechas(inicia, finaliza),
            fechaIni: dateToString(inicia), 
            fechaFin: dateToString(finaliza) 
        }
    });
    
    return periodos.slice(0,-1)
}
