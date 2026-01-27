import React, { useState, useRef, useContext } from 'react'
import { TablaCRUD } from '../../../shared/components/Tabla'
import { Button } from 'primereact/button'
import { useForm } from 'react-hook-form'
import { MiniFormMaker } from '../../../shared/components/FormMaker/MiniFormMaker'
import { getReporteEcosBitacora } from '../../reportes/utilities/busesBitacora';
import { exportarGraficasPDF } from '../utilities/pdfUtils';
import { Chart } from 'primereact/chart';
import { filtrarPorTurno, isToday, getCurrentMinutes, turnos, getTurnoOptions } from '../utilities/turnosUtils';
import { mostrarTotalesEnBarra, mostrarTotalesEnLinea } from '../utilities/chartPlugins';
import { GeneralContext } from '../../../shared/GeneralContext';

// Interfaz para el formulario
interface FormFilters {
    fecha_ini: Date
    fecha_fin: Date
    modulo?: number
    ruta?: { nombre: string }
    turnoFiltro?: string 
}

// Interfaz para los datos de la tabla
interface TableData {
    id: number;
    ruta: string;
    modalidad: string;
    modulo?: number;
    total_salidas: number;
    detalles?: any[];
}


const modulos = [
    { name: 'GENERAL', value: 0 },
    { name: 'MÓDULO 1', value: 1 },
    { name: 'MÓDULO 2', value: 2 },
    { name: 'MÓDULO 3', value: 3 },
    { name: 'MÓDULO 4', value: 4 },
    { name: 'MÓDULO 5', value: 5 },
    { name: 'MÓDULO 6', value: 6 },
    { name: 'MÓDULO 7', value: 7 },
]

