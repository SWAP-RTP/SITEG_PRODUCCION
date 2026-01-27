import { ServicioEdit } from './ServicioEdit.interface';
import { CubredescansoEdit } from './CubredescansoEdit.interface';
import { JornadaEdit } from './JornadaEdit.interface';

export interface RutaEdit {
  id: number;
  nombre: string;
  origen: string;
  destino: string;
  modalidad: string;
  servicios: ServicioEdit[];
  cubredescansos: CubredescansoEdit[];
  jornadas: JornadaEdit[];
  notas: string;
}
