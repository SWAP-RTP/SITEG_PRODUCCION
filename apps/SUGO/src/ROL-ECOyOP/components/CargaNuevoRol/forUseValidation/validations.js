import { hrDateToString } from "../../../../shared/helpers";
import { capitalize, quitarAcentos } from "../../../../shared/helpers";
import { myColsNames } from "../../../helpers/esquemasExcel";


/**
 * @param {Date} hora Date con la hora a la que se desa sumar X tiempo
 * @param {number} sum_hrs 
 * @param {number} sum_min 
 * @param {number} sum_seg 
 * @param {number} sum_ms 
 * @returns new Date setted
 */
const sumarHoras = (hora, sum_hrs=0, sum_min=0, sum_seg=0, sum_ms=0) => {
    if(!(hora instanceof Date)) return hora

    const newDate = new Date(hora)
    newDate.setHours( 
        newDate.getHours() + sum_hrs,
        newDate.getMinutes() + sum_min,
        newDate.getSeconds() + sum_seg,
        newDate.getMilliseconds() + sum_ms,
    )
    return newDate
}

/**
 * @param {Date} horaBase 
 * @param {number} hrs numero de horas a sumar
 * @param {*} opt {min: int, sec: int, ms: int, reset=false}; reset: Si no se especifica se coloca en 0
 * @returns new Date con hora ajustada
 */
const setHrs = (horaBase, hrs=false, opt={} ) => {
    if(!(horaBase instanceof Date)) return horaBase
    const {min=false, sec=false, ms=false, reset=false} = opt

    const newDate = new Date(horaBase)
    const setters = [
        hrs ? hrs : ( reset ? 0 : newDate.getHours() ),
        min ? min : ( reset ? 0 : newDate.getMinutes() ),
        sec ? sec : ( reset ? 0 : newDate.getSeconds() ),
        ms  ? ms  : ( reset ? 0 : newDate.getMilliseconds() )
    ]
    newDate.setHours( 
        setters[0], 
        setters[1], 
        setters[2], 
        setters[3] 
    )
    return newDate
}

const isSameTime = (hr1, hr2) => {
    if(!(hr1 instanceof Date) || !(hr2 instanceof Date)) throw new Error( `Las horas no son Dates:
        - hora 1: ${hr1}
        - hora 2: ${hr2}
    ` )

    return (
        hr1.getHours() == hr2.getHours() 
        && hr1.getMinutes() == hr2.getMinutes()
        && hr1.getSeconds() == hr2.getSeconds()
    )
}

/**
 *    hr_Inicio   |
 *  hr1   |  hr2  | jornada (hrs) |  hr_fin
 * 06:00* | 11:59 |   8           | < 20:00*    if( hr1 < hrIni < hr2 ) Diurna
 * 12:00  | 15:59 |   7:30        | < 23:30     else Mixta
 * 16:00  | 02:30 |   7           | < 10:00     elif(hr1 < hrIni < hr2) Nocturna 
 * 02:31  | 05:59 |   7:30        | < 13:30     else Mixta
*/                                              
/** 
 * @param {Date} hrIni hora de inicio del turno en Date
 * @param {Date} hrFin hora de finalizacion del turno en Date  
 * @returns [isOk, jornadaTipo]
 */
