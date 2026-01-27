export const formEcoIn = [
    {
        id:"folio",
        label: "folio",
        cols: 4
    },
    {
        id:"economico",
        label: "economico",
        cols: 4
    },
    {
        id:"ruta",
        label: "ruta",
        cols: 4
    },
    {
        id:"tipo_Mtto",
        label: "tipo_Mtto",
        inputType: "select",
        optionsforSelect:[
            {name: "Correctivo", code:"correctivo"},
            {name: "A", code:"A"},
            {name: "B", code:"B"},
            {name: "C", code:"C"},
            {name: "D", code:"D"},
            {name: "E", code:"E"},
            {name: "F", code:"F"},
            {name: "G", code:"G"},
        ],
        cols: 4
    },
    {
        id:"falla",
        label: "falla",
        cols: 8
    },
    {
        id:"operador_Cred",
        label: "operador_Cred",
    },
    {
        id:"operador_Nombre",
        label: "operador_Nombre",
    },
    {
        id:"mecanico_Inicial_Cred",
        label: "mecanico_Inicial_Cred",
    },
    {
        id:"mecanico_Inicial_Nombre",
        label: "mecanico_Inicial_Nombre",
    },
] 

// ['Id', 'Folio', 'Eco', 'Modelo', 'Km', 'Ruta', 'Tipo mtto.', 'Falla', 'Operador', 'Mecanico Inicial' ]


export const formEcoOut = [
    {
        id:"folio",
        label: "folio",
        cols: 4
    },
    {
        id:"economico",
        label: "economico",
        cols: 4
    },
    {
        id:"situacion_mtto",
        label: "situacion_mtto",
        inputType: "select",
        optionsforSelect:[
            {name: "Proceso", code:"Proceso"},
            {name: "F/R", code:"F/R"},
            {name: "GT", code:"GT"},
        ],
        cols: 4
    },
    {
        id:"estatus",
        label: "estatus",
        inputType: "select",
        optionsforSelect:[
            {name: " ", code: null},
            {name: "Disponible", code:"Disponible"},
            {name: "Cancelada X aclaracion", code:"Cancelada X aclaracion"},
            {name: "Cancelada X GSP", code:"Cancelada X GSP"},
            {name: "Improcedente", code:"Improcedente"},
            {name: "Propuesta Baja", code:"Propuesta Baja"},
            {name: "Salio a ruta", code:"Salio a ruta"},
            {name: "Verifficacion", code:"Verifficacion"},
        ],
        cols: 4
    },
    {
        id:"mecanico_Final_Cred",
        label: "mecanico_Final_Cred",
        cols: 4
    },
    {
        id:"mecanico_Final_Nombre",
        label: "mecanico_Final_Nombre",
        cols: 4
    },
    {
        id:"diagnosticador_Cred",
        label: "diagnosticador_Cred",
        cols: 4
    },
    {
        id:"diagnosticador_Nombre",
        label: "diagnosticador_Nombre",
        cols: 4
    },
]



export const formEcoIn2 = [
    {
        id:"modulo",
        label: "Modulo",
        // disabled:true,
        cols:2
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
        cols:4,
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
];
