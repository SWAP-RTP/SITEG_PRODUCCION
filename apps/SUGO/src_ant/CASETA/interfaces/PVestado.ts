
export interface EstadoPV {
    id:          number;
    eco_estatus: number;
    eco:         number;
    momento:     Date;
    motivo:      string;
    motivo_desc: string | null;
    lugar_tipo:  number;
    lugar:       string;
    lugar_desc:  string | null;
    estatus:     number;
    createdBy:   number;
    createdAt:   Date;
    updatedBy:   number | null;
    updatedAt:   Date | null;
}