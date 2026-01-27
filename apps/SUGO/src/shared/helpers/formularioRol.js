export const formularioRol = [
    {
        id:"modulo",
        label: "Modulo",
        disabled:true,
        cols:6
    },
    {
        
        id:"ruta",
        label: "Ruta",
        disabled:true,
        cols:6
    },
    {
        cols:1,
        id:"idServicio",
        label: "Servicio",
        info: "Selecciona el Sevcicio de la Ruta",
        inputType: "select",
        optionsforSelect: [
            {name:"1", code: 1},
            {name:"2", code: 2},
            {name:"3", code: 3},
            {name:"4", code: 4},
            {name:"5", code: 5},
            {name:"6", code: 6},
            {name:"7", code: 7},
            {name:"8", code: 8},
            {name:"9", code: 9},
            {name:"10", code: 10},
        ]
    },
    {
        cols: 1,
        id:"economico",
        label: "Economico",
        info: "Ingresa No de Economico"
    },
    {
        cols: 2,
        id:"sistema",
        label: "Sistema",
        info: "Selecciona Sistema",
        inputType: "select",
        optionsforSelect:[
            {name: "T/F", code:"TF"},
            {name: "E/S", code:"ES"},
        ]
    },
    {
        cols:2,
        id:"primerTurnoCredencial",
        label: "1er Turno",
        info: "No. Credencial 1er Turno"
    },
    {
        cols:2,
        id:"segundoTurnoCredencial",
        label: "2do Turno",
        info: "No. Credencial 2do Turno"
    },
    {
        cols:2,
        id:"tercerTurnoCredencial",
        label: "3er Turno",
        info: "No. Credencial 3er Turno"
    },
    {
        cols:2,
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
        info: "Hora de Inicio de 1er Turno"
    },
    {
        cols:2,
        id:"salidaModulo",
        label: "Salida Modulo",
        info: "Hora de Salida de Modulo"
    },
    {
        cols:2,
        id:"inicioCierreCircuito",
        label: "Inicio en C. C.",
        info: "Hora de Inicio en Cierre de Circuito"
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
        info: "Hora de termino de labores 1er Turno"
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
        info: "Hora de Inicio de Labores 2do Turno"
    },
    {
        
        id:"lugarInicioSegundoTurno",
        label: "Lugar Inicio 2do Turno",
        info: "Lugar de Inicio de Labores 2do Turno"
    },
    {
        
        id:"finSegundoTurno",
        label: "Fin 2do Turno",
        info: "Hora de Fin de Labores 2do Turno"
    },
    {
        
        id:"lugarFinSegundoTurno",
        label: "Lugar de Fin 2do Turno",
        info: "Lugar de Fin de Labores 2do Turno"
    },
    {
        
        id:"inicioTercerTurno",
        label: "Inicio 3er Turno",
        info: "Hora de Inicio de Labores 3er Turno"
    },
    {
        
        id:"lugarInicioTercerTurno",
        label: "Lugar Inicio 3er Turno",
        info: "Lugar de Inicio de Labores 3er Turno"
    },
    {
        
        id:"finTercerTurno",
        label: "Fin 3er Turno",
        info: "Hora de Fin de Labores 3er Turno"
    },
    {
        
        id:"finModulo",
        label: " Fin en Modulo",
        info: "Hora de Fin de Labores en Modulo"
    },
    
];

export const formRuta = [
    {
        
        id:"modulo",
        label: "Modulo",
        disabled:true
    },
    {
        
        id:"ruta",
        label: "Ruta",
        disabled:true
    },
]