export interface OperadorJornada {
    id_header:      number;
    dia:            string;     // Date
    servicio:       string;
    eco?:           string;     // number;
    op_cred:        number;
    op_tipo:        string;
    op_estado:      string;
    sistema:        string;
    id_jornada?:    number;
    turno?:         number;
    hr_ini_t:      string;
    lug_ini_cc?:    string;
    hr_ini_cc?:     string;
    hr_ter_cc:      null;
    lug_ter_cc?:    string;
    hr_ter_mod:     null;
    hr_ter_t?:      string;
    modulo:         string;
    ruta:           string;
    modalidad:      string;
    ruta_swap:      string;
}
