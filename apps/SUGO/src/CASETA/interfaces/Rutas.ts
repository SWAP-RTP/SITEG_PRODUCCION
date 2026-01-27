export interface RutasDBSUGO {
    id:             number;
    nombre:         string;
    swap_ruta:      string;
    origen_destino: string;
    modalidad:      string;
    modalidad_id:   number;
}

export interface RutaDBSWAP {
    ruta_id:     number;
    modulo:      number;
    nombre:      string;
    modalidad:   string;
    cc_ori:      string;
    cc_des:      string;
    cc_ori_name: string;
    cc_des_name: string;
}

export interface RutaOptionValue { 
    nombre: string, 
    modalidad: string, 
    modalidadId: number,
}