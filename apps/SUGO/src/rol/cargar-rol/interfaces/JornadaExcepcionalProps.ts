export interface JornadaExcepcionalProps {
  data: {
    operador: string | number;
    lugar?: string;
    hora_inicio?: string;
    hora_termino?: string;
    dias_servicio?: Record<string, any>;
  };
}