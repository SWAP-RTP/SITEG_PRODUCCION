import React, { useState, useContext, useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { MiniFormMaker } from '../../../shared/components/FormMaker/MiniFormMaker';
import { GeneralContext } from '../../../shared/GeneralContext';
import { getReporteEcosBitacora } from '../../reportes/utilities/busesBitacora';
import { Button } from 'primereact/button'; 
import { Chart } from 'primereact/chart';
import { exportarGraficasPDF } from '../utilities/pdfUtils';
import { filtrarPorTurno } from '../utilities/turnosUtils';
import { mostrarTotalesEnBarra, mostrarTotalesEnLinea } from '../utilities/chartPlugins';

// Opciones para el filtro de tipo de día
const OPCIONES_TIPO_DIA = [
	{ value: 'todos', label: 'Todos los días', name: 'Todos los días' },
	{ value: 'habiles', label: 'Días hábiles (L-V)', name: 'Días hábiles (L-V)' },
	{ value: 'no_habiles', label: 'Días no hábiles (S-D)', name: 'Días no hábiles (S-D)' }
];

// Interfaz para definir la estructura del formulario de filtros
interface FormFilters {
	fecha_ini: Date // Fecha de inicio del rango a consultar
	fecha_fin: Date // Fecha final del rango a consultar
	ruta?: any // Ruta seleccionada (opcional)
	tipo_dia: { value: string; label: string } // Tipo de día para filtrar
}

/**
 * Componente para mostrar gráficas de salidas por ruta
 * Permite filtrar por ruta específica, rango de fechas y tipo de día
 */
export const SalidasRutas = () => {
	// Hook para manejo del formulario
	const form = useForm<FormFilters>();
	const [selectKey, setSelectKey] = useState(0);
	const { OPTS_RUTA } = useContext(GeneralContext);
	
	// Estados para manejo de datos y UI
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [data, setData] = useState<any[]>([]);
	const [busquedaRealizada, setBusquedaRealizada] = useState(false);
	const [filtrosActuales, setFiltrosActuales] = useState<FormFilters | null>(null);
	const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

	// Efecto para detectar cambios en el tamaño de pantalla
	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth < 900);
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	/**
	 * Maneja el envío del formulario y ejecuta la consulta de datos
	 * @param formData - Datos del formulario con filtros seleccionados
	 */
	const onSubmit = async (formData: FormFilters) => {
		setLoading(true);
		try {
			// Configurar horarios específicos para las fechas
			if (formData.fecha_ini) formData.fecha_ini.setHours(0, 0, 0, 0);
			if (formData.fecha_fin) formData.fecha_fin.setHours(23, 59, 59, 999);
			
			// Guardar los filtros antes de hacer la consulta
			setFiltrosActuales({ ...formData });
			
			// Extraer el valor de la ruta seleccionada
			const rutaValue = formData.ruta?.value || formData.ruta?.nombre || formData.ruta;
			
			// Realizar la consulta al API
			const res = await getReporteEcosBitacora({
				dates: [formData.fecha_ini, formData.fecha_fin],
				ruta: rutaValue,
				tipo: 1, 
			});
			
			// Aplicar los mismos filtros que en SalidasporDia: motivo1 === 'SERVICIO' y modalidad1 !== 'METROBÚS' && modalidad1 !== 'NOCHEBÚS'
			const filtrados = (res.data || []).filter(reg => reg.motivo1 === 'SERVICIO' && reg.modalidad1 !== 'METROBÚS' && reg.modalidad1 !== 'NOCHEBÚS');
			setData(filtrados);
			setError('');
			setBusquedaRealizada(true);
			form.reset();
			setSelectKey(k => k + 1);
		} catch (error) {
			setError('Error al cargar los datos');
			setData([]);
			setBusquedaRealizada(true);
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Exporta todas las gráficas visibles a un archivo PDF
	 */
	const exportarGraficaPDF = async () => {
		await exportarGraficasPDF('.chart-container');
	};

	/**
	 * Convierte una fecha en formato string a objeto Date
	 * @param fechaStr - Fecha en formato string (D/M/YYYY o D-M-YYYY)
	 * @returns Objeto Date correspondiente
	 */
	const parseDate = (fechaStr: string): Date => {
		if (fechaStr.includes('/')) {
			// Formato D/M/YYYY
			const [dia, mes, ano] = fechaStr.split('/');
			return new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
		} else if (fechaStr.includes('-') && fechaStr.split('-').length === 3 && fechaStr.split('-')[0].length <= 2) {
			// Formato D-M-YYYY
			const [dia, mes, ano] = fechaStr.split('-');
			return new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
		} else {
			return new Date(fechaStr);
		}
	};

	/**
	 * Filtra un array de fechas según el tipo de día seleccionado
	 * @param fechas - Array de fechas en formato string
	 * @param tipoDia - Tipo de día: 'todos', 'habiles' o 'no_habiles'
	 * @returns Array de fechas filtradas
	 */
	const filtrarPorTipoDia = (fechas: string[], tipoDia: string): string[] => {
		// Si es 'todos', devolver todas las fechas sin filtrar
		if (tipoDia === 'todos') {
			return fechas;
		}
		
		const fechasFiltradas = fechas.filter(fecha => {
			try {
				const fechaObj = parseDate(fecha);
				const diaSemana = fechaObj.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
				
				if (tipoDia === 'habiles') {
					// Días hábiles: Lunes a Viernes (1-5)
					return diaSemana >= 1 && diaSemana <= 5;
				} else if (tipoDia === 'no_habiles') {
					// Días no hábiles: Sábado y Domingo (0, 6)
					return diaSemana === 0 || diaSemana === 6;
				}
				
				return true;
			} catch (error) {
				return false;
			}
		});
		
		return fechasFiltradas;
	};

	/**
	 * Genera un array con todas las fechas en un rango específico
	 * @param fechaInicio - Fecha de inicio del rango
	 * @param fechaFin - Fecha final del rango
	 * @returns Array de fechas en formato D/M/YYYY
	 */
	const generarRangoFechas = (fechaInicio: Date, fechaFin: Date): string[] => {
		const fechas: string[] = [];
		const fechaActual = new Date(fechaInicio);
		
		while (fechaActual <= fechaFin) {
			const dia = fechaActual.getDate();
			const mes = fechaActual.getMonth() + 1; // getMonth() es 0-indexado
			const ano = fechaActual.getFullYear();
			fechas.push(`${dia}/${mes}/${ano}`);
			
			// Avanzar al siguiente día
			fechaActual.setDate(fechaActual.getDate() + 1);
		}
		
		return fechas;
	};

	// Generar todas las fechas del rango seleccionado
	const fechaInicio = filtrosActuales?.fecha_ini || new Date();
	const fechaFin = filtrosActuales?.fecha_fin || new Date();
	const todasLasFechas = generarRangoFechas(fechaInicio, fechaFin);

	// Determinar el tipo de día seleccionado y aplicar filtro
	let tipoDiaSeleccionado: string;
	if (typeof filtrosActuales?.tipo_dia === 'string') {
		tipoDiaSeleccionado = filtrosActuales.tipo_dia;
	} else if (filtrosActuales?.tipo_dia?.value) {
		tipoDiaSeleccionado = filtrosActuales.tipo_dia.value;
	} else {
		tipoDiaSeleccionado = 'todos';
	}
	
	// Aplicar filtro de tipo de día a las fechas generadas
	const fechasUnicas = filtrarPorTipoDia(todasLasFechas, tipoDiaSeleccionado);

	// Agrupar los datos por fecha (solo incluye las fechas filtradas)
	const dataPorFecha: Record<string, any[]> = {};
	fechasUnicas.forEach(fecha => {
		dataPorFecha[fecha] = data.filter(reg => reg.time1?.split(',')[0]?.trim() === fecha);
	});

	// Buscar el objeto de ruta seleccionada para mostrar información completa
	const rutaSeleccionada = OPTS_RUTA?.find(
		(opt: any) => opt.value?.nombre === filtrosActuales?.ruta?.nombre
	);

	// Obtener texto adicional para el tipo de día (solo si no es "todos")
	const textoTipoDia = tipoDiaSeleccionado === 'habiles' ? ' en días hábiles' :
	                     tipoDiaSeleccionado === 'no_habiles' ? ' en días no hábiles' : '';

	// Renderizado del componente
	return (
		<div className="card">
			<h2 className='text-center'>Salidas por Ruta</h2>
			
			{/* Formulario de filtros */}
			<form className='flex-center gap-3 mt-5 mb-3' onSubmit={form.handleSubmit(onSubmit)}>
				<MiniFormMaker
					form={form}
					inputs={[
						{
							name: 'ruta',
							label: 'Ruta',
							type: 'select',
							options: OPTS_RUTA,
							filter: true,
							key: selectKey,
							rules: { required: 'Selecciona una ruta' }
						},
						{
							name: 'tipo_dia',
							label: 'Tipo de día',
							type: 'select',
							options: OPCIONES_TIPO_DIA,
							filter: false,
							rules: { required: 'Selecciona el tipo de día' }
						},
						{
							name: 'fecha_ini',
							label: 'Fecha inicial',
							type: 'calendar',
							showButtonBar: true,
							rules: { required: 'Selecciona una fecha inicial' },
							maxDate: new Date()
						},
						{
							name: 'fecha_fin',
							label: 'Fecha final',
							type: 'calendar',
							showButtonBar: true,
							rules: { required: 'Selecciona una fecha final' },
							maxDate: new Date()
						},
					]}
				/>
				<div className='mb-5 w-12 flex-center'>
					<Button
						type='submit'
						label='Buscar'
						icon='pi pi-search'
						loading={loading}
						rounded
					/>
				</div>
			</form>

			{/* Área de resultados */}
			{busquedaRealizada && (
				data.length > 0 ? (
					<>
						{/* Título dinámico con información de los filtros aplicados */}
						<div className="text-center mb-6" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
							{filtrosActuales && (
								<>
									Del día {filtrosActuales.fecha_ini?.toLocaleDateString()} al día {filtrosActuales.fecha_fin?.toLocaleDateString()}
									{rutaSeleccionada
										? <> de la ruta <b>{rutaSeleccionada.name}</b>{textoTipoDia}</>
										: <> de la ruta {filtrosActuales.ruta?.nombre || filtrosActuales.ruta?.label || ''}{textoTipoDia}</>
									}
								</>
							)}
						</div>
						
						{/* Botón para exportar las gráficas a PDF */}
						<div className="flex justify-content-end mb-2" style={{ width: '100%' }}>
							<Button label="Exportar gráficas a PDF" icon="pi pi-file-pdf" onClick={exportarGraficaPDF} size="small" />
						</div>
						
						{/* Contenedor principal de gráficas con diseño responsivo */}
						<div
							style={{
								width: '100%',
								maxWidth: '1440px',
								margin: '0 auto',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								gap: isMobile ? '1rem' : '2rem',
								marginBottom: '2rem',
								transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)'
							}}
						>
							{/* Fila superior: Primer y Segundo turno */}
							<div
								style={{
									width: '100%',
									display: 'flex',
									flexDirection: isMobile ? 'column' : 'row',
									justifyContent: 'center',
									alignItems: isMobile ? 'stretch' : 'flex-start',
									gap: isMobile ? '1rem' : '2rem'
								}}
							>
								{/* Gráfica del primer turno */}
								<div style={{
									width: isMobile ? '100%' : '700px',
									minWidth: isMobile ? '0' : '350px',
									marginBottom: isMobile ? '1rem' : '0'
								}}>
									<h4 className="text-center mb-3" style={{ width: '100%' }}>
										Primer turno (04:59 a 10:00)
									</h4>
									<div className="chart-container">
										<Chart
											type="bar"
											data={{
												labels: fechasUnicas,
												datasets: [
													{
														label: 'Total por día',
														data: fechasUnicas.map(fecha =>
															filtrarPorTurno(dataPorFecha[fecha], 't1', fecha).length
														),
														backgroundColor: '#66BB6A'
													}
												]
											}}
											options={{
												plugins: {
													legend: { display: false },
													title: { display: false },
													mostrarTotalesEnBarra
												},
												scales: {
													x: { 
														title: { display: true, text: 'Fecha' }, 
														ticks: { 
															font: { size: 16 },
															maxTicksLimit: fechasUnicas.length,
															maxRotation: 45,
															minRotation: 0,
															autoSkip: false,
															stepSize: 1
														} 
													},
													y: { title: { display: true, text: 'Total de Económicos' }, beginAtZero: true, ticks: { font: { size: 16 } } }
												}
											}}
											plugins={[mostrarTotalesEnBarra]}
											style={{ maxWidth: '100%', height: '400px' }}
										/>
									</div>
								</div>
								
								{/* Gráfica del segundo turno */}
								<div style={{
									width: isMobile ? '100%' : '700px',
									minWidth: isMobile ? '0' : '350px',
									marginBottom: isMobile ? '1rem' : '0'
								}}>
									<h4 className="text-center mb-3" style={{ width: '100%' }}>
										Segundo turno (04:59 a 17:00)
									</h4>
									<div className="chart-container">
										<Chart
											type="bar"
											data={{
												labels: fechasUnicas,
												datasets: [
													{
														label: 'Total por día',
														data: fechasUnicas.map(fecha =>
															filtrarPorTurno(dataPorFecha[fecha], 't2', fecha).length
														),
														backgroundColor: '#4e1ea0ff'
													}
												]
											}}
											options={{
												plugins: {
													legend: { display: false },
													title: { display: false },
													mostrarTotalesEnBarra
												},
												scales: {
													x: { 
														title: { display: true, text: 'Fecha' }, 
														ticks: { 
															font: { size: 16 },
															maxTicksLimit: fechasUnicas.length,
															maxRotation: 45,
															minRotation: 0,
															autoSkip: false,
															stepSize: 1
														} 
													},
													y: { title: { display: true, text: 'Total de Económicos' }, beginAtZero: true, ticks: { font: { size: 16 } } }
												}
											}}
											plugins={[mostrarTotalesEnBarra]}
											style={{ maxWidth: '100%', height: '400px' }}
										/>
									</div>
								</div>
							</div>
							
							{/* Fila inferior: Tercer turno y comparación */}
							<div
								style={{
									width: '100%',
									display: 'flex',
									flexDirection: isMobile ? 'column' : 'row',
									justifyContent: 'center',
									alignItems: isMobile ? 'stretch' : 'flex-start',
									gap: isMobile ? '1rem' : '2rem'
								}}
							>
								{/* Gráfica del tercer turno */}
								<div style={{
									width: isMobile ? '100%' : '700px',
									minWidth: isMobile ? '0' : '350px',
									marginBottom: isMobile ? '1rem' : '0'
								}}>
									<h4 className="text-center mb-3" style={{ width: '100%' }}>
										Tercer turno (04:59 a 20:00)
									</h4>
									<div className="chart-container">
										<Chart
											type="bar"
											data={{
												labels: fechasUnicas,
												datasets: [
													{
														label: 'Total por día',
														data: fechasUnicas.map(fecha =>
															filtrarPorTurno(dataPorFecha[fecha], 't3', fecha).length
														),
														backgroundColor: '#FFA726'
													}
												]
											}}
											options={{
												plugins: {
													legend: { display: false },
													title: { display: false },
													mostrarTotalesEnBarra
												},
												scales: {
													x: { 
														title: { display: true, text: 'Fecha' }, 
														ticks: { 
															font: { size: 16 },
															maxTicksLimit: fechasUnicas.length,
															maxRotation: 45,
															minRotation: 0,
															autoSkip: false,
															stepSize: 1
														} 
													},
													y: { title: { display: true, text: 'Total de Económicos' }, beginAtZero: true, ticks: { font: { size: 16 } } }
												}
											}}
											plugins={[mostrarTotalesEnBarra]}
											style={{ maxWidth: '100%', height: '400px' }}
										/>
									</div>
								</div>
								
								{/* Gráfica de comparación entre turnos */}
								<div style={{
									width: isMobile ? '100%' : '700px',
									minWidth: isMobile ? '0' : '350px'
								}}>
									<h4 className="text-center mb-3" style={{ width: '100%' }}>
										Comparación de turnos por día (Líneas)
									</h4>
									<div className="chart-container">
										<Chart
											type="line"
											data={{
												labels: fechasUnicas,
												datasets: [
													{
														label: 'Primer turno',
														data: fechasUnicas.map(fecha =>
															filtrarPorTurno(dataPorFecha[fecha], 't1', fecha).length
														),
														borderColor: '#66BB6A',
														backgroundColor: '#66BB6A',
														tension: 0.3,
														fill: false
													},
													{
														label: 'Segundo turno',
														data: fechasUnicas.map(fecha =>
															filtrarPorTurno(dataPorFecha[fecha], 't2', fecha).length
														),
														borderColor: '#4e1ea0ff',
														backgroundColor: '#4e1ea0ff',
														tension: 0.3,
														fill: false
													},
													{
														label: 'Tercer turno',
														data: fechasUnicas.map(fecha =>
															filtrarPorTurno(dataPorFecha[fecha], 't3', fecha).length
														),
														borderColor: '#FFA726',
														backgroundColor: '#FFA726',
														tension: 0.3,
														fill: false
													}
												]
											}}
											options={{
												plugins: {
													legend: { display: true, position: 'top' },
													title: { display: false },
													mostrarTotalesEnLinea
												},
												scales: {
													x: { 
														title: { display: true, text: 'Fecha' }, 
														ticks: { 
															font: { size: 16 },
															maxTicksLimit: fechasUnicas.length,
															maxRotation: 45,
															minRotation: 0,
															autoSkip: false,
															stepSize: 1
														} 
													},
													y: { title: { display: true, text: 'Total de Económicos' }, beginAtZero: true, ticks: { font: { size: 16 } } }
												}
											}}
											plugins={[mostrarTotalesEnLinea]}
											style={{ maxWidth: '100%', height: '400px' }}
										/>
									</div>
								</div>
							</div>
						</div>
					</>
				) : (
					// Mensaje cuando no hay datos disponibles
					<div className="text-center text-gray-500 mt-5">
						No hay datos para mostrar en la gráfica.
					</div>
				)
			)}
		</div>
	);
}