import { dateToString, getDatesBetween, isHoraDentroDeRango } from "../helpers/datesFuncs";
import { CumplimientosXcred, DiaCal, Periodo, Res_RolHeaders, RutaCumplimiento, TarjetaData } from "./interfaces";
import { groupByRepeatedValue } from '../helpers/funcsToArrays';


const formatoOpcionesY = new (Intl as any).ListFormat("es");
const regEx_words = /[a-zA-Z]+/g
const regExL_numbers = /\d+/g


interface EvJornada {
    hr_ini_t:   boolean,
    lug_ini_cc: boolean,
    hr_ini_cc?: boolean,
    hr_ter_cc?: boolean,
    lug_ter_cc: boolean,
    hr_ter_mod?:boolean,
    hr_ter_t:   boolean
}

interface AttributesEvRutaModalidad {
    dia: string, 
    eco?: number
    cred?: number
}

const MSG404 = 'No encontrado'

class CumplimientoRol {
    header?: Res_RolHeaders
    tarjetaData: TarjetaData[]
    rolCalendarios: DiaCal[]
    datesRange: string[]
    plan: DiaCal[]
    real: { dia: string | Date, eco: number, op_cred: number, data: TarjetaData[] }[]
    isDiaDescanso: boolean = false


    constructor(realData: TarjetaData[], planData:DiaCal[], periodo: Periodo, header?: Res_RolHeaders){
        const d1 = new Date(periodo.fecha_inicio.split('-').join('/'))
        const d2 = new Date(periodo.fecha_fin.split('-').join('/'))
        const datesRange = getDatesBetween(d1, d2)
        const range = datesRange.map( date => dateToString(date, true, '-') )
        this.header = header;
        this.tarjetaData = realData;
        this.rolCalendarios = planData;
        this.datesRange = range;
    }

    evCred(cred_plan: number): [boolean, [any, any]] {
        const creds_real = this.real.map( obj => obj.op_cred )
        if( creds_real.includes(cred_plan) ) return [true, [cred_plan, cred_plan]]     // return [boolean, ['plan', 'real']]
        const opcionesFormateadas = formatoOpcionesY.format(creds_real.map( c => `${c}`))
        return [false, [cred_plan, opcionesFormateadas]]    // return [boolean, ['plan', 'real']]
    }

    /*** Si retorna 0 en lo real es porque no se encontro la cred     */
    evTurno(cred_plan: number, turno: 1|2|3): [boolean, [any, any]] {
        const i = this.real.findIndex( obj => obj.op_cred == cred_plan );
        if( turno == i+1 ) return [true, [turno, i+1]]      // return [boolean, ['plan', 'real']]
        return [false, [turno, i+1]]
    }

    evHrIni(plan_hrIni: string, real_hrIni?: string): [boolean, [any,any]] {
        if( !real_hrIni ) return [false, [plan_hrIni, MSG404]]

        const isOk = isHoraDentroDeRango(real_hrIni, plan_hrIni, { limInf: -1 })

        return [isOk, [plan_hrIni, real_hrIni]]
    }

    evHrTer(plan_hrIni: string, real_hrIni?: string): [boolean, [any,any]] {
        if( !real_hrIni ) return [false, [plan_hrIni, MSG404]]

        const isOk = isHoraDentroDeRango(real_hrIni, plan_hrIni)

        return [isOk, [plan_hrIni, real_hrIni]]
    }

    evCC(plan_CC: string, real_CC?: string): [boolean, [any,any]] {
        if( !real_CC ) return [false, [plan_CC, MSG404]]

        if( plan_CC == real_CC ) return [true, [plan_CC, real_CC]]
        return [false, [plan_CC, real_CC]]        
    }
    
    evHrCC(plan_hrCC?: string, real_hrCC?: string): [boolean|undefined, [any,any]] {
        if( !plan_hrCC ) return [undefined, ['-', '-']]
        if( !real_hrCC ) return [false, [plan_hrCC, MSG404]]

        const isOk = isHoraDentroDeRango(real_hrCC, plan_hrCC)
        return [isOk, [plan_hrCC, real_hrCC]]
    }

