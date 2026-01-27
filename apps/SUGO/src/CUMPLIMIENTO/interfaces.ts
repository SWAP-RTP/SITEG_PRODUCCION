
export interface Res_Periodos {
    id:           number;
    fecha_inicio: Date;
    fecha_fin:    Date;
    serial:       number;
    createdAt:    Date;
    updatedAt:    Date;
}

export interface Res_RolHeaders {
    id:             number;
    modulo_id:      number;
    modulo:         string;
    modulo_desc:    string;
    ruta_id:        number;
    ruta:           string;
    modalidad:      string;
    swap_ruta:      string;
    periodo_id:     number;
    periodo_serial: number;
    periodo_inicio: string;
    periodo_fin:    string;
}

export interface Res_Servicios {
    id:             number;
    modulo_id:      number;
    modulo:         string;
    modulo_desc:    string;
    ruta_id:        number;
    ruta:           string;
    modalidad:      string;
    swap_ruta:      string;
    periodo_id:     number;
    periodo_serial: number;
    periodo_inicio: string;
    periodo_fin:    string;
}



// schemas de la data usada

export interface Periodo {
    id:           number;
    fecha_inicio: string;   // Date;
    fecha_fin:    string;   // Date;
    serial:       number;
    createdAt:    Date;
    updatedAt:    Date;
}


export interface TarjetaData {
    id:          number;
    tjt_gnrl_id: number;
    fecha:       Date|string;
    eco:         number;
    op_cred:     number;
    turno:       number;
    hr_ini_t:    string;
    hr_fin_t:    string;
    hr_almt1:    string;
    hr_almt2:    string;
    ruta:        string;
    hr_sld:      string;
    hr_llgd:     string;
    cc_sld:      string;
    cc_sld_name: string;
    cc_llg:      string;
    cc_llg_name: string;
    bltj_sr:     string;
    bltj_nmr:    number;
}

export interface DiaCal {
    id_header:      number;
    dia:            Date | string;
    servicio:       string;
    eco:            number;
    op_cred:        number;
    op_tipo:        string;
    op_estado:      string;
    sistema:        string;
    id_jornada?:    number;
    turno:          1|2|3;
    hr_ini_t:       string;
    lug_ini_cc:     string;
    hr_ini_cc?:     string;
    hr_ter_cc?:     string;
    lug_ter_cc:    string;
    hr_ter_mod?:    string;
    hr_ter_t:       string;
}

export type DiaCalOp = DiaCal & { modulo: number, ruta: string, modalidad: string, ruta_swap: string }


//^ ----- Interface del resultado de getCumpli -----

export interface RutaCumplimiento {
    ruta_cumplimiento:  number;
    cumplimientoDeEcos: CumplimientoDeEco[];
}

export interface CumplimientoDeEco {
    eco:                      number;
    ecoInPeriod_cumplimiento: number;
    cumplimientosXdia:        CumplimientosXdia[];
}

export interface CumplimientosXdia {
    eco:                number;
    servicio:           number|string;
    fecha:              string | Date;
    eco_cumplimiento:   number;
    cumplimientosXcred: CumplimientosXcred[];
    cumplimiento:       CumplimientosXdiaCumplimiento;
    cumplimientoDesc:   CumplimientosXdiaCumplimientoDesc;
}

export interface CumplimientosXdiaCumplimiento {
    ruta:      boolean;
    // modalidad: boolean;
}

export interface CumplimientosXdiaCumplimientoDesc {
    ruta:      any[];
    // modalidad: any[];
}

export interface CumplimientosXcred {
    eco:              number;
    op_cred:          number;
    op_cumplimiento:  number;
    cumplimiento:     CumplimientosXcredCumplimiento;
    cumplimientoDesc: CumplimientosXcredCumplimientoDesc;
    cuentaTotal:      number;
}

export interface CumplimientosXcredCumplimiento {
    op_cred:    boolean;
    turno:      boolean;
    hr_ini_t:   boolean;
    lug_ini_cc: boolean;
    lug_ter_cc: boolean;
    hr_ter_t:   boolean;
    hr_ini_cc:     boolean|undefined;
    hr_ter_cc:     boolean|undefined;
    hr_ter_mod:    boolean|undefined;
}

export interface CumplimientosXcredCumplimientoDesc {
    op_cred:    number[];
    turno:      number[];
    hr_ini_t:   any[];
    lug_ini_cc: any[];
    hr_ini_cc:  any[];
    hr_ter_cc:  any[];
    lug_ter_cc: any[];
    hr_ter_mod: any[];
    hr_ter_t:   any[];
}


//^ ---------- Cumpli operadores -----------

export interface OpCalendario {
    op_cred:             number;
    op_cumplimiento:     number;
    op_cumplimientoXdia: OpCumplimientoXdia[];
}

export interface OpCumplimientoXdia {
    dia:              Date;
    op_cumplimiento:  number;
    cumplimiento:     { [key: string]: boolean };
    cumplimientoDesc: CumplimientoDesc;
}

interface CumplimientoOp {
    op_cred:    boolean;
    turno:      boolean;
    hr_ini_t:   boolean;
    lug_ini_cc: boolean;
    hr_ini_cc:  boolean;
    hr_ter_cc:  boolean;
    lug_ter_cc: boolean;
    hr_ter_mod: boolean;
    hr_ter_t:   boolean;
}

interface CumplimientoDesc {
    op_cred:    [any, any];
    op_estado:  string;
    turno:      [any, any];
    hr_ini_t:   [any, any];
    lug_ini_cc: [any, any];
    hr_ini_cc:  [any, any];
    hr_ter_cc:  [any, any];
    lug_ter_cc: [any, any];
    hr_ter_mod: [any, any];
    hr_ter_t:   [any, any];
}
