import { FormInput } from "../interfaces/FormInputInterface";


export const fomularioTarjeta: FormInput[] = [
    {
        id:"idServicio",
        label: "Servicio",
        info: "Selecciona el Sevcicio de la Ruta"

    },
    {
        id:"economico",
        label: "Economico",
        info: "Ingresa No de Economico"
    },
    {
        id:"primerTurnoCredencial",
        label: "1er Turno",
        callBackForOnBlur: (obj) => { console.log(obj); },
        
    },
]

export const inputs4Sabana: FormInput[] = [
    {
        id: 'modulo',
        label: 'Modulo',
        disabled: true,
        cols: 6,
    },
    {
        cols: 6,
        id: 'ruta',
        label: 'Ruta',
        disabled: true,
    },
    {
        id: 'credencialOperador',
        label: 'Credencial del controlador',
    },
    {
        id: 'economico',
        label: 'Economico',
    },
    {
        id: 'nombreOperador',
        label: 'Credencial Operador',
    },
    {
        id: 'horaRelevo',
        label: 'Hora relevo',
        inputType: "mask",
        properties: { mask: '99:99:99' }
    },
    {
        id: 'llegadaCircuito',
        label: 'Llegada a circuito',
        info: 'Hora de llegada a CC',
        inputType: "mask",
        properties: { mask: '99:99:99' }
    },
    {
        id: 'tiempoRecorrido',
        label: 'Tiempo de recorrido (min)',
    },
    {
        id: 'primerSalida',
        label: 'Hora de Salida',
        info: 'Hora de la primera salida',
        inputType: "mask",
        properties: { mask: '99:99:99' }
    },
    {
        id: 'destino',
        label: 'Destino',
    },
    {
        id: 'noBoleto',
        label: 'No. Boleto',
    },
    {
        id: 'venta',
        label: 'Venta',
    },


    // * --------------------------------------
    // {
    //     id: 'horaLlegada',
    //     label: 'Hora de llegada',
    //     inputType: "mask",
    //     properties: { mask: '99:99:99' }
    // },
    // {
    //     id: 'segundaSalida',
    //     label: 'Segunda salida',
    //     info: 'Hora de la segunda salida',
    //     inputType: "mask",
    //     properties: { mask: '99:99:99' }
    // },
    // {
    //     id: 'noBoletoSegundaSalida',
    //     label: 'No. de Boleto Segunda Salida',
    // },
    // {
    //     id: 'ventaSegundaSalida',
    //     label: 'Venta segunda salida',
    // },
    // {
    //     id: 'tiempoRecorridoSegunda',
    //     label: 'Tiempo de recorrido 2',
    //     info: 'Hora de llegada del segundo Recorrido',
    //     inputType: "mask",
    //     properties: { mask: '99:99:99' }
    // },
    // {
    //     id: 'destinoSegunda',
    //     label: 'Destino segunda',
    // },
    // {
    //     id: 'horaLlegadaSegunda',
    //     label: 'Hora de llegada 2',
    //     inputType: "mask",
    //     properties: { mask: '99:99:99' }
    // },
    // {
    //     id: 'terceraSalida',
    //     label: 'Tercera salida',
    //     info: 'Hora de salida 3',
    //     inputType: "mask",
    //     properties: { mask: '99:99:99' }
    // },
    // {
    //     id: 'noBoletosTercera',
    //     label: 'No. de boletos 3',
    // },
    // {
    //     id: 'ventaTercera',
    //     label: 'Venta tercera',
    // },
    // {
    //     id: 'tiempoRecorridoTercera',
    //     label: 'Tiempo de Recorrido 3',
    // },
    // {
    //     id: 'destinoTercera',
    //     label: 'Destino Tercera',
    // },
    // {
    //     id: 'horaRinde',
    //     label: 'Hora Rinde',
    //     inputType: "mask",
    //     properties: { mask: '99:99:99' }
    // },
    // {
    //     id: 'ventaTotal',
    //     label: 'Venta Total',
    // },

]