    evJornada(jornadaPlaneada: DiaCal, dia: string):[EvJornada, any] {
        const { 
            op_cred, op_estado, turno, hr_ini_t, lug_ini_cc, hr_ini_cc, 
            hr_ter_cc, lug_ter_cc, hr_ter_mod, hr_ter_t
        } = jornadaPlaneada
        const jReal = this.real.find( obj => obj.dia == dia && obj.op_cred == op_cred )

        const ev_hr_ini_t:   [boolean, [any,any]] =              this.evHrIni(  hr_ini_t,   jReal?.data[0].hr_ini_t);   // data[0]: primer media vuelta del operador (Mod-CC)
        const ev_lug_ini_cc: [boolean, [any,any]] =              this.evCC(     lug_ini_cc, jReal?.data[0].cc_sld);
        const ev_hr_ini_cc:  [boolean|undefined, [any,any]] =    this.evHrCC(   hr_ini_cc,  jReal?.data[0].hr_llgd);
        const ev_hr_ter_cc:  [boolean|undefined, [any,any]] =    this.evHrCC(   hr_ter_cc,  jReal?.data[1].hr_sld);
        const ev_lug_ter_cc: [boolean, [any,any]] =              this.evCC(     lug_ter_cc, jReal?.data[1].cc_sld);
        const ev_hr_ter_mod: [boolean|undefined, [any,any]] =    this.evHrCC(   hr_ter_mod, jReal?.data[1].hr_llgd);
        const ev_hr_ter_t:   [boolean, [any,any]] =              this.evHrIni(  hr_ter_t,   jReal?.data[1].hr_fin_t);   // data[1]: ultima media vuelta del operador (CC-Mod)

        return [
            {
                hr_ini_t:   ev_hr_ini_t[0],
                lug_ini_cc: ev_lug_ini_cc[0],
                hr_ini_cc:  ev_hr_ini_cc[0],
                hr_ter_cc:  ev_hr_ter_cc[0],
                lug_ter_cc: ev_lug_ter_cc[0],
                hr_ter_mod: ev_hr_ter_mod[0],
                hr_ter_t:   ev_hr_ter_t[0] 
            }, 
            {
                desc_hr_ini_t:   ev_hr_ini_t[1],
                desc_lug_ini_cc: ev_lug_ini_cc[1],
                desc_hr_ini_cc:  ev_hr_ini_cc[1],
                desc_hr_ter_cc:  ev_hr_ter_cc[1],
                desc_lug_ter_cc: ev_lug_ter_cc[1],
                desc_hr_ter_mod: ev_hr_ter_mod[1],
                desc_hr_ter_t:   ev_hr_ter_t[1]
            }  
        ]
    }

    evRuta(att: AttributesEvRutaModalidad): [boolean, [any, any]] {
        const {dia, eco, cred} = att
        let real_data: { dia: string | Date; eco: number; op_cred: number; data: TarjetaData[]; }[] = []
        if( eco ) real_data = this.real.filter( obj => obj.dia == dia && obj.eco == eco ) 
        else if( cred ) real_data = this.real.filter( obj => obj.dia == dia && obj.op_cred == cred )

        const real_rutas = real_data.map( obj => [obj.data[0].ruta, obj.data[1].ruta] ).flat().filter(Boolean)
        const real_rutas_unicos = [...new Set(real_rutas)]
        const plan_ruta  = (this.header) ? this.header.swap_ruta : 'Missing ruta';

        // Si es descanso no debe salir
        if( this.isDiaDescanso && real_rutas_unicos.length>0 ) return [false, ['Descanso', formatoOpcionesY.format(real_rutas_unicos)]]
        else if( this.isDiaDescanso && real_rutas_unicos.length==0 ) return [true, ['Descanso', '---']]
        // Solo debe haber una ruta y esta debe coincidir con la planeada
        if( real_rutas_unicos.length==1 && real_rutas_unicos[0]==plan_ruta ) return [true, [plan_ruta, real_rutas_unicos[0]]]
        
        return [false, [plan_ruta, formatoOpcionesY.format(real_rutas_unicos)]]
    }

    evModalidad(att: AttributesEvRutaModalidad): [boolean, [any, any]] {
        const {dia, eco, cred} = att
        let real_data: { dia: string | Date; eco: number; op_cred: number; data: TarjetaData[]; }[] = []
        if( eco ) real_data = this.real.filter( obj => obj.dia == dia && obj.eco == eco ) 
        else if( cred ) real_data = this.real.filter( obj => obj.dia == dia && obj.op_cred == cred )
        
        const real_modalidades = real_data.map( obj => [obj.data[0].ruta.match(regEx_words), obj.data[1].ruta.match(regEx_words)] ).flat(3).filter(Boolean)
        const real_modalidades_unicos = [...new Set(real_modalidades)]
        const plan_ruta  = (this.header) ? this.header.swap_ruta.match(regEx_words) : 'Missing modalidad';

        // Si es descanso no debe salir
        if( this.isDiaDescanso && real_modalidades_unicos.length>0 ) return [false, ['Descanso', formatoOpcionesY.format(real_modalidades_unicos)]]
        else if( this.isDiaDescanso && real_modalidades_unicos.length==0 ) return [true, ['Descanso', '---']]
        // Si la ruta no tiene modalidad sera null y 0 pero si tiene Solo debe haber una ruta y esta debe coincidir con la planeada
        if( 
            (real_modalidades.length==0 && plan_ruta===null) ||
            (real_modalidades_unicos.length==1 && real_modalidades_unicos[0]==plan_ruta![0]) 
        ) {
            const realDato = real_modalidades_unicos[0] || 'Ordinario'
            const planDato = plan_ruta || 'Ordinario'
            return [true, [planDato, realDato]]
        }
        
        return [false, [plan_ruta || '-', formatoOpcionesY.format(real_modalidades_unicos)]]
    }