export const SalidasporDia = () => {
    // Colores para los turnos (t1, t2, t3)
    const coloresTurno: Record<string, string> = {
        t1: '#66BB6A',
        t2: '#4e1ea0ff',
        t3: '#FFA726'
    };
    // Estado para el módulo seleccionado en la gráfica general
    const [moduloSeleccionado, setModuloSeleccionado] = useState<number | null>(null);
    // Data base única para todo (gráficas y tabla)
    const { OPTS_RUTA } = useContext(GeneralContext);
    const [filtradosData, setFiltradosData] = useState<any[]>([]);
    const chartRef = useRef<any>(null);
    const [data, setData] = useState<(TableData & { id: number, detalles?: any[] })[]>([]);
    const [detallesRuta, setDetallesRuta] = useState<any[]>([]);
    const [showDetalles, setShowDetalles] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [busquedaRealizada, setBusquedaRealizada] = useState(false);
    const [filtrosActuales, setFiltrosActuales] = useState<FormFilters | null>(null);
    const form = useForm<FormFilters>();

    // Filtro de turnos
    const [turnoFiltro, setTurnoFiltro] = useState('hasta');
    const [selectKey, setSelectKey] = useState(0); 

    // Opciones de turnos
    const opcionesTurno = [
        { value: 'hasta', label: 'Hasta el momento' },
        { value: 'dia', label: 'Por día completo (04:59am - 10:00pm)' },
        { value: 't1', label: 'Primer turno (04:59am - 10:00am)' },
        { value: 't2', label: 'Segundo turno (04:59am - 05:00pm)' },
        { value: 't3', label: 'Tercer turno (04:59am - 08:00pm)' },
    ];

    // Lógica para habilitar/deshabilitar turnos
    const getTurnoOptionsMemo = () => {
        const fecha = form.watch('fecha_ini');
        return getTurnoOptions(fecha, opcionesTurno);
    };

    // Función para exportar todas las gráficas visibles a PDF
    const exportarGraficaPDF = async () => {
        await exportarGraficasPDF('.mi-grafica, .grafica-extra');
    };


    // Función para manejar el envío del formulario usando getReporteEcosBitacora
    const onSubmit = async (formData: FormFilters) => {
        setLoading(true)
        try {
            if (formData.fecha_ini) formData.fecha_ini.setHours(0, 0, 0, 0);
            if (formData.fecha_fin) formData.fecha_fin.setHours(23, 59, 59, 999);
            const res = await getReporteEcosBitacora({
                dates: [formData.fecha_ini],
                modulo: formData.modulo!,
                tipo: [1],
                eco: undefined,
                cred: undefined,
                ruta: undefined,
                motivo: undefined
            })
            let dataAgrupada: (TableData & { id: number, modulo?: number })[] = [];
            // Filtrar por motivo y modalidad para ambos filtros
            const filtrados = res.data.filter(reg => reg.motivo1 === 'SERVICIO' && reg.modalidad1 !== 'METROBÚS' && reg.modalidad1 !== 'NOCHEBÚS');
            setFiltradosData(filtrados); // Usar solo una fuente de datos para todo

            // Por defecto, solo filtra por el turno seleccionado para la tabla principal
            const turnoSeleccionado = String(form.getValues('turnoFiltro') || turnoFiltro);
            if (formData.modulo === 0) {
                // Agrupar por modulo
                const agrupadoModulo: { [modulo: string]: any[] } = {};
                filtrados.forEach(reg => {
                    const modulo = reg.modulo;
                    if (modulo !== undefined && modulo !== null && modulo !== '') {
                        if (!agrupadoModulo[modulo]) agrupadoModulo[modulo] = [];
                        agrupadoModulo[modulo].push(reg);
                    }
                });
                // Asegurar que siempre estén los 7 módulos
                const modulosBase = [1, 2, 3, 4, 5, 6, 7];
                dataAgrupada = modulosBase.map((modulo, idx) => {
                    const registros = agrupadoModulo[modulo] || [];
                    const detallesFiltrados = filtrarPorTurno(registros, turnoSeleccionado);
                    return {
                        id: idx + 1,
                        ruta: `Módulo ${modulo}`,
                        modalidad: registros[0]?.modalidad1 || '',
                        modulo: Number(modulo),
                        total_salidas: detallesFiltrados.length,
                        detalles: detallesFiltrados
                    };
                });
            } else {
                // Agrupar por ruta
                const agrupado: { [ruta: string]: any[] } = {};
                filtrados.forEach(reg => {
                    const ruta = reg.ruta1;
                    if (ruta) {
                        if (!agrupado[ruta]) agrupado[ruta] = [];
                        agrupado[ruta].push(reg);
                    }
                });
                dataAgrupada = Object.entries(agrupado).map(([ruta, registros], idx) => {
                    const detallesFiltrados = filtrarPorTurno(registros, turnoSeleccionado);
                    return {
                        id: idx + 1,
                        ruta,
                        modalidad: registros[0].modalidad1,
                        modulo: registros[0].modulo,
                        total_salidas: detallesFiltrados.length,
                        detalles: detallesFiltrados
                    };
                });
            }
            setData(dataAgrupada)
            setError('')
            setBusquedaRealizada(true)
            setFiltrosActuales({ ...formData })
            form.reset()
            setSelectKey(k => k + 1) // <-- Actualiza el selectKey después de buscar
        } catch (error) {
            console.error('Error al cargar datos:', error)
            setError('Error al cargar los datos')
            setData([])
            setBusquedaRealizada(true)
        } finally {
            setLoading(false)
        }
    }

    // Función para manejar la visualización de detalles
    const handleVerDetalles = (detalles: any[]) => {
        setDetallesRuta(Array.isArray(detalles) ? detalles : []);
        setShowDetalles(true);
        // El log muestra el valor anterior de showDetalles, pero el estado sí cambia en el siguiente render.
        setTimeout(() => {
            console.log('Estado actualizado showDetalles:', showDetalles);
        }, 100);
    };

    return (
        <div className="card">

            <h2 className='text-center'>Salidas por Ruta</h2>

            {/* Formulario de filtros */}
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex-center gap-3 mt-5'>
                <MiniFormMaker
                    form={form}
                    inputs={[
                        {
                            name: 'modulo',
                            label: 'Módulo',
                            type: 'select',
                            options: modulos,
                            rules: { required: 'Selecciona un módulo' },
                            key: selectKey
                        },
                        {
                            name: 'fecha_ini',
                            label: 'Fecha inicial',
                            type: 'calendar',
                            showButtonBar: true,
                            rules: { required: 'Selecciona una fecha inicial' },
                            maxDate: new Date()
                        },
                        ...(form.watch('fecha_ini') ? [{
                            name: 'turnoFiltro',
                            label: 'Turno',
                            type: 'select' as const,
                            options: getTurnoOptionsMemo().map(opt => ({ ...opt, name: opt.label })),
                            value: turnoFiltro,
                            rules: { required: 'Selecciona el turno' },
                            onChange: (e: any) => {
                                let value = '';
                                if (e && typeof e === 'object') {
                                    if ('value' in e && e.value !== undefined) {
                                        value = e.value;
                                    } else if (e.target && 'value' in e.target) {
                                        value = e.target.value;
                                    }
                                }
                                setTurnoFiltro(value);
                            }
                        }] : []),

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


            {error ? (
                <div className="text-red-500 text-center p-3">{error}</div>
            ) : (
                busquedaRealizada && data.length > 0 && (
                    <>
                        {/* Título descriptivo dinámico */}
                        <h3 className="text-center mb-4">
                            {(() => {
                                if (!filtrosActuales) return '';
                                const fechaIni = filtrosActuales.fecha_ini ? filtrosActuales.fecha_ini.toLocaleDateString() : '';
                                if (filtrosActuales.modulo === 0) {
                                    return `Total de económicos en salida a nivel general al día de ${fechaIni}`;
                                }
                                const moduloSeleccionado = filtrosActuales.modulo;
                                const moduloObj = modulos.find(m => m.value === moduloSeleccionado);
                                const moduloTexto = moduloObj ? moduloObj.value : '';
                                const fechaFin = filtrosActuales.fecha_fin ? filtrosActuales.fecha_fin.toLocaleDateString() : '';
                                return `Total de salidas en módulo ${moduloTexto} de fecha ${fechaIni}${fechaFin ? ' a ' + fechaFin : ''}`;
                            })()}
                        </h3>
                        {/* Botón para exportar la gráfica a PDF */}
                        <div className="flex justify-content-end mb-2">
                            <Button label="Exportar gráfica a PDF" icon="pi pi-file-pdf" onClick={exportarGraficaPDF} size="small" />
                        </div>
                        {/* Gráfica general de módulos y gráfica de líneas de comparación, con animación */}
                        <div
                            style={{
                                width: '100%',
                                maxWidth: '1440px',
                                margin: '0 auto',
                                display: 'flex',
                                flexDirection: window.innerWidth < 900 ? 'column' : 'row',
                                gap: window.innerWidth < 900 ? '1rem' : '2rem',
                                marginBottom: '2rem',
                                alignItems: window.innerWidth < 900 ? 'stretch' : 'flex-start',
                                justifyContent: 'center',
                                flexWrap: 'wrap',
                                transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)'
                            }}
                        >
                            {/* Gráfica general de módulos */}
                            {(!filtrosActuales || filtrosActuales.modulo === 0) && (
                                <div style={{
                                    position: 'relative',
                                    width: window.innerWidth < 900 ? '100%' : '700px',
                                    minWidth: window.innerWidth < 900 ? '0' : '350px',
                                    marginBottom: window.innerWidth < 900 ? '1rem' : '0', // <-- Agrega separación abajo en móvil
                                    transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)'
                                }}>
                                    <Chart
                                        ref={chartRef as any}
                                        type="bar"
                                        data={{
                                            labels: [1,2,3,4,5,6,7].map(m => `Módulo ${m}`),
                                            datasets: [
                                                {
                                                    label: 'Total por Módulo',
                                                    data: [1,2,3,4,5,6,7].map(modulo => filtrarPorTurno(filtradosData.filter((reg: any) => Number(reg.modulo) === modulo), String(filtrosActuales?.turnoFiltro || turnoFiltro)).length),
                                                    backgroundColor: '#42A5F5',
                                                    extraValues: [1, 2, 3, 4, 5, 6, 7]
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
                                                x: { title: { display: true, text: 'Módulo' } },
                                                y: { title: { display: true, text: 'Total de Económicos' }, beginAtZero: true }
                                            },
                                            onClick: (event: any, elements: any[]) => {
                                                if (elements && elements.length > 0) {
                                                    const idx = elements[0].index;
                                                    const modulo = [1,2,3,4,5,6,7][idx];
                                                    if (modulo) setModuloSeleccionado(modulo);
                                                }
                                            }
                                        }}
                                        className="mb-2 mi-grafica"
                                        style={{ maxWidth: '100%', height: '400px' }}
                                        plugins={[mostrarTotalesEnBarra]}
                                    />
                                </div>
                            )}
                            {/* Gráfica de líneas de comparación de turnos por ruta del módulo seleccionado o filtrado */}
                            {(() => {
                                let turnosToShow: string[] = [];
                                if (filtrosActuales && ['t1', 't2', 't3'].includes(filtrosActuales.turnoFiltro || '')) {
                                    if (filtrosActuales.turnoFiltro === 't1') turnosToShow = ['t1'];
                                    if (filtrosActuales.turnoFiltro === 't2') turnosToShow = ['t1', 't2'];
                                    if (filtrosActuales.turnoFiltro === 't3') turnosToShow = ['t1', 't2', 't3'];
                                } else if (filtrosActuales && filtrosActuales.turnoFiltro === 'dia') {
                                    turnosToShow = ['t1', 't2', 't3'];
                                } else if (filtrosActuales && filtrosActuales.turnoFiltro === 'hasta') {
                                    const fecha = filtrosActuales.fecha_ini;
                                    const hoy = fecha && isToday(fecha);
                                    const min = getCurrentMinutes();
                                    turnosToShow = ['t1'];
                                    if (hoy && min >= turnos.t2.fin) {
                                        turnosToShow.push('t2');
                                    }
                                    if (hoy && min >= turnos.t3.fin) {
                                        turnosToShow.push('t3');
                                    }
                                }
                                if (turnosToShow.length < 2) return null;
                                // Determinar el módulo a mostrar (por clic en barra o por filtro directo)
                                const moduloActual = filtrosActuales?.modulo === 0 ? moduloSeleccionado : filtrosActuales?.modulo;
                                if (!moduloActual) return null;
                                // Agrupar por ruta solo del módulo seleccionado
                                let rutas: string[] = [];
                                let agrupado: { [ruta: string]: any } = {};
                                filtradosData.forEach((reg: any) => {
                                    if (Number(reg.modulo) === Number(moduloActual)) {
                                        const ruta = reg.ruta1;
                                        if (!agrupado[ruta]) agrupado[ruta] = [];
                                        agrupado[ruta].push(reg);
                                    }
                                });
                                rutas = Object.keys(agrupado);
                                const colores = { t1: '#66BB6A', t2: '#4e1ea0ff', t3: '#FFA726' };
                                const datasets = turnosToShow.map(turno => ({
                                    label: turno === 't1' ? 'Primer turno' : turno === 't2' ? 'Segundo turno' : 'Tercer turno',
                                    data: rutas.map(ruta => filtrarPorTurno(agrupado[ruta], turno).length),
                                    borderColor: colores[turno as keyof typeof colores],
                                    backgroundColor: colores[turno as keyof typeof colores],
                                    tension: 0.3,
                                    fill: false
                                }));
                                return (
                                    <div style={{
                                        width: window.innerWidth < 900 ? '100%' : '700px',
                                        minWidth: window.innerWidth < 900 ? '0' : '350px'
                                        // Elimina marginTop aquí
                                    }}>
                                        <Chart
                                            type="line"
                                            data={{
                                                labels: rutas,
                                                datasets: datasets
                                            }}
                                            options={{
                                                plugins: {
                                                    legend: { display: true, position: 'top' },
                                                    title: { display: false },
                                                    mostrarTotalesEnLinea 
                                                },
                                                scales: {
                                                    x: { title: { display: true, text: 'Ruta' } },
                                                    y: { title: { display: true, text: 'Total de Económicos' }, beginAtZero: true }
                                                }
                                            }}
                                            className="grafica-extra"
                                            style={{ maxWidth: '100%', height: '400px' }}
                                            plugins={[mostrarTotalesEnLinea]} // <-- También agrega aquí por compatibilidad
                                        />
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center', marginTop: '0.5rem', width: '100%' }}>
                                            Comparación de turnos por ruta
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                        {/* Gráficas por turno por rutas del módulo seleccionado (general with clic en barra) o por filtro de módulo específico */}
                        {((filtrosActuales?.modulo === 0 && moduloSeleccionado !== null) || (filtrosActuales?.modulo !== 0)) && ['t1', 't2', 't3', 'dia', 'hasta'].includes(filtrosActuales?.turnoFiltro || '') && (
                            <div style={{ display: 'flex', flexDirection: 'row', gap: '2rem', justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                {(() => {
                                    let turnosToShow: string[] = [];
                                    if (['t1', 't2', 't3'].includes(filtrosActuales?.turnoFiltro)) {
                                        if (filtrosActuales.turnoFiltro === 't1') turnosToShow = ['t1'];
                                        if (filtrosActuales.turnoFiltro === 't2') turnosToShow = ['t1', 't2'];
                                        if (filtrosActuales.turnoFiltro === 't3') turnosToShow = ['t1', 't2', 't3'];
                                    } else if (filtrosActuales?.turnoFiltro === 'dia') {
                                        turnosToShow = ['t1', 't2', 't3'];
                                    } else if (filtrosActuales?.turnoFiltro === 'hasta') {
                                        const fecha = filtrosActuales?.fecha_ini;
                                        const hoy = fecha && isToday(fecha);
                                        const min = getCurrentMinutes();
                                        turnosToShow = ['t1'];
                                        if (hoy && min >= turnos.t2.fin) {
                                            turnosToShow.push('t2');
                                        }
                                        if (hoy && min >= turnos.t3.fin) {
                                            turnosToShow.push('t3');
                                        }
                                    }
                                    // Determinar el módulo a mostrar (por clic en barra o por filtro directo)
                                    const moduloActual = filtrosActuales?.modulo === 0 ? moduloSeleccionado : filtrosActuales?.modulo;
                                    // Agrupar por ruta and filtrar por turno
                                    const agrupado: { [ruta: string]: any } = {};
                                    filtradosData.forEach(reg => {
                                        if (Number(reg.modulo) === Number(moduloActual)) {
                                            const ruta = reg.ruta1;
                                            if (!agrupado[ruta]) agrupado[ruta] = [];
                                            agrupado[ruta].push(reg);
                                        }
                                    });
                                    const rutas = Object.keys(agrupado);
                                    return turnosToShow.map(turno => {
                                        const labels = rutas;
                                        const totals = rutas.map(ruta => filtrarPorTurno(agrupado[ruta], turno).length);
                                        // const totalSalidasPorRuta = totals.reduce((acc, curr) => acc + curr, 0);
                                        // console.log(`Total de salidas en módulo ${moduloActual} para turno ${turno}:`, totalSalidasPorRuta);
                                        const turnoLabel = turno === 't1' ? 'Primer turno (4:59am - 10:00am)' : turno === 't2' ? 'Segundo turno (4:59am - 5:00pm)' : 'Tercer turno (4:59am - 8:00pm)';
                                        const color = turno === 't1' ? '#66BB6A' : turno === 't2' ? '#4e1ea0ff' : '#FFA726';
                                        return (
                                            <div key={turno} style={{ width: '700px', minWidth: '600px' }}>
                                                <h4 className="text-center mb-2">{turnoLabel}</h4>
                                                <Chart
                                                    type="bar"
                                                    data={{
                                                        labels: labels,
                                                        datasets: [
                                                            {
                                                                label: 'Total de Económicos',
                                                                data: totals,
                                                                backgroundColor: color
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
                                                            x: { title: { display: true, text: 'Ruta' } },
                                                            y: { title: { display: true, text: 'Total de Económicos' }, beginAtZero: true }
                                                        }
                                                    }}
                                                    className="mb-5 grafica-extra"
                                                    style={{ maxWidth: '100%', height: '400px', marginLeft: 0 }}
                                                    plugins={[mostrarTotalesEnBarra]} // <-- También agrega aquí por compatibilidad
                                                />
                                                <div className="text-center mb-1" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                                    {(() => {
                                                        // Calcular el total usando la misma data base y lógica
                                                        const registrosModulo = filtradosData.filter((reg: any) => Number(reg.modulo) === Number(moduloActual));
                                                        const totalTurno = filtrarPorTurno(registrosModulo, turno).length;
                                                        return `Total de Salidas de Económicos en Módulo ${moduloActual}: ${totalTurno}`;
                                                    })()}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        )}

                        {(() => {
                            // Calcular total de económicos usando el mismo filtro de turno que la tabla principal
                            let totalSalidas = 0;
                            if (filtrosActuales) {
                                // Si es módulo general, sumar todos los detalles filtrados por turno
                                if (filtrosActuales.modulo === 0) {
                                    totalSalidas = data.reduce((acc, curr) => acc + (Array.isArray(curr.detalles) ? curr.detalles.length : 0), 0);
                                } else {
                                    // Si es por ruta, sumar todos los detalles filtrados por turno
                                    totalSalidas = data.reduce((acc, curr) => acc + (Array.isArray(curr.detalles) ? curr.detalles.length : 0), 0);
                                }
                            }
                            // Columnas para filtro GENERAL
                            let columnasGeneral: any[] = [
                                { field: 'id', header: '#' },
                                { field: 'ruta', header: 'Módulos' },
                            ];
                            // Columnas para filtro por módulo/ruta 
                            let columnasModulo: any[] = [
                                { field: 'id', header: '#' },
                                { field: 'ruta', header: 'Rutas' },
                                {
                                    field: 'descripcion_ruta',
                                    header: 'Origen - Destino',
                                    body: (rowData: any) => {
                                        const rutaObj = OPTS_RUTA?.find((r: any) => r.value?.nombre === rowData.ruta);
                                        return rutaObj
                                            ? `${rutaObj.value.origen_desc} - ${rutaObj.value.destino_desc}`
                                            : '';
                                    }
                                },
                                { field: 'modalidad', header: 'Modalidad' },
                            ];
                            // Determinar los turnos a mostrar igual que la gráfica
                            let turnosToShow: string[] = [];
                            const turnoSel = String(filtrosActuales?.turnoFiltro || turnoFiltro);
                            if (['t1', 't2', 't3'].includes(turnoSel)) {
                                if (turnoSel === 't1') {
                                    turnosToShow = ['t1'];
                                } else if (turnoSel === 't2') {
                                    turnosToShow = ['t1', 't2'];
                                } else if (turnoSel === 't3') {
                                    turnosToShow = ['t1', 't2', 't3'];
                                }
                            } else if (turnoSel === 'dia') {
                                turnosToShow = ['t1', 't2', 't3'];
                            } else if (turnoSel === 'hasta') {
                                const fecha = filtrosActuales?.fecha_ini;
                                const hoy = fecha && isToday(fecha);
                                const min = getCurrentMinutes();
                                turnosToShow = ['t1'];
                                if (hoy && min >= turnos.t2.fin) {
                                    turnosToShow.push('t2');
                                }
                                if (hoy && min >= turnos.t3.fin) {
                                    turnosToShow.push('t3');
                                }
                            }
                            // Agrega columnas dinámicas por turno a ambas tablas
                            turnosToShow.forEach(turno => {
                                columnasGeneral.push({
                                    field: `total_${turno}`,
                                    header: `Total ${turno.toUpperCase()}`,
                                    body: (rowData: any) => (
                                        <span style={{ background: coloresTurno[turno], color: '#fff', borderRadius: 6, padding: '2px 8px', display: 'inline-flex', alignItems: 'center' }}>
                                            {rowData[`total_${turno}`]}
                                            <Button
                                                label=""
                                                icon="pi pi-eye"
                                                size="small"
                                                className="p-button-text p-button-sm"
                                                style={{marginLeft:4, color:'#fff'}}
                                                onClick={() => handleVerDetalles(rowData[`detalles_${turno}`] ?? [])}
                                            />
                                        </span>
                                    )
                                });
                                columnasModulo.push({
                                    field: `total_${turno}`,
                                    header: `Total ${turno.toUpperCase()}`,
                                    body: (rowData: any) => (
                                        <span style={{ background: coloresTurno[turno], color: '#fff', borderRadius: 6, padding: '2px 8px', display: 'inline-flex', alignItems: 'center' }}>
                                            {rowData[`total_${turno}`]}
                                            <Button
                                                label=""
                                                icon="pi pi-eye"
                                                size="small"
                                                className="p-button-text p-button-sm"
                                                style={{marginLeft:4, color:'#fff'}}
                                                onClick={() => handleVerDetalles(rowData[`detalles_${turno}`] ?? [])}
                                            />
                                        </span>
                                    )
                                });
                            });
                            // Renderizar tabla con columnas según filtro
                            if (filtrosActuales?.modulo === 0) {
                                // Renderiza la tabla GENERAL con la columna de detalles modificada
                                // Calcular los totales por turno usando la misma lógica que las gráficas (por módulo)
                                // Usar la data filtrada como base para los totales y detalles
                                const modulosBase = [1, 2, 3, 4, 5, 6, 7];
                                // Agrupar por módulo usando 'filtrados'
                                const tablaGeneral = modulosBase.map((modulo, idx) => {
                                    const registros = filtradosData.filter((reg: any) => Number(reg.modulo) === modulo);
                                    return {
                                        id: idx + 1,
                                        ruta: `Módulo ${modulo}`,
                                        total_t1: filtrarPorTurno(registros, 't1').length,
                                        total_t2: filtrarPorTurno(registros, 't2').length,
                                        total_t3: filtrarPorTurno(registros, 't3').length,
                                        detalles_t1: filtrarPorTurno(registros, 't1'),
                                        detalles_t2: filtrarPorTurno(registros, 't2'),
                                        detalles_t3: filtrarPorTurno(registros, 't3'),
                                    };
                                });
                                // Totales generales
                                const total_t1 = tablaGeneral.reduce((acc, curr) => acc + curr.total_t1, 0);
                                const total_t2 = tablaGeneral.reduce((acc, curr) => acc + curr.total_t2, 0);
                                const total_t3 = tablaGeneral.reduce((acc, curr) => acc + curr.total_t3, 0);
                                // Fila total con los detalles combinados
                                const filaTotal = {
                                    id: '',
                                    ruta: 'TOTAL',
                                    total_t1,
                                    total_t2,
                                    total_t3,
                                    detalles_t1: tablaGeneral.flatMap(row => row.detalles_t1),
                                    detalles_t2: tablaGeneral.flatMap(row => row.detalles_t2),
                                    detalles_t3: tablaGeneral.flatMap(row => row.detalles_t3),
                                };
                                return (
                                    <TablaCRUD
                                        data={[...tablaGeneral, filaTotal]}
                                        cols={columnasGeneral}
                                        className='mt-3'
                                        accion={false}
                                        dataTableProps={{
                                            loading: loading,
                                            resizableColumns: true,
                                            rowClassName: (rowData: any) => rowData.ruta === 'TOTAL' ? 'bg-green-100 font-bold' : ''
                                        }}
                                    />
                                );
                            } else {
                                // Tabla por módulo/ruta con totales por turno
                                let dataModulo = data.map(row => {
                                    let rowTurnos: any = { ...row };
                                    turnosToShow.forEach(turno => {
                                        rowTurnos[`total_${turno}`] = filtrarPorTurno(row.detalles, turno).length;
                                        rowTurnos[`detalles_${turno}`] = filtrarPorTurno(row.detalles, turno);
                                    });
                                    return rowTurnos;
                                });
                                return (
                                    <TablaCRUD
                                        data={dataModulo}
                                        cols={columnasModulo}
                                        className='mt-3'
                                        accion={false}
                                        dataTableProps={{
                                            loading: loading,
                                            resizableColumns: true,
                                            rowClassName: (rowData: any) => rowData.ruta === 'TOTAL' ? 'bg-green-100 font-bold' : ''
                                        }}
                                    />
                                );
                            }
                        })()}
                    </>
                )
            )}
            {/* Detalles de ruta en modal */}
            {showDetalles && (
                <div className="p-dialog-mask p-component-overlay p-dialog-visible"
                    style={{
                        top: 0, left: 0, width: '100vw', height: '100vh',
                        zIndex: 1000
                    }}>
                    <div className="p-dialog p-component"
                        style={{
                            background: '#fff',
                            padding: '1rem',
                            width: '90%',
                            maxWidth: '900px',
                            maxHeight: '80vh',
                            overflowY: 'auto',
                            position: 'relative'
                        }}>
                        <Button
                            icon="pi pi-times"
                            size="small"
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem'
                            }}
                            className='p-button-rounded p-button-text'
                            onClick={() => setShowDetalles(false)}
                        />
                        <h3 className='mb-3 text-center'>
                            {(() => {
                                const total = detallesRuta.length;
                                const modulo = detallesRuta[0]?.modulo ?? '';
                                // Obtener todas las fechas únicas de los detalles
                                const fechasUnicas = Array.from(new Set(detallesRuta.map(row => {
                                    const raw = row.time1 || '';
                                    return raw.split(' ')[0];
                                }))).filter(f => !!f);
                                // Solo obtener la primera fecha y limpiar comas
                                let fecha = (fechasUnicas[0] || '').replace(/,/g, '').trim();
                                return `Módulo ${modulo} tuvo un total de ${total} económicos al día de ${fecha}`;
                               
                            })()}
                        </h3>
                        <TablaCRUD
                            data={detallesRuta.map((row, idx) => ({
                                consecutivo: idx + 1,
                                economico: row.eco1,
                                operador: row.op_cred1,
                                fecha_hora: row.time1,
                                turno: row.op_turno1,
                                extintor: row.extintor1,
                                ruta: row.ruta1,
                                modalidad: row.modalidad1,
                                CC: row.cc1,
                                Motivo: row.motivo1,
                                modulo: row.modulo,
                            }))}
                            cols={[
                                { field: 'consecutivo', header: '#', className: 'text-center' },
                                { field: 'economico', header: 'Económico', className: 'text-center' },
                                { field: 'operador', header: 'Operador', className: 'text-center' },
                                { field: 'fecha_hora', header: 'Fecha/Hora', className: 'text-center' },
                                { field: 'turno', header: 'Turno', className: 'text-center' },
                                { field: 'extintor', header: 'Extintor', className: 'text-center' },
                                { field: 'ruta', header: 'Ruta', className: 'text-center' },
                                { field: 'modalidad', header: 'Modalidad', className: 'text-center' },
                                { field: 'CC', header: 'CC', className: 'text-center' },
                                { field: 'Motivo', header: 'Motivo', className: 'text-center' },
                                { field: 'modulo', header: 'Modulo', className: 'text-center' },
                            ]}
                            accion={false}
                            className='mt-2'
                        />
                    </div>
                </div>
            )}
        </div>
    )
}