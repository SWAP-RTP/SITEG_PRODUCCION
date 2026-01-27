export interface Data2Send {
    modulo_id:        number
    eco:              string
    op_cred:          string
    turno?:           string
    extintor?:        string
    ruta_swap?:       string
    ruta_modalidad?:  string
    ruta_cc?:         string
    modulo_time:      Date,
    motivo:           string
    motivo_desc?:     string
    cap_time:         Date
    cap_user:         number
}


export interface EcoInOutForTable {
    id:              number
    modulo_id:       number
    eco:             number
    op_cred:         number
    turno?:          number
    extintor?:       number
    ruta_swap?:      string
    ruta_modalidad?: string
    ruta_cc?:        string
    modulo_time:     string
    motivo:          string
    motivo_desc?:    string
    tipo:            number
    eco_tipo?:       number
}

export interface EcoInOut {
    id:              number
    modulo_id:       number
    eco:             number
    op_cred:         number
    turno?:          number
    extintor?:       number
    ruta_swap?:      string
    ruta_modalidad?: string
    ruta_cc?:        string
    modulo_time:     Date | string
    motivo:          string
    motivo_desc?:    string
    tipo:            number
    estatus?:        number
    eco_tipo?:       number
    cap_time:        Date
    cap_user:        number
    registro_id?:    number
    complemento?:    EcoInOut
}


//? Usado en Reportes
export interface EcosDespachadosConRecepcion {
    id:             number;
    modulo_id:      number;
    eco:            number;
    op_cred:        number;
    modulo_time:    Date;
    turno:          number;
    extintor:       string;
    ruta_swap:      string;
    ruta_modalidad: string;
    ruta_cc:        string;
    motivo:         string;
    motivo_desc:    string | null;
    tipo:           number;
    estatus:        number;
    eco_tipo:       number | null;
    cap_time:       Date;
    cap_user:       number;
    registro_id:    number | null;
    complemento?:   EcosDespachadosConRecepcion;
}