    getCumplimientoOperador_jornada(jornada: DiaCal) {
        const { op_cred, turno, dia } = jornada;
        const [
            { hr_ini_t, lug_ini_cc, hr_ini_cc, hr_ter_cc, lug_ter_cc, hr_ter_mod, hr_ter_t },
            { desc_hr_ini_t, desc_lug_ini_cc, desc_hr_ini_cc, desc_hr_ter_cc, desc_lug_ter_cc, desc_hr_ter_mod, desc_hr_ter_t }
        ] = this.evJornada(jornada, (dia as string));
        const ev_cred = this.evCred(op_cred);
        const ev_turno = this.evTurno(op_cred, turno);

        const cumplimiento = {
            op_cred:    ev_cred[0],
            turno:      ev_turno[0],
            hr_ini_t    , 
            lug_ini_cc  ,
            hr_ini_cc   ,
            hr_ter_cc   ,
            lug_ter_cc  ,
            hr_ter_mod  ,
            hr_ter_t 
        }
        const cumplimientoDesc = {
            // prop:    ['plan', 'real'],
            op_cred:    ev_cred[1],
            turno:      ev_turno[1],
            hr_ini_t:   desc_hr_ini_t,
            lug_ini_cc: desc_lug_ini_cc,
            hr_ini_cc:  desc_hr_ini_cc,   // undefined = ['--','--'],
            hr_ter_cc:  desc_hr_ter_cc,   // undefined = ['--','--'],
            lug_ter_cc: desc_lug_ter_cc,
            hr_ter_mod: desc_hr_ter_mod,   // undefined = ['--','--'],
            hr_ter_t:   desc_hr_ter_t,
        }

        let cuentaTotal = 0
        let cuentaOk = 0
        Object.values(cumplimiento).map( c => {
            if( c === undefined ) return
            else if( c ) {
                cuentaTotal ++;
                cuentaOk ++;
            } else {
                cuentaTotal ++;
            }
        } )
        const op_cumplimiento = (cuentaOk/cuentaTotal)
        return { op_cumplimiento, cumplimiento, cumplimientoDesc, cuentaTotal }
    }