const validateJornadas = (horaIni, horaFin) => {
    if(!(horaIni instanceof Date) || !(horaFin instanceof Date)) //throw new Error(
    {   console.warn(
        `Las horas no son Dates:
        - hora inicial: ${ horaIni instanceof Date ? 'ok' : horaIni}
        - hora final: ${ horaFin instanceof Date ? 'ok' : horaFin}
    ` )
        return [false, null, 'No tienen el formato de "hora" valido']
    }

    const jDiurna   = {hr: 8}
    const jNocturna = {hr: 7}
    const jMixta    = {hr: 7, min: 30}

    let isOk = false
    let jornadaTipo = 'no type'

    const hrIni = new Date(horaIni);
    const hrFin = (horaIni > horaFin) ? sumarHoras(horaFin, 24) : new Date(horaFin);
    
    // & Horas para turno Diurno
    const hr1 = setHrs( horaIni, 6, {reset: true})
    const hr2 = setHrs( horaIni, 12, {reset: true})

    // & Horas para turno Nocturno
    const hr3 = setHrs( horaIni, 16, {reset: true})
    const hr4 = setHrs( horaIni, (2 +24), {min: 30, reset: true})


    if(hr1 <= horaIni && horaIni <= hr2) {
        hrIni.setHours( hrIni.getHours() + jDiurna.hr)
        isOk = isSameTime(hrIni, hrFin)
        jornadaTipo = 'Diurna (8 horas)' 
    }
    else if (hr3 <= horaIni && horaIni <= hr4){
        hrIni.setHours( hrIni.getHours() + jNocturna.hr)
        isOk = isSameTime(hrIni, hrFin)
        jornadaTipo = 'Nocturna (7 horas)' 
    } else {
        hrIni.setHours( hrIni.getHours() + jMixta.hr, hrIni.getMinutes() + jMixta.min)
        isOk = isSameTime(hrIni, hrFin)
        jornadaTipo = 'Mixta (7:30 horas)' 
    }

    return [isOk, jornadaTipo]
}

/**
 * 
 * @param {Array} row fila, array con los nombres de las columnas
 * @returns null | Error: { msg: string, desc: array[], dismiss: Boolean } 
 */
export const verifyColsNames = (row) => {

    if(!(Array.isArray(row))) return { msg: '¡Error en las columnas!: ', desc: [`columnas: ${JSON.stringify(row)}`], canNotDismiss: true }

    let colsNamesError = []

    const i_firstStr = row.findIndex(Boolean) 
    const i_firstNull = row.findIndex(c => !c) 
    const indexToSlice = (i_firstStr==-1 || i_firstNull>i_firstStr) ? 0 : i_firstStr

    const dataColsNames = row.map( cell => {
        if(typeof cell == 'string') return quitarAcentos(cell).toLowerCase()
        else return cell
    } ).slice(indexToSlice)

    const colsBeginnignNoNull = row.slice(indexToSlice)

    const colsNamesOk = dataColsNames.map( (name, i) => {
        const mensaje = (!colsBeginnignNoNull[i]) ? 
        `Hace falta: ${capitalize(myColsNames[i])}` : 
        `Se utiliza ${colsBeginnignNoNull[i]} cuando debe ser ${capitalize(myColsNames[i])}`
        
        if(name == myColsNames[i]) return ''
        else return mensaje
    } ) 
    colsNamesError = colsNamesOk.filter(Boolean)

    if(colsNamesError.length > 0) return { msg: 'Error en el nombre de las columnas', desc: colsNamesError, canNotDismiss: true }

    return null
}

// Jornadas {
//     turno:      number;
//     hrIniT:     Date;       
//     lugIniCC:   string;
//     hrIniCC?:   Date;
//     hrTerCC?:   Date;
//     lugTerCC?:  string;
//     hrTerMod?:  Date;
//     hrTerT?:    Date;
// }

/**
 * Valida: tipo de jornadas segun la Ley del trabajo, empalme de horas, nomenclatura de CC
 * @param {object} jornadas { hrIni1, hrTer1, hrIni2, hrTer2, hrIni3, hrTerT, cred }
 * @param {string} tipo 'Lun-Vie' | 'Sab' | 'Dom'
 * @returns {string[]} array de string que son errores (descriptivos) del incumplimiento en las jornadas (horas) del operador
 */
