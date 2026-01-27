import { rouded } from "../../shared/utilities/maths"

   
// Obtener dias de vacaciones segun antiguedad  (BASE)
const vacacionesXantiguedad: number[] = []
const diasMinimo = 12
const diasAumento = 2
const diasLimite = 39

let dias = diasMinimo-diasAumento
for (let i = 0; i < diasLimite; i++) {
    if( i<5 ) dias = dias+diasAumento
    else if( !(i%5) ) dias = dias+diasAumento
    vacacionesXantiguedad.push(dias)
}
export const getDiasVacaciones = (antiguedad: number) => vacacionesXantiguedad[antiguedad] || vacacionesXantiguedad[vacacionesXantiguedad.length-1]
//*     ↑


//& SDI: salario diario integrado o "ingresos diarios" (salario + aguinaldo + prima vacacional)
// Constantes
const AHO_DIAS = 365
const cuotoDiaria = 1
const aguinaldoDias = 40

//&  1.1 CALCÚLO DE FACTOR DE INTEGRACIÓN BASE: 
// Factores
const base_porcentajePrimaVacacional = .44
const aguinaldo = aguinaldoDias/AHO_DIAS
const base_factorPrimaVacacional = base_porcentajePrimaVacacional/AHO_DIAS

const base_getPrimaVacacional = (dias: number) => rouded(dias*base_factorPrimaVacacional)
const base_getFactorIntegracionBase = (dias: number) => rouded(cuotoDiaria + aguinaldo + base_getPrimaVacacional(dias))


//&  1.2 CALCÚLO DE SALARIO DIARIO INTEGRADO O SALARIO BASE DE COTIZACIÓN PERSONAL DE BASE
export const base_getSDI = (params: {salario_mensual: number, antiguedad: number}) => {
    const {salario_mensual, antiguedad} = params

    const sd = salario_mensual/30
    const dias = getDiasVacaciones(antiguedad)
    const factor = base_getFactorIntegracionBase(dias)

    return rouded(sd*factor, 2)            
}



//&  2.1 CALCÚLO DE FACTOR DE INTEGRACIÓN CONFIANZA (conf):
// Factores
const conf_porcentajePrimaVacacional = .35
const conf_dias = 20
const conf_primaVacacional = conf_dias*conf_porcentajePrimaVacacional/AHO_DIAS
const factor = rouded(cuotoDiaria + aguinaldo + conf_primaVacacional)

//&  2.2 CALCÚLO DE SALARIO DIARIO INTEGRADO O SALARIO BASE DE COTIZACIÓN CONFIANZA
export const conf_getSDI = (salario_mensual: number) => rouded(factor*salario_mensual/30, 2)            


//& Calculos variables
// Vales de despensa
const UMA_PORCENTAJE = 0.40
export const getDespensa = (despensa: number, uma: number, dias_trabajados: number) => {
    const exento = uma*UMA_PORCENTAJE*dias_trabajados
    if(despensa>exento) return rouded(despensa-exento, 2)
    else return 0
}

// Premios de asistencia
const SDI_ANTERIOR_PORCENTAJE = 0.10
export const getAsistencia = (asistencia: number, sdi_anterior: number, dias_trabajados: number) => {
    const exento = sdi_anterior*SDI_ANTERIOR_PORCENTAJE*dias_trabajados
    if(asistencia>exento) return rouded(asistencia-exento, 2)
    else return 0
}
