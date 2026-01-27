export function getMinutos(horaStr: string) {
	const [horaMinSeg, ampm] = horaStr.trim().split(' ');
	const [h, m, s] = horaMinSeg.split(':');
	let hora = parseInt(h, 10);
	const min = parseInt(m, 10);
	let isPM = false;
	if (ampm) {
		isPM = ampm.toLowerCase().includes('p');
	}
	if (hora === 12) {
		hora = isPM ? 12 : 0;
	} else if (isPM) {
		hora += 12;
	}
	return hora * 60 + min;
}

export function deduplicaEco1(detalles: any[]): any[] {
	const ecoMap = new Map();
	detalles.forEach(reg => {
		const eco = reg.eco1;
		const [, hora] = reg.time1.split(',');
		const mins = getMinutos(hora);
		if (!ecoMap.has(eco) || mins > ecoMap.get(eco).mins) {
			ecoMap.set(eco, { reg, mins });
		}
	});
	return Array.from(ecoMap.values()).map(obj => obj.reg);
}

export function filtrarPorTurno(detalles: any[], turno: string, fechaBase?: string): any[] {
	if (!Array.isArray(detalles) || detalles.length === 0) return [];
	let limiteMin = 0;
	let limiteMax = 24 * 60;
	if (turno === 't1') {
		limiteMax = 600;
	} else if (turno === 't2') {
		limiteMax = 1020;
	} else if (turno === 't3') {
		limiteMax = 1200;
	} else if (turno === 'hasta') {
		const ahora = new Date();
		limiteMax = ahora.getHours() * 60 + ahora.getMinutes();
	}
	let filtrados = detalles.filter(reg => {
		if (!reg.time1) return false;
		const [fecha, hora] = reg.time1.split(',');
		if (fechaBase && fecha.trim() !== fechaBase.trim()) return false;
		const mins = getMinutos(hora);
		return mins >= limiteMin && mins <= limiteMax;
	});
	return deduplicaEco1(filtrados);
}

export function isToday(date: Date) {
	const now = new Date();
	return date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

export function getCurrentMinutes() {
	const now = new Date();
	return now.getHours() * 60 + now.getMinutes();
}

export const turnos = {
	dia: { ini: 299, fin: 1320 }, // 4:59am - 10:00pm
	t1: { ini: 299, fin: 600 },   // 4:59am - 10:00am
	t2: { ini: 299, fin: 1020 },  // 4:59am - 5:00pm
	t3: { ini: 299, fin: 1200 },  // 4:59am - 8:00pm
};

export function getTurnoOptions(fecha: Date | undefined, opcionesTurno: any[]) {
	const hoy = fecha && isToday(fecha);
	const min = getCurrentMinutes();
	const turnosObj = turnos;
	const opcionesFiltradas = opcionesTurno.filter(opt => {
		if (opt.value === 'hasta') {
			return !!hoy;
		}
		return true;
	});
	return opcionesFiltradas.map(opt => {
		let disabled = false;
		let tooltip = '';
		let motivo = '';
		if (opt.value === 'dia') {
			disabled = !!hoy;
			if (disabled) {
				motivo = ' (Aun no se realiza el corte del día)';
				tooltip = motivo;
			}
		} else if (hoy) {
			if (opt.value === 't1' && min < turnosObj.t1.fin) {
				disabled = true;
				motivo = 'Aún no se realiza el corte del primer turno';
				tooltip = motivo;
			}
			if (opt.value === 't2' && min < turnosObj.t2.fin) {
				disabled = true;
				motivo = 'Aún no se realiza el corte del segundo turno';
				tooltip = motivo;
			}
			if (opt.value === 't3' && min < turnosObj.t3.fin) {
				disabled = true;
				motivo = 'Aún no se realiza el corte del tercer turno';
				tooltip = motivo;
			}
		}
		let label = opt.label;
		if (disabled && motivo) {
			label = `${opt.label} ${motivo}`;
		}
		return { ...opt, label, disabled, tooltip };
	});
}