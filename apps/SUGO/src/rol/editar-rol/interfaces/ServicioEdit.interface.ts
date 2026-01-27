// Interfaz para el operador de servicio
export interface OperadorServicio {
  id: string;
  servicio_id: string;
  turno: number;
  operador: number;
  descansos: string[];
  created_at: string;
  updated_at: string;
}

// Interfaz para el operador de servicio
export interface HorarioServicio {
  id: string;
  servicio_id: string;
  dias_servicios: string;
  turno: number;
  hora_inicio: string | null;
  hora_inicio_cc: string | null;
  lugar_inicio: string | null;
  hora_termino: string | null;
  hora_termino_cc: string | null;
  termino_modulo: string | null;
  lugar_termino_cc: string | null;
  created_at: string;
  updated_at: string;
  servicio_operador_id: number;
}

// Interfaz para el servicio editado
export interface ServicioEdit {
  no: number;
  economico: number | null;
  sistema: string;
  turno_operadores: {
    [turno: string]: {
      credencial: number;
      descansos: string[];
    };
  };
  "Lunes a Viernes": Record<string, Record<string, string | null>>;
  "Sabado": Record<string, Record<string, string | null>>;
  "Domingo": Record<string, Record<string, string | null>>;
  operadores_servicios?: OperadorServicio[];
  horarios?: HorarioServicio[];
}
