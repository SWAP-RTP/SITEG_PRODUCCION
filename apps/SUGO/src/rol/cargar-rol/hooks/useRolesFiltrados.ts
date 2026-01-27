// ----------------------------------------------------
// Hook: useRolesFiltrados
// Filtra roles y provee helpers para visualización y limpieza de datos.
// ----------------------------------------------------

import { useState } from 'react';

// Hook para filtrar roles y helpers visuales
export function useRolesFiltrados(roles: any[]) {
	// Estado para filtro activo
	const [filter, setFilter] = useState<{ kind: 'servicio' | 'cubredescanso' | 'jornada' | null; value: any } | null>(null);

	// Determina si un rol cumple el filtro activo
	const roleMatchesFilter = (r: any) => {
		if (!filter || !filter.kind) return true;
		if (filter.kind === 'servicio') {
			return (r.servicios || []).some((s: any) => String(s.economico) === String(filter.value) || String(s.id) === String(filter.value));
		}
		if (filter.kind === 'cubredescanso') {
			return (r.cubredescansos || []).some((c: any) => String(c.economico) === String(filter.value) || String(c.id) === String(filter.value));
		}
		if (filter.kind === 'jornada') {
			return (r.jornadas_excepcionales || []).some((j: any) => String(j.operador) === String(filter.value) || String(j.id) === String(filter.value));
		}
		return true;
	};

	// Obtiene roles por módulo
	const rolesPorModulo = (m: number) => roles.filter((r: any) => Number(r.modulo) === m);

	// Aplica filtro a los roles por módulo
	const rolesPorModuloFiltrados = (m: number) => rolesPorModulo(m).filter(roleMatchesFilter);

	// Resumen de cantidades por tipo de dato en el rol
	const resumenRol = (r: any) => {
		const servicios = Array.isArray(r.servicios) ? r.servicios.length : 0;
		const cubres = Array.isArray(r.cubredescansos) ? r.cubredescansos.length : 0;
		const jornadas = Array.isArray(r.jornadas_excepcionales) ? r.jornadas_excepcionales.length : 0;
		return `${servicios} Servicios • ${cubres} Cubredescansos • ${jornadas} Jornadas Excepcionales`;
	};

	// Limpia las notas del rol para visualización
	function limpiarNotas(nota: string) {
		if (!nota) return '';
		return nota.trim().replace(/\n{2,}/g, '\n').replace(/[ \t]+/g, ' ');
	}

	// Retorna helpers y estado de filtro
	return {
		filter,
		setFilter,
		rolesPorModuloFiltrados,
		resumenRol,
		limpiarNotas
	};
}
