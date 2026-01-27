export interface ModuloSelectorProps {
  modulo: string;
  setModulo: (value: string) => void;
  opciones: string[];
  hasError?: boolean;
}
