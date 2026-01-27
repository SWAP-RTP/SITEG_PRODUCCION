// Interfaz para tipar las rutas autorizadas
export interface RutaAutorizada {
  ruta: string;
  origen: string;
  origen_nomenclatura: string;
  destino: string;
  destino_nomenclatura: string;
  modalidades: string[];
}