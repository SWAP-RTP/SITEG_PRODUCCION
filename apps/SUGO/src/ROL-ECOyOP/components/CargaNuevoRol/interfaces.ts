

export interface Err {
    msg: string,
    desc?: string[],
    canNotDismiss?: boolean, 
}

export interface Err_page {
    hoja: string,
    err: Err[] | null
}


export type HeaderData = {
    i_ColsNames:        number, 
    pag:                number, 
    hojaName:           string, 
    data:               HeaderRol, 
    op1SacaDiasPares:   boolean, 
    diasFestivos?:       { 
        existLabel: string, 
        lista: {
            df_dias: string, 
            df_servicios: string

        }[]
    }, 
}
// export type HeaderData = {
//     indexColsNames: number,
//     isPar:          Boolean, 
//     df_dias:        string,     //? ???
//     df_servicios:   string,     //? '1, 3, 4, 5, 8'
//     df_fila:        string      //? fila que contiene la celda con el mensaje 'Dias Festivos'
// }

export interface HeaderRol {
    "periodo_date_fin"?: Date | string,
    "periodo_date_ini"?: Date | string,
    "periodo"?      : string,
    "periodo_id"?   : number,
    "ori_des"?      : string,
    "ruta"?         : string,
    "ruta_id"?      : number,
    "modalidad"?    : string,
    "modalidad_id"? : number,
}

export interface DataRolPage {
    header: HeaderRol,
    rol: RolWithTurnos[], 
    cd: CD[], 
    joe: JoE[], 
    notas: {
        sacanDiasParesT1: boolean,
        diasFes?:        { 
            existLabel: string, 
            lista: {
                df_dias: string, 
                df_servicios: string

            }[]
        },
    }
}

export interface DataRol {
    hoja: string,
    data: DataRolPage
}

export interface ValRol {
    hoja:   string,
    data?:   DataRolPage,
    err: Err[]
}



export interface RolWithTurnos {
    servicio:     string;
    eco:          string;
    sistema:      Sistema;
    credenciales: Credenciales;
    descansos:    Descansos;
    lun_vie?:     Jornadas[];
    sab?:         Jornadas[];
    dom?:         Jornadas[];
}

export interface Rol {
    servicio:     string;
    eco:          string;
    sistema:      Sistema;
    credenciales: Credenciales;
    descansos:    Descansos;
    lun_vie?:     JornadasRaw;
    sab?:         JornadasRaw;
    dom?:         JornadasRaw;
}

export interface CD {
    servicio:     string;
    eco?:         string;
    sistema:      Sistema;
    credenciales: Credenciales;
    descansos:    Descansos;
}

export interface JoE {
    cred:      number;
    lugIni1:   string;
    hr_ini_t:    Date;
    hr_ter_t:    Date;
    descansos: Descansos;
}


export enum Sistema {
    ES = "E/S",
    TF = "T/F",
}
export interface Credenciales { //La propiedades debene de terminar en el # de turno
    cred_turno1?: number;
    cred_turno2?: number;
    cred_turno3?: number;
}
export interface Descansos {
    lunes?:     string;
    martes?:    string;
    miercoles?: string;
    jueves?:    string;
    viernes?:   string;
    sabado?:    string;
    domingo?:   string;
}
export interface JornadasRaw {
    hrIni1?:   Date;
    hrIniCC?:  Date;
    lugIni1?:  string;
    hrTer1?:   Date;
    lugIni2?:  string;
    hrIni2?:   Date;
    hrTer2?:   Date;
    lugIni3?:  string;
    hrIni3?:   Date;
    hrTerCC?:  Date;
    lugTerCC?: string;
    hrTerMod?: Date;
    hrTerT?:   Date;
}

export interface Jornadas {
    turno:      number;     // turno        // turno 
    hr_ini_t:     Date;     // hrIniT       // hr_ini_t
    hr_ter_t?:    Date;     // hrTerT       // hr_ter_t
    hr_ini_cc?:   Date;     // hrIniCC      // hr_ini_cc
    hr_ter_cc?:   Date;     // hrTerCC      // hr_ter_cc
    hr_ter_mod?:  Date;     // hrTerMod     // hr_ter_mod
    lug_ini_cc:   string;   // lugIniCC     // lug_ini_cc
    lug_ter_cc?:  string;   // lugTerCC     // lug_ter_cc
}

// export interface Jornadas {
//     turno:      number;
//     hrIniT:     Date;       
//     lugIniCC:   string;
//     hrIniCC?:   Date;
//     hrTerCC?:   Date;
//     lugTerCC?:  string;
//     hrTerMod?:  Date;
//     hrTerT?:    Date;
// }


//^ ----------------------- ---------------------------- -----------------------

export interface PeriodoApi {
    id:           number;
    fecha_inicio: string;
    fecha_fin:    string;
    serial:       number;
    createdAt:    Date;
    updatedAt:    Date;
}