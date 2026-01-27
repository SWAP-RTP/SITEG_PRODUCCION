
// Toma una fecha en formato ISO con horas diferidas por la zona horaria y las ajusta a una zona horaria requerida restando las Hrs y min pertinentes
export const ajustarHora = (fecha) => {

    if(!(fecha instanceof Date)) return fecha

    const hrsRest = 17;
    const minRest = 23;
        
    const date = new Date(fecha);
    date.setSeconds( 0 );
    date.setHours( date.getHours() - hrsRest );
    date.setMinutes( date.getMinutes() - minRest );

    return date
}

// Toma una fecha en formato ISO con horas diferidas por la zona horaria y las ajusta a una zona horaria requerida restando las Hrs y min pertinentes
export const sumarHora = (fecha, {hrs=0, min=0}) => {
    if(!(fecha instanceof Date)) return fecha
        
    const date = new Date(fecha);
    date.setSeconds( 0 );
    date.setHours( date.getHours() + hrs );
    date.setMinutes( date.getMinutes() + min );

    return date
}

/**
 * @param {string} hora en formato "hh:mm" 
 * @param {number} sumMin Minutos a sumar 
 * @returns `${hr}:${min}`
 */
export const sumarMinutos = (hora, sumMin= 10) => {
    if(!hora) return null
    
    const horaSeparada = hora.split(':');
    const ahora = new Date(2022,2,27, Number(horaSeparada[0]), Number(horaSeparada[1]) + sumMin );

    // ahora.setHours( '04', horaSeparada[1] + sumMin );
    // ahora.setMinutes( horaSeparada[1] + sumMin );

    const hr = (ahora.getHours() >= 10) ? ahora.getHours() : `0${ahora.getHours()}`
    const min  = (ahora.getMinutes() >= 10) ? ahora.getMinutes() : `0${ahora.getMinutes()}`

    return `${hr}:${min}`
    // return ahora
}


/**
 * @param {date} date objeto Date
 * @returns {string} fecha en formato dd/mm/yyyy
 */
export const dateToString = (date, invert=false, symbol='/') => {
    if( typeof date != 'object' ) return date
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();
    if(invert) return`${year}${symbol}${month}${symbol}${day}`;
    return `${day}${symbol}${month}${symbol}${year}`;
};

export const hrDateToString = (date, opt={}) => {
    if( !(date instanceof Date) ) return null
    const { noSec=false } = opt

    const hr  = date.getHours().toString().padStart(2, "0")
    const min = date.getMinutes().toString().padStart(2, "0")
    const sec = date.getSeconds().toString().padStart(2, "0")

    if(noSec) return `${hr}:${min}`
    return `${hr}:${min}:${sec}`
    
}

/**
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @returns {Array}
 */
export const getDatesBetween = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
  
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    return dates;
}

/**
 * Usa un array y se define el mensaje en español
 * @param {string} fechaString fecha en formato yyyy-mm-dd
 * @returns {string} fecha legible en español
 */
export const transformarFecha = (fechaString) => {
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
  
    const partesFecha = fechaString.split('-');
    const dia = partesFecha[2];
    const mesIndex = parseInt(partesFecha[1]) - 1;
    const mes = meses[mesIndex];
    const anio = partesFecha[0];
  
    return `${dia} de ${mes} del ${anio}`;
};

/**
 * Usa el objeto Intl
 * @param {string | Date} date fecha en formato 'yyyy mm dd'
 * @returns {string} fecha legible en español
 */
export const transformarFechaIntl = (date) => {
    const fecha = new Date(date);

    const formatoFecha = new Intl.DateTimeFormat('es-ES', {
    // year: 'numeric',
    month: 'long',
    day: 'numeric'
    });

    // console.log('transformarFechaIntl', formatoFecha.format(fecha)); // Salida: "25 de mayo de 2023"
    return formatoFecha.format(fecha); 
}


/**
 * 
 * @param {string} hora hora a comparar [HH:mm]
 * @param {string} horaReferencia hora de referencia [HH:mm]
 * @param {{limSup?: number, limInf?: number}} options {limSup= 10, limInf= 15}, limInf=-1 no se toma en cuenta
 * @returns boolean
 */
export const isHoraDentroDeRango = (hora, horaReferencia, options={limSup:undefined, limInf:undefined}) => {
    const {limSup=10, limInf=15} = options

    if(!hora || !horaReferencia) return false
    
    // Convertir las horas a objetos Date
    const horaObj = new Date(`2023-01-01T${hora}`);
    const horaReferenciaObj = new Date(`2023-01-01T${horaReferencia}`);

    // Crear el rango de tiempo
    const MILISEGXMIN = 60*1000
    const rangoInicio = new Date(horaReferenciaObj.getTime() - (limInf * MILISEGXMIN));
    const rangoFin    = new Date(horaReferenciaObj.getTime() + (limSup * MILISEGXMIN));

    // Comparar la hora con el rango de tiempo
    if(limInf == -1) return horaObj <= rangoFin
    
    else return horaObj >= rangoInicio && horaObj <= rangoFin;
}