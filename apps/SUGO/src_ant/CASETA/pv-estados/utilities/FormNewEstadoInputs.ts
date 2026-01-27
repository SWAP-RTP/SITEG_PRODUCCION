import { DynamicInput } from "../../../shared/components/FormMaker/MiniFormMaker";


const subInputs_base: DynamicInput[] = [
    { name:'op_cred', label: 'Credencial', keyfilter: 'int' },
    { name:'op_turno', label: 'Turno', type:'text', keyfilter: 'int' },
    { name:'extintor', label: 'No. Extintor', type:'text', keyfilter: 'int' },
    { name:'ruta_modalidad', label: 'Modalidad', type:'select', options: [], filter: true },     //! Dynamic
    { name:'ruta', label: 'Ruta', type:'select', options: [], filter: true },   //! Dynamic
    { name:'ruta_cc', label: 'CC', type:'select', options: [] },    //! Dynamic
] 

const subInputs_base_despacho = [...subInputs_base];
subInputs_base_despacho.splice(2,0, { name:'eco_tipo', label: 'Eco de', type:'select', options: [{name:'PLANTA', value:1}, {name:'POSTURA', value:2}] });


const subInputs_terminoJornada: DynamicInput[] = [
    { name:'motivo_desc_tipo_termino', label: 'Tipo de termino', type:'select', options: [{name:'Normal', value:'Normal'}, {name:'Discontinuo', value:'Discontinuo'}] }
]
const subInputs_accidente: DynamicInput[] = [
    { name:'direccion', label: 'Lugar',  onChangeSetValue: (v) => v.toUpperCase() },
    { name:'motivo_desc_observaciones', label: 'Descripción del accidente' }
];
const subInputs_fallaMec: DynamicInput[] = [
    { name:'motivo_desc_falla_mec', label: 'Falla' }
];
const subInputs_faltaCombustibleIn: DynamicInput[] = [
    { name:'motivo_desc_falta_combustible_tipo', label: 'Tipo de combustible', type:'select', options: [{name: 'DIÉSEL', value: 'DIÉSEL' }, {name: 'UREA ADBLUE AL 32.5%', value: 'UREA ADBLUE AL 32.5%' }, {name: 'GAS NATURAL', value: 'GAS NATURAL' }] },
    { name:'motivo_desc_observaciones', label: 'Observaciones' }
];
const subInputs_faltaCombustibleOut: DynamicInput[] = [
    { name:'motivo_desc_falta_combustible_tipo', label: 'Tipo', type:'select', options: [{name: 'DIÉSEL', value: 'DIÉSEL' }, {name: 'UREA ADBLUE AL 32.5%', value: 'UREA ADBLUE AL 32.5%' }, {name: 'GAS NATURAL', value: 'GAS NATURAL' }] },
    { name:'motivo_desc_falta_combustible_modulo', label: 'Se dirige a', type:'select', options: [] },      //! Dynamic
    { name:'motivo_desc_observaciones', label: 'Observaciones' }
];
const subInputs_sefi: DynamicInput[] = [
    { name:'motivo_desc_sefi_nombre', label: 'Nombre (preliminar)',  onChangeSetValue: (v) => v.toUpperCase()},
    { name:'motivo_desc_sefi_origen', label: 'Origen',  onChangeSetValue: (v) => v.toUpperCase()},
    { name:'motivo_desc_sefi_destino', label: 'Destino',  onChangeSetValue: (v) => v.toUpperCase()},
    { name:'motivo_desc_observaciones', label: 'Observaciones'},
];
const subInputs_tallerExterno: DynamicInput[] = [
    { name:'motivo_desc_taller', label: 'Taller',  onChangeSetValue: (v) => v.toUpperCase()},
    { name:'motivo_desc_direccion', label: 'Direccion',  onChangeSetValue: (v) => v.toUpperCase()},
];
const subInputs_verificacion: DynamicInput[] = [
    { name:'motivo_desc_verificentro', label: 'Verificentro',  onChangeSetValue: (v) => v.toUpperCase()},
    { name:'motivo_desc_observaciones', label: 'Observaciones' },
];
const subInputs_metrobus: DynamicInput[] =[
    { name:'op_cred', label: 'Credencial', keyfilter: 'int' },
    { name:'op_turno', label: 'Turno', type:'text', keyfilter: 'int' },
    { name:'extintor', label: 'No. Extintor', type:'text', keyfilter: 'int' },
    { name:'extintor2', label: 'No. Extintor 2', type:'text', keyfilter: 'int' },
    { name:'ruta_modalidad', label: 'Modalidad', disabled: true, value: 'METROBÚS' },
    { name:'ruta', label: 'Ruta/linea/corrida', onChangeSetValue: (v) => v.toUpperCase() },
    { name:'motivo_desc_mb_origen', label: 'Origen *', onChangeSetValue: (v) => v.toUpperCase()},
    { name:'motivo_desc_mb_destino', label: 'Destino *', onChangeSetValue: (v) => v.toUpperCase()},
]
const subInputs_juridico: DynamicInput[] = [
    { name:'motivo_desc_razon', label: 'Razon',  onChangeSetValue: (v) => v.toUpperCase()},
    { name:'motivo_desc_observaciones', label: 'Observaciones' },
];

