import { FormInput } from "../interfaces/FormInputInterface";

export const formCubreDescanso: FormInput[] = [
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
        cols: 2,
        id:"numServicio",
        label: "Servicio",
        info: "Orden de salida",
    },
    {
        cols: 2,
        id:"economico",
        label: "Economico",
        info: "Ingresa No de Economico"
    },
    {
        cols: 2,
        id:"sistema",
        label: "Turno",
        info: "Selecciona tipo de turno",
        inputType: "select",
        optionsforSelect:[
            {name: "T/F", code:"TF"},
            {name: "E/S", code:"ES"},
        ],
        validaciones: { required: false }
    },
    {
        cols: 3,
        id:"idServicio",
        label: "Cubrir servicios",
        info: "Servicios a cubrir del Rol",
    },
    {
        cols: 3,
        id:"diasDescanso",
        label: "Dias de Descanso",
        info: "Ingresa dias de descanso (L-V)",
        inputType: "multiSelect",
        optionsforSelect:[
            {name: "Sabado", code:"Sabado"},
            {name: "Domingo", code:"Domingo"},
            {name: "Lunes", code:"Lunes"},
            {name: "Martes", code:"Martes"},
            {name: "Miercoles", code:"Miercoles"},
            {name: "Jueves", code:"Jueves"},
            {name: "Viernes", code:"Viernes"},
        ]
    },
    {
        cols: 4,
        id:"primerTurnoCredencial",
        label: "1er Turno",
        info: "No. Credencial 1er Turno",
        validaciones: { required: false }
    },
    {
        cols: 4,
        id:"segundoTurnoCredencial",
        label: "2do Turno",
        info: "No. Credencial 2do Turno",
        validaciones: { required: false }
    },
    {
        cols: 4,
        id:"tercerTurnoCredencial",
        label: "3er Turno",
        info: "No. Credencial 3er Turno",
        validaciones: { required: false }
    },
]

export const formCubreDescanso4Edit: FormInput[] = [
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
        cols: 2,
        id:"numServicio",
        label: "Servicio",
        info: "Orden de salida",
    },
    {
        cols: 2,
        id:"economico",
        label: "Economico",
        info: "Ingresa No de Economico"
    },
    {
        cols: 2,
        id:"sistema",
        label: "Turno",
        info: "Selecciona tipo de turno",
        inputType: "select",
        optionsforSelect:[
            {name: "T/F", code:"TF"},
            {name: "E/S", code:"ES"},
        ]
    },
    {
        cols: 3,
        id:"idServicio",
        label: "Cubrir servicios",
        info: "Servicios a cubrir del Rol",
    },
    {
        cols:3,
        id:"diasDescanso",
        label: "Dias de Descanso",
        info: "Ingresa dias de descanso (L-V)",
        inputType: "multiSelect",
        optionsforSelect:[
            {name: "Sabado", code:"Sabado"},
            {name: "Domingo", code:"Domingo"},
            {name: "Lunes", code:"Lunes"},
            {name: "Martes", code:"Martes"},
            {name: "Miercoles", code:"Miercoles"},
            {name: "Jueves", code:"Jueves"},
            {name: "Viernes", code:"Viernes"},
        ]
    },
    {
        cols: 4,
        id:"primerTurnoCredencial",
        label: "1er Turno",
        info: "No. Credencial 1er Turno"
    },
    {
        cols: 4,
        id:"segundoTurnoCredencial",
        label: "2do Turno",
        info: "No. Credencial 2do Turno",
        validaciones: { required: false }
    },
    {
        cols: 4,
        id:"tercerTurnoCredencial",
        label: "3er Turno",
        info: "No. Credencial 3er Turno",
        validaciones: { required: false }
    },
]