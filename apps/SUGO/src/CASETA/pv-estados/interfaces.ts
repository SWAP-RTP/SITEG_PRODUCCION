

export interface Result {
    id:                number;              //!
    momento:           string; // Date;     
    tipo:              number;       //!
    eco:               number;              
    eco_tipo?:         1|2;     
    eco_estatus:       number | string;     // Del motivo
    motivo_id:         number;              // Del motivo
    motivo_desc?:      string;              // JSON.stringify de inputs 'motivo_desc_*'
    modulo?:           number;              // Del motivo  cuando motivo.tipo=2  y es = createdBy_modulo
    direccion?:        string;              // especificar la direccion, ej: motivo = accidente
    ruta?:             string;              
    ruta_modalidad?:   string;              
    ruta_cc?:          string;              
    op_cred?:          number;              
    op_turno?:         number;              
    extintor?:         string;              
    estatus:           number | string;     //!
    createdAt:         string; // Date;     //!
    createdBy:         number;              
    createdBy_modulo:  number;              
    updatedAt:         string; // Date;     //!
    updatedBy?:        number;              // Al editar registro
    pv_estados_motivo: PVEstadosMotivos;    // //            
    complemento?: Result;    // //            
    eco_modalidad:     { "name": string }
    modulo_puerta?: string
}
export interface PVEstadosMotivos {
    id:             number;
    desc:           string;
    tipo:           number;
    eco_disponible: boolean;
    createdBy:      number;
    updatedBy?:     number;
    prev_values?:   string;
    createdAt:      Date;
    updatedAt:      Date;
}
interface DynamicPvInputs {
    ruta: { nombre: any; modalidad: any; modalidadId?: any;};
    other_cc: string;
    extintor2: string;

    // motivo_desc_modulo_carga_comb: number;
    motivo_desc_falla_mec: string;
    motivo_desc_falta_combustible_tipo: string;
    motivo_desc_falta_combustible_modulo: string;
    motivo_desc_tipo_termino: string;
    motivo_desc_sefi_origen:    string;
    motivo_desc_sefi_destino:   string;
    motivo_desc_observaciones:  string;
}
export type Form = Result & { 
    modulo: number,
    modulo_puerta: any,
    motivo: PVEstadosMotivos,
    time_hora: string,
    time_fecha: string 
} & DynamicPvInputs

export interface FetchPVestados { info: {count: number, pages: number}, results: Result[] }

type RegistroTipo = 1|2|3|4
export interface Data2PostNewEcoState {
    momento:        Date;
    tipo:           RegistroTipo;
    eco:            number;
    eco_estatus:    0|1|2;
    eco_tipo?:      1|2;
    motivo_id:      number;
    motivo_tipo:    number;         //^ <-----------
    motivo_desc?:   string; //JSON
    modulo?:        number;
    direccion?:     string;
    ruta?:          string;
    ruta_modalidad?:string;
    ruta_cc?:       string;
    op_cred?:       number;
    op_turno?:      number;
    extintor?:      string;
    createdBy:      number;
    createdBy_modulo: number;
    // registro_id:    number|null;
    reg_previo?:    {id: number, tipo: 1|2|3|4};  //tipo: RegistroTipo, registro_id: number|null},
    reg_siguiente?: {id: number, tipo: 1|2|3|4};  //tipo: RegistroTipo, registro_id: number|null},
    modulo_puerta:  string;
}



export interface PV_Ecos {
    modulo:                   number;
    modulo_desc:              string;
    eco:                      number;
    modalidad:                string | null;
    eco_marca:                string;
    vehiculo_modelo:          number;
    matricula:                string | null;
    estado_fisico:            number;
    estado_fisico_desc:       string;
    puertas:                  number | null;
    capacidad_sentados:       number | null;
    capacidad_parados:        number | null;
    servicio_tipo:            string;
    vehiculo_tipo:            string;
    servicio_modalidad_sicab: string;
    tarifa:                   number | null;
}