    //& Cumplimiento de la ruta
    getCumplimientoXecos(ecos: number[]): RutaCumplimiento{
        const fechas = this.datesRange
        //& Para cada eco.              | Cumplimiento del Economico en N dias
        const cumplimientoDeEcos = ecos.map( eco => {
            //& Iterar para cada dia.   | Cumplimiento del Economico X dia
            const cumplimientosXdia = fechas.map( dia => {
                const plan_all = this.rolCalendarios.filter( rol => rol.dia == dia && rol.eco == eco)
                const plan_lab = plan_all.filter( rol => rol.op_estado == 'L' )
                //ToDo: Factorizar esta parte (O solo hacerlo para Op, o pasarlo de antes??)
                //^ La data real pasado por el constructor
                const real_rawData = this.tarjetaData.filter( tjt => tjt.fecha == dia && tjt.eco == eco )
                const real_grouped: { op_cred: number, data: TarjetaData[] }[] = groupByRepeatedValue(real_rawData, 'op_cred', true).map( arr => ({ op_cred: arr[0].op_cred, data: arr}));
                // solo primer y ultima media vuelta de los operadores en el dia (con ese eco)
                const real = real_grouped.map( ({op_cred, data}) => {
                    if( data.length>0 ) return { dia: data[0].fecha, eco: data[0].eco, op_cred, data: [data[0], data[data.length-1]] }
                    return { dia, eco, op_cred, data: [] }
                } )
                //? La data real filtrada por dia, eco y solo la primer y ultima media vuelta
                this.real = real;
                
                //& Cumplimiento del operador X dia
                const cumplimientosXcred = plan_lab.map( jornada => {
                    const { op_cred } = jornada;
                    const { op_cumplimiento, cumplimiento, cumplimientoDesc, cuentaTotal } = this.getCumplimientoOperador_jornada(jornada)        

                    return { eco, op_cred, op_cumplimiento, cumplimiento, cumplimientoDesc, cuentaTotal }
                })

                //& Cumpli del eco en 1 dia 
                const plan_des = plan_all.filter( rol => rol.op_estado != 'L' )
                const turnosLaborando = Math.abs(plan_all.length - plan_des.length)     // La diferencia es para saber si todos los turnos descansan
                if(turnosLaborando==0) this.isDiaDescanso = true
                else this.isDiaDescanso = false

                let cuentaTotal = 0;
                let cuentaOk = 0;

                //ToDO:  this.evRuta() & this.evModalidad()
                const ev_ruta = this.evRuta({dia, eco})
                const ev_modalidad = this.evModalidad({dia, eco})
                const cumplimiento = {
                    ruta:       ev_ruta[0],
                    modalidad:  ev_modalidad[0]
                }
                const cumplimientoDesc = {
                    // prop:    ['plan', 'real'],
                    ruta:       ev_ruta[1],
                    modalidad:  ev_modalidad[1]
                }

                if(cumplimientosXcred.length>0){
                    cumplimientosXcred.map( obj => {
                        const { op_cumplimiento, cuentaTotal: op_cuentaTotal } = obj;
                        cuentaTotal += op_cuentaTotal
                        cuentaOk += (op_cumplimiento*op_cuentaTotal)
                    } )
                } else {
                    // Turno1: 7 puntos a verificar, Turno2: 6 puntos a verificar, Turno3: 8 puntos a verificar 
                    cuentaTotal = 7*turnosLaborando
                    if(turnosLaborando == 0) {
                        plan_des.filter( rol => rol.op_tipo == 'ORD' ).map( (obj, i) => {
                            cumplimiento[`turno${i+1}`] = true 
                            cumplimientoDesc[`turno${i+1}`] = ['Descanso', '---']
                        } )
                    }
                }

                Object.values(cumplimiento).map( c => {
                    if( c === undefined ) return
                    else if( c ) {
                        cuentaTotal ++;
                        cuentaOk ++;
                    } else {
                        cuentaTotal ++;
                    }
                })

                const eco_cumplimiento = (cuentaOk/cuentaTotal); 

                return { eco, servicio: plan_all[0].servicio, fecha: dia, eco_cumplimiento, cumplimientosXcred, cumplimiento, cumplimientoDesc }
            })

            //& Cumpli del eco en varios dias
            // console.log('------- -------- -------');
            let porcentaje_cuenta = 0
            cumplimientosXdia.forEach( obj => {
                porcentaje_cuenta += obj.eco_cumplimiento
            } )
            const ecoInPeriod_cumplimiento = (porcentaje_cuenta/cumplimientosXdia.length)
            return { eco, ecoInPeriod_cumplimiento, cumplimientosXdia }
        } )

        //& Cumpli de Ruta (de varios ecos)
        let porcentaje_cuenta = 0
        cumplimientoDeEcos.forEach( obj => {
            porcentaje_cuenta += obj.ecoInPeriod_cumplimiento
        } )
        const ruta_cumplimiento = (porcentaje_cuenta/cumplimientoDeEcos.length)
        return { ruta_cumplimiento, cumplimientoDeEcos }
    }

    getCumlimientoXcred(cred: number){
        const fechas = this.datesRange

        //& Iterar para cada dia.   | Cumplimiento del operador X dia
        const op_cumplimientoXdia = fechas.map( dia => {
            const plan = this.rolCalendarios.filter( rol => rol.dia == dia && rol.op_cred == cred)
            // const plan_lab = plan_all.filter( rol => rol.op_estado == 'L' )

            const real_rawData = this.tarjetaData.filter( tjt => tjt.fecha == dia && tjt.op_cred == cred )
            const real_grouped: { op_cred: number, data: TarjetaData[] }[] = groupByRepeatedValue(real_rawData, 'op_cred', true).map( arr => ({ op_cred: arr[0].op_cred, data: arr}));
            // solo primer y ultima media vuelta de los operadores en el dia (con ese eco)
            const real = real_grouped.map( ({op_cred, data}) => {
                if( data.length>0 ) return { dia: data[0].fecha, eco: data[0].eco, op_cred, data: [data[0], data[data.length-1]] }
                return { dia, eco: cred, op_cred, data: [] }
            } )
            //? La data real filtrada por dia, eco y solo la primer y ultima media vuelta
            this.real = real;
            
            // //& Cumplimiento del operador X dia
            if(plan.length > 1) console.warn('Tienes mas de 1 jornada en el dia', cred, dia);
            const jornada = plan[0]
            const { op_cred } = jornada;
            const { op_cumplimiento, cumplimiento, cumplimientoDesc, cuentaTotal } = this.getCumplimientoOperador_jornada(jornada)        
            return { dia, op_cumplimiento, cumplimiento, cumplimientoDesc }
        }) 

        let cuentaTotal = 0
        op_cumplimientoXdia.map( obj => { cuentaTotal += obj.op_cumplimiento } )
        const op_cumplimiento = cuentaTotal/(op_cumplimientoXdia.length)
        
        return { op_cumplimiento, op_cumplimientoXdia }
    }

}


export default CumplimientoRol