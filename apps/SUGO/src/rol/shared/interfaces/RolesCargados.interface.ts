import { RutaEdit } from '../../editar-rol/interfaces/RutaEdit.interface';

export interface RolesCargadosProps {
	periodo: any;
	reload?: number;
}

export interface ICubredescansoTurno {
	id: string;
	cubredescanso_id: string;
	turno: number;
	operador: number;
	servicios_a_cubrir: Record<string, string | number>;
	created_at: string;
	updated_at: string;
}

export type IRolCargado = RutaEdit;