export interface PeriodoSelectorProps {
  periodo: string;
  setPeriodo: (value: string) => void;
  opciones: string[];
  hasError?: boolean;
}