const subInput_observaciones: DynamicInput = { name:'motivo_desc_observaciones', label: 'Observaciones'}



//& Relacionar motivo_id con sus inputs (requeridos)
// UseFetchGet(`${API}/api/caseta/pv-estados/motivos`) => {id, desc, tipo, eco_disponible, ...etc}[]
export const subInputsCatalogo = {
    // Despacho
    1:  [ ...subInputs_base_despacho],
    // // 2:  subInputs_cargaDiesel,    // eliminado
    3:  [ ...subInputs_base_despacho ],     // 	RE EMPLACAMIENTO
    4:  [ ...subInputs_base_despacho.slice(0, subInputs_base.length-3), ...subInputs_verificacion ],    // VERIFICACIÓN
    7:  [ ...subInputs_base_despacho.slice(0, subInputs_base.length-3), ...subInputs_tallerExterno ],   // TALLER EXTERNA	
    18: [ ...subInputs_base_despacho.slice(0, subInputs_base.length-3), ...subInputs_sefi ],            // SEFI (Nuevo)
    25: [ ...subInputs_metrobus ],  // SERVICIO MB
    28: [ ...subInputs_base_despacho.slice(0, subInputs_base.length-3), subInput_observaciones ],  // GARANTIA
    // 35: [ ...subInputs_base, ], // transferencia
    37: [ ...subInputs_base_despacho.slice(0, subInputs_base.length-3), ...subInputs_sefi ],            // RUTA-PRUEBA
    
    // Recepcion
    9:  [ ...subInputs_base, ...subInputs_terminoJornada],  // TERMINO DE JORNADA
    12: [ ...subInputs_base, ...subInputs_fallaMec],    // MANTENIMIENTO CORRECTIVO
    13: [ ...subInputs_base, subInput_observaciones ], // MANTENIMIENTO PREVENTIVO
    14: [ ...subInputs_base, ], // REGRESO POR AVALUO
    17: [ ...subInputs_base, ...subInputs_faltaCombustibleIn], // FALTA DE COMBUSTIBLES
    26: [ ...subInputs_metrobus ],  // SERVICIO MB
    31: [ ...subInputs_base, subInput_observaciones ], // JURIDICO
    34: [ ...subInputs_base, ], // FALTA DE RELEVO
    // 36: [ ...subInputs_base, ], // transferencia

    // Actualizacion
    5:  [ ...subInputs_accidente ],    // ACCIDENTE (COLISIONES, VANDALISMO, ETC.)
    6:  [ ...subInputs_fallaMec ],     // FALLA MÉCANICA
    // 8:  [],      // DISPONIBLE EN RUTA (LIBRE)
    // // 10: subInputs_faltaRelevo,    // eliminado
    11: [...subInputs_accidente],               // ACCIDENTE (COLISIONES, VANDALISMO, ETC.)
    // 15: [],     // DISPONIBLE EN PATIO (LIBRE)
    16: [ ...subInputs_faltaCombustibleOut ],     // FALTA DE COMBUSTIBLES
    19: subInputs_base.slice(3),                  // SERVICIO
    20: [ ...subInputs_verificacion ],            // VERIFICACIÓN
    21: [ ...subInputs_sefi ],                    // SEFI (Nuevo)
    22: [ ...subInputs_faltaCombustibleIn ],      // FALTA DE COMBUSTIBLES
    23: [ ...subInputs_fallaMec ],        // MANTENIMIENTO CORRECTIVO
    24: [ subInput_observaciones ],     // MANTENIMIENTO PREVENTIVO
    29: [ subInput_observaciones ],     // GARANTIA
    30: [ subInput_observaciones ],     // PROPUESTA PARA BAJA (PB)
    32: [ subInput_observaciones ],     // PROCESO ADMINISTRATIVO
    33: [ ...subInputs_juridico ],      // JURIDICO
}
