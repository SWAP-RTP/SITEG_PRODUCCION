export interface JornadaEdit {
  id?: string;
  rol_id?: string;
  operador: number;
  lugar: string;
  hora_inicio: string;
  hora_termino: string;
  dias_servicio: Record<string, string>;
  created_at?: string;
  updated_at?: string;
}