export const inputs4EditSabana: FormInput[] = [
    {
        id: 'modulo',
        label: 'Modulo',
        disabled: true,
        cols: 6,
    },
    {
        cols: 6,
        id: 'ruta',
        label: 'Ruta',
        disabled: true,
    },
    {
        id: 'economico',
        label: 'Economico',
    },
    {
        id: 'llegadaCircuito',
        label: 'Llegada a circuito',
        info: 'Hora de llegada a CC',
        inputType: "mask",
        properties: { mask: '99:99:99' }
    },
    {
        id: 'horaRelevo',
        label: 'Hora relevo',
        inputType: "mask",
        properties: { mask: '99:99:99' }
    },
    {
        id: 'primerSalida',
        label: 'Primer Salida',
        info: 'Hora de la primera salida',
        inputType: "mask",
        properties: { mask: '99:99:99' }
    },
    {
        id: 'noBoleto',
        label: 'No. Boleto',
    },
    {
        id: 'venta',
        label: 'Venta',
    },
    {
        id: 'tiempoRecorrido',
        label: 'Tiempo de recorrido',
    },
    {
        id: 'destino',
        label: 'Destino',
    },
    {
        id: 'horaLIegada',
        label: 'Hora de llegada',
    },
    /*
    * --------------------------------------
    {
        id: 'segundaSalida',
        label: 'Segunda salida',
    },
    {
        id: 'noBoletoSegundaSalida',
        label: 'No. de Boleto Segunda Salida',
    },
    {
        id: 'ventaSegundaSalida',
        label: 'Venta segunda salida',
    },
    {
        id: 'tiempoRecorridoSegunda',
        label: 'Tiempo de recorrido 2',
    },
    {
        id: 'destinoSegunda',
        label: 'Destino segunda',
    },
    {
        id: 'horaLlegadaSegunda',
        label: 'Hora de llegada 2',
    },
    {
        id: 'terceraSalida',
        label: 'Tercera salida',
    },
    {
        id: 'noBoletosTercera',
        label: 'No. de boletos 3',
    },
    {
        id: 'ventaTercera',
        label: 'Venta tercera',
    },
    {
        id: 'tiempoRecorridoTercera',
        label: 'Tiempo de Recorrido 3',
    },
    {
        id: 'destinoTercera',
        label: 'Destino Tercera',
    },
    {
        id: 'horaRinde',
        label: 'Hora Rinde',
    },
    {
        id: 'ventaTotal',
        label: 'Venta Total',
    },
    {
        id: 'nombreOperador',
        label: 'Nombre Operador',
    },
    {
        id: 'credencialOperador',
        label: 'Credencial del operador',
    },

    */

]