export const rol_validateJornadas = (jornadasData, tipo) => {
    const { jornadas, cred } = jornadasData

    // // if(Array.isArray(jornadas)) return [`No se encontraron jornadas para los operadores en ${tipo}`]
    // // const [ j1, j2, j3 ] = jornadas
    const obj = {}
    jornadas.map( j => {
        const {turno , ...resto} = j
        obj[j.turno] = {...resto}
    } )

    const hrIni1 = obj[1]?.hr_ini_t;
    const hrTer1 = obj[1]?.hr_ter_t;
    const lugTer1 = obj[1]?.lug_ter_cc;
    
    const hrIni2 = obj[2]?.hr_ini_t;
    const hrTer2 = obj[2]?.hr_ter_t;
    const lugIni2 = obj[2]?.lug_ini_cc;

    const hrIni3 = obj[3]?.hr_ini_t;
    const hrTer3 = obj[3]?.hr_ter_t;
    
    // const { 
    //     hrIni1, hrTer1, hrIni2, hrTer2, hrIni3, hrTerT:hrTer3, 
    //     // lugIni1, lugIni2, lugIni3, lugTerCC, 
    //     cred,
    // } = jornadas

    const creds = !!cred ? Object.values(cred) : []

    const errores = []

    const t1 = Boolean(hrIni1 && hrTer1)
    const t2 = Boolean(hrIni2 && hrTer2)
    const t3 = Boolean(hrIni3 && hrTer3)

    /*
     & Validar jornadas tipo     */
    if(t1){
        const [ok, jor_tipo, error] = validateJornadas(hrIni1, hrTer1)
        if(!ok){
            errores.push(jor_tipo ? `En ${tipo}: La jornada del turno 1 [${creds[0]}] debe ser: ${jor_tipo}
                - Hora de inicio del turno 1: [ ${hrDateToString(hrIni1)} ]
                - Hora de termino del turno 1: [ ${hrDateToString(hrTer1)} ]
            ` : error)
        }
    }

    if(t2){
        const [ok, jor_tipo, error] = validateJornadas(hrIni2, hrTer2)
        if(!ok){
            errores.push(jor_tipo ? `En ${tipo}: La jornada del turno 2 [${creds[1]}] debe ser: ${jor_tipo}
                - Hora de inicio del turno 2: [ ${hrDateToString(hrIni2)} ]
                - Hora de termino del turno 2: [ ${hrDateToString(hrTer2)} ]
            ` : error)
        }
    }

    if(t3){
        const [ok, jor_tipo, error] = validateJornadas(hrIni3, hrTer3)
        if(!ok){
            errores.push(jor_tipo ? `En ${tipo}: La jornada del turno 3 [${creds[2]}] debe ser: ${jor_tipo}
                - Hora de inicio del turno 3: [ ${hrDateToString(hrIni3)} ]
                - Hora de termino del turno 3: [ ${hrDateToString(hrTer3)} ]
            ` : error)
        }
    }

    /*
     & Validar empalmes     */
    const minEmpalme = 90
    if(t1 && t2  && (
            typeof lugTer1 != 'string' || typeof lugIni2 != 'string' || (
            typeof lugTer1 == 'string' && !lugTer1.includes('M0') &&
            typeof lugIni2 == 'string' && !lugIni2.includes('M0') 
        )) 
    ) {
        const limInf = sumarHoras(hrTer1, 0, -minEmpalme)
        // const limSup = sumarHoras(hrTer1, 0, minEmpalme)

        if( !(limInf <= hrIni2 && hrIni2 <= hrTer1) ) errores.push(`En ${tipo}: El turno 2 [${creds[1]}] debe empezar cuando acabe el turno 1 [${creds[0]}] o maximo ${minEmpalme} minutos antes.
            - Hora de termino del turno 1: [ ${ hrDateToString(hrTer1) } ]  
            - Hora de inicio del turno 2:  [ ${ hrDateToString(hrIni2) } ] 
        `)
    }
    
    if(t2 && t3) {
        const limInf = sumarHoras(hrTer2, 0, -minEmpalme)
        // const limSup = sumarHoras(hrTer1, 0, minEmpalme)

        if( !(limInf <= hrIni3 && hrIni3 <= hrTer2) ) errores.push(`En ${tipo}: El turno 3 [${creds[2]}] debe empezar cuando acabe el turno 2 [${creds[1]}] o maximo ${minEmpalme} minutos antes.
            - Hora de termino del turno 2: [ ${ hrDateToString(hrTer2) } ]  
            - Hora de inicio del turno 3:  [ ${ hrDateToString(hrIni3) } ] 
        `)
    }

    return errores
    
}