export const formRol2: FormInput[] = [
    {
        id:"modulo",
        label: "Modulo",
        disabled:true,
        cols:4
    },
    {
        
        id:"ruta",
        label: "Ruta",
        // disabled:true,
        cols:4
    },
    {
        
        id:"servicioTipo",
        label: "Tipo de servicio",
        // disabled:true,
        cols:4
    },
    {
        cols: 1,
        id:"idServicio",
        label: "N°",
        // info: "Define el orden de salida",
        disabled: !true,
        // inputType: "select",
        // optionsforSelect: [
        //     {name:"1", code: 1},
        //     {name:"2", code: 2},
        //     {name:"3", code: 3},
        //     {name:"4", code: 4},
        //     {name:"5", code: 5},
        //     {name:"6", code: 6},
        //     {name:"7", code: 7},
        //     {name:"8", code: 8},
        //     {name:"9", code: 9},
        //     {name:"10", code: 10},
        // ]
    },
    {
        cols: 1,
        id:"economico",
        label: "Economico",
        info: "Ingresa No de Economico",

    },
    {
        cols: 1,
        id:"sistema",
        label: "Turno",
        info: "Selecciona Sistema",
        inputType: "select",
        optionsforSelect:[
            {name: "T/F", code:"TF"},
            {name: "E/S", code:"ES"},
        ],
    },
    {
        cols:2,
        id:"primerTurnoCredencial",
        label: "1er Turno",
        info: "No. Credencial 1er Turno",
        validaciones: {
            required: { value: true, message: 'Debe haber una credencial'},
            validate: (a) => !isNaN(a) || 'Debe ser una credencia valida (num)'
        }
    },
    {
        cols:2,
        id:"segundoTurnoCredencial",
        label: "2do Turno",
        info: "No. Credencial 2do Turno",
        validaciones: {
            required: false,
            validate: (a) => !isNaN(a) || 'Debe ser una credencia valida (num)'
        }
    },
    {
        cols:2,
        id:"tercerTurnoCredencial",
        label: "3er Turno",
        info: "No. Credencial 3er Turno",
        validaciones: {
            required: false,
            validate: (a) => !isNaN(a) || 'Debe ser una credencia valida (num)'
        }
    },
    {
        cols:3,
        id:"diasDescanso",
        label: "Dias de Descanso",
        info: "Ingresa dias de descanso (L-V)",
        inputType: "multiSelect",
        optionsforSelect:[
            {name: "Lunes", code:"Lunes"},
            {name: "Martes", code:"Martes"},
            {name: "Miercoles", code:"Miercoles"},
            {name: "Jueves", code:"Jueves"},
            {name: "Viernes", code:"Viernes"},
            {name: "Sabado", code:"Sabado"},
            {name: "Domingo", code:"Domingo"},
        ]
    },
    {
        cols:2,
        id:"inicioPrimerTurno",
        label: "Inicio 1er Turno",
        info: "Hora de Inicio de 1er Turno",
        inputType: "mask",
        properties: { mask: '99:99:99' },
        validaciones: {required: { value: true, message: 'Debe habber una hora de inicio'}}
    },
    {
        cols:2,
        id:"salidaModulo",
        label: "Salida Modulo",
        info: "Hora de Salida de Modulo",
        inputType: "mask",
        properties: { mask: '99:99:99' }
    },
    {
        cols:2,
        id:"inicioCierreCircuito",
        label: "Inicio en C. C.",
        info: "Hora de Inicio en Cierre de Circuito",
        inputType: "mask",
        properties: { mask: '99:99:99' }
    },
    {
        cols:2,
        id:"lugarInicioServicio",
        label: "Lugar de Inicio",
        info: "Inicio de Servicio"
    },
    {
        cols:2,
        id:"finPrimerTurno",
        label: "Fin de 1er Turno",
        info: "Hora de termino de labores 1er Turno",
        inputType: "mask",
        properties: { mask: '99:99:99' }
    },
    {
        cols:2,
        id:"lugarTermino1erTurno",
        label: "Lugar de Fin 1er Turno",
        info: "Lugar de Termino er turno"
    },
    {
        
        id:"inicioSegundoTurno",
        label: "Inicio 2do Turno",
        info: "Hora de Inicio de Labores 2do Turno",
        inputType: "mask",
        properties: { mask: '99:99:99' },
        validaciones: { required: false }
    },
    {
        
        id:"lugarInicioSegundoTurno",
        label: "Lugar Inicio 2do Turno",
        info: "Lugar de Inicio de Labores 2do Turno",
        validaciones: { required: false }
    },
    {
        
        id:"finSegundoTurno",
        label: "Fin 2do Turno",
        info: "Hora de Fin de Labores 2do Turno",
        inputType: "mask",
        properties: { mask: '99:99:99' },
        validaciones: { required: false }
    },
    {
        
        id:"lugarFinSegundoTurno",
        label: "Lugar de Fin 2do Turno",
        info: "Lugar de Fin de Labores 2do Turno",
        validaciones: { required: false }
    },
    {
        
        id:"inicioTercerTurno",
        label: "Inicio 3er Turno",
        info: "Hora de Inicio de Labores 3er Turno",
        inputType: "mask",
        properties: { mask: '99:99:99' },
        validaciones: { required: false }
    },
    {
        
        id:"lugarInicioTercerTurno",
        label: "Lugar Inicio 3er Turno",
        info: "Lugar de Inicio de Labores 3er Turno",
        validaciones: { required: false }
    },
    {
        
        id:"finTercerTurno",
        label: "Fin 3er Turno",
        info: "Hora de Fin de Labores 3er Turno",
        inputType: "mask",
        properties: { mask: '99:99:99' },
        validaciones: { required: false }
    },
    {
        
        id:"finModulo",
        label: " Fin en Modulo",
        info: "Hora de Fin de Labores en Modulo",
        inputType: "mask",
        properties: { mask: '99:99:99' }
    },
    
];
