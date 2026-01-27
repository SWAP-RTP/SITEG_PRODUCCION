import React, { useCallback, useEffect, useId, useState } from 'react'
import { Dropdown } from 'primereact/dropdown'
import { MultiSelect } from 'primereact/multiselect'
import { Button } from 'primereact/button'
import { Divider } from 'primereact/divider'
import { Card } from 'primereact/card'
import CumplimientoRol from '../getCumplimiento.BACKEND'
import { DiaCal, Res_Periodos, Res_RolHeaders, RutaCumplimiento, TarjetaData } from '../interfaces'
import { FechasPF, PrimeColors } from '../../shared/interfaces'
import { UseFetchPost, UseFetchGet } from '../../shared/helpers-HTTP'
import { sortByPropertyString, fixN } from '../../shared/helpers'
import { BotonesPagDias } from '../../shared/components'
import { Loading1, LoadingDialog } from '../../shared/components/Loaders'
import { BarChartReu } from '../../shared/components/Charts'
import { B } from '../../shared/components/TextStyles'
import { TablaComponenteCRUD } from '../../shared/components/Tabla'



interface DataDesc {
    mod: null | string, 
    fechas: null | FechasPF, 
    ruta: null | string, 
    prom: null | number, 
    eco: null | number | string, 
    eco_cumpli: null | number,
    eco_cumpli_chartColor?: string, 
    eco_day: null | string, 
    eco_day_cumpli: null | number,
    eco_day_cumpli_color?: PrimeColors,
    eco_day_cumpli_bgColor?: PrimeColors,
}


const apiSugoBackTS = import.meta.env.VITE_SUGO_BackTS  //Mntener abierto el archivo custom.d.ts para el error
const CUMPLIMIENTO_MIN = 60;
const PINK100 = '#F69EBC';
const PINK400 = '#F1749E';
const PINK500 = '#ED4981';
const RED = '#FF4032';
const GREEN = '#5E8F32';
const cols = [
    { field: 'label', header: 'Label' },
    { field: 'isOk',  header: '¿Cumplio?', align: 'center', style:{maxWidth:'10%'} },
    { field: 'plan',  header: 'Plan', style:{maxWidth:'20%'} },
    { field: 'real',  header: 'Real', style:{maxWidth:'20%'} },
]
const OPTS_MODS = [ 
    { name: 'M01', value: { name: 'M01', value: 1}},
    { name: 'M02', value: { name: 'M02', value: 2}},
    { name: 'M03', value: { name: 'M03', value: 3}},
    { name: 'M04-A', value: { name: 'M04-A', value: 4}},
    { name: 'M04-M', value: { name: 'M04-M', value: 4}},
    { name: 'M05', value: { name: 'M05', value: 5}},
    { name: 'M06', value: { name: 'M06', value: 6}},
    { name: 'M07', value: { name: 'M07', value: 7}}
]

export const CumpliRol = () => {

    const formId = useId();

    const [showDesc, setShowDesc] = useState(false);

    const [mod, setMod] = useState<{name: string, value: number}>();
    const [periodo, setPeriodo] = useState<any>();                // new Date(2023,3,3)    03 de abril del 2023
    const [periodoOpt, setPeriodoOpt] = useState<any[]>([]);
    const [ruta, setRuta] = useState<Res_RolHeaders|null>();
    const [rutaOpts, setRutaOpts] = useState<any[]>([]);
    const [ecos, setEcos] = useState<number[]>([]);
    const [ecosOpts, setEcosOpts] = useState([]);
    
    const [isLoadingChart, setIsLoadingChart] = useState(false);

    // Porcentaje promedio de ruta                                  (send)
    const [dataChart1, setDataChart1] = useState<{label: string, value: number}[]>( [] );  
    // Data del cumplimiento de la ruta hasta el operador X dia     (send)
    const [cumpliData, setCumpliData] = useState<RutaCumplimiento>();                  
    // Indice del eco seleccionado al clickear la grafica
    const [ecoSelected, setEcoSelected] = useState(-1);
    // Data a mostrar en interfaz y usar para la descripción        (send)
    const [data2desc, setData2desc] = useState<DataDesc>({mod: null, fechas: null, ruta: null, prom: null, eco: null, eco_cumpli: null, eco_day: null, eco_day_cumpli: null});
    
    // Porcentaje promedio de ruta
    const [dataChart2, setDataChart2] = useState<{label: string, value: number}[]>( [] );
    // Indice del dia seleccionado al clickear la grafica del eco
    const [daySelected, setDaySelected] = useState(-1);
    // Data para Cards en descripcion para visualizar rapido los puntos fallados del servicio durante en X dia
    const [dataCards, setDataCards] = useState<string[][]>([]);
    // Data para tabla de descripcion del cumplimiento por dia
    const [dataTableDesc, setDataTableDesc] = useState<{ id, label, isOk, plan, real }[]>([]);



    //& Setear opciones a input periodos
    useEffect(() => {
        UseFetchGet(`${apiSugoBackTS}/api/periodos`)
            .then( (res: Res_Periodos[]) => {
                const d = new Date()
                const periodoActual = res.findIndex( ({fecha_inicio, fecha_fin}) => new Date(fecha_inicio) < d && d < new Date(fecha_fin) )
                const n = (periodoActual === 0) ? 0 : 1;
                const periodosToShow = res.slice( periodoActual-n, periodoActual+2 );
                setPeriodoOpt(periodosToShow.map( obj => ({
                    ...obj, 
                    name: `${`${obj.serial}`.padStart(2, '0')} - del ${obj.fecha_inicio} al ${obj.fecha_fin}`,
                    value: {...obj}
                }) )) 
            })
            .catch( err => console.error(err) )
        .finally( () => {} )
    }, [])

    //& Cada vez que cambie modulo limpia inputs [Roles, Ecos] y actualiza [Roles] a las del modulo 
    useEffect(() => {
        setRuta(null)
        setEcos([])
        console.log(mod?.name.slice(2));
        if( mod && mod.name && periodo ){
            UseFetchGet(`${apiSugoBackTS}/api/rol/headers?periodo=${periodo.id}&modulo=${mod.name.slice(2)}`)
                .then( (res: Res_RolHeaders[]) => {
                    console.log(res);
                    setRutaOpts(res.filter( obj => obj.periodo_id==periodo.id ).map( obj => ({
                        ...obj, 
                        name: `${obj.swap_ruta}`,
                        value: {...obj}
                    }) )) 
                })
                .catch( err => console.error(err) )
            .finally( () => {} );
        }
    }, [mod, periodo])

    //& Cada vez que cambie Rol de ruta: limpia y actualiza [ecos]
    useEffect(() => {
        setEcos([])
        if( ruta ){
            UseFetchGet(`${apiSugoBackTS}/api/rol/cal/ecos?rol=${ruta.id}&needEcos=1`)
                .then( ({ecos}) => {
                    const ecos2 = ecos.map( (obj:any) => ({name:`${obj.servicio} - ${obj.eco}`, value: obj.eco }))
                    
                    const n = sortByPropertyString( ecos2, 'name') 
                    setEcosOpts( n )
                    setEcos( n.map(obj => obj.value) )
                } )
                .catch( err => console.error(err) )
            .finally( () => {} )
        }
    }, [ruta])
    
    const cleanDescStates = () => {
        setShowDesc(false);
        setEcoSelected(-1);
        setDaySelected(-1);
    }

    //& Enviar datos y obtener el cumplimiento del eco para uno o varios dias
    const send =  useCallback( async(periodo: any, mod: number, ruta: Res_RolHeaders, ecos: number[]) => {
        const data2send = { periodo, modulo: mod, ruta, ecos: ecos.filter( (item, index, self) => self.indexOf(item) === index ) }; 
        console.log(data2send);
        try {
            setIsLoadingChart(true)
            cleanDescStates()

            const { 
                cumplimiento, 
                // tjtData, 
                // calendariosRol 
            }: { cumplimiento: RutaCumplimiento, tjtData: TarjetaData[], calendariosRol: DiaCal[] } = await UseFetchPost(`${apiSugoBackTS}/api/cumpli/rol`, data2send )
            // console.log({calendariosRol, tjtData});
            // const cumpliRol = new CumplimientoRol(tjtData, calendariosRol, periodo, ruta as Res_RolHeaders)
            // const cumplimiento = cumpliRol.getCumplimientoXecos(ecos)

            setData2desc( d => ({
                ...d, 
                ruta: ruta!.swap_ruta, 
                prom: fixN(cumplimiento.ruta_cumplimiento*100, 2)
            }) )
            setDataChart1( cumplimiento.cumplimientoDeEcos.map( obj => ({
                label: `${obj.cumplimientosXdia[0].servicio}-${obj.eco}`,
                value: fixN(obj.ecoInPeriod_cumplimiento*100, 2)
            })))
            setCumpliData( cumplimiento )

            setIsLoadingChart(false)
        } catch (error) {
            console.error(error);
        }
    },[])
    

    //& Eco seleccionado para mostrar descripcion a lo largo del periodo
    useEffect(() => {
        if(ecoSelected >= 0){
            const ecoSel = dataChart1[ecoSelected];
            const ecoCumplisXdia = cumpliData!.cumplimientoDeEcos[ecoSelected].cumplimientosXdia
            setData2desc( (p) => ({
                ...p, 
                eco: ecoSel.label, 
                eco_cumpli: ecoSel.value, 
                eco_cumpli_chartColor: (ecoSel.value<CUMPLIMIENTO_MIN) ? PINK400 : GREEN, 
            }))
            setDataChart2( ecoCumplisXdia.map( obj => ({
                label: `${(obj.fecha as string).split('-').reverse().join('/')}`,
                value: fixN(obj.eco_cumplimiento*100, 2)
            })) )
        }
    }, [ecoSelected])

    //& Manejador para la primera grafica
    const handleClickBar = (e) => {
        // console.log(e.index, e.data);
        setEcoSelected(e.index)
        setShowDesc(true)
    }

    //& Manejador para la primera grafica
    const handleClickBar2 = (e) => {
        // console.log({...e.data, index: e.index});
        setDaySelected( e.index )
    }

    //& Eco seleccionado para mostrar descripcion a lo largo del periodo
    useEffect(() => {
        if(daySelected >= 0){
            const daySel = dataChart2[daySelected];
            const ecoCumpliXdia = cumpliData!.cumplimientoDeEcos[ecoSelected].cumplimientosXdia[daySelected]
            
            setData2desc( (p) => ({
                ...p,
                eco_day:                 daySel.label, 
                eco_day_cumpli:          daySel.value,
                eco_day_cumpli_color:   (daySel.value<CUMPLIMIENTO_MIN) ? 'red' : 'green',
                eco_day_cumpli_bgColor: (daySel.value<CUMPLIMIENTO_MIN) ? 'pink' : 'green',
            }))

            const rawData2cards = [
                ecoCumpliXdia.cumplimiento as unknown as { [key: string]: boolean }, 
                ...ecoCumpliXdia.cumplimientosXcred.map( obj => {
                    return (obj.cumplimiento as unknown as { [key: string]: boolean })
                })
            ]
            const traducirKeys = {
                ruta:       'Ruta',
                modalidad:  'Modalidad',
                turno1:     'Turno 1',
                turno2:     'Turno 2',
                turno3:     'Turno 3',
                op_cred:    'Credencial',
                turno:      'Turno',
                hr_ini_t:   'Hora de inicio del turno',
                lug_ini_cc: 'Lugar de inicio',
                hr_ini_cc:  'Hora de inicio en CC',
                hr_ter_cc:  'Hora de termino en CC',
                lug_ter_cc: 'Lugar de termino en CC',
                hr_ter_mod: 'Hora de termino en Modulo',
                hr_ter_t:   'Hora de termino del turno',
            }
            const data2cards = rawData2cards.map( obj => {
                const keys = Object.keys(obj)
                const newData = keys.map( k => {
                    const symbol = (obj[k]===undefined) ? '➖' : (obj[k]) ? '✅':'❌';
                    return `${traducirKeys[k]}: ${symbol}`
                } )
                return newData
            } )
            setDataCards( data2cards )

            const descHeader = ecoCumpliXdia.cumplimientoDesc
            const data2table_header = Object.keys(descHeader).map( (k, index) => ({
                id:     `0${index}-${k}`, 
                isOk:   (ecoCumpliXdia.cumplimiento[k]===undefined) ? '➖' : (ecoCumpliXdia.cumplimiento[k]) ? '✅':'❌',
                label:  traducirKeys[k],
                plan:   descHeader[k][0],
                real:   descHeader[k][1],
            }) )
            const data2table_turnos = ecoCumpliXdia.cumplimientosXcred.map( (obj, i) => {
                const { op_cred, cumplimiento, cumplimientoDesc, ...rest } = obj
                const data = Object.keys(cumplimientoDesc).map( (k, index) => ({
                    id:     `${i+1}${index}-${k}`, 
                    isOk:   (cumplimiento[k]===undefined) ? '➖' : (cumplimiento[k]) ? '✅':'❌',
                    label:  `${traducirKeys[k]} ${i+1}`,
                    plan:   cumplimientoDesc[k][0],
                    real:   cumplimientoDesc[k][1],
                }) )
                return data
                // return { op_cred, data }
            })
            setDataTableDesc( [
                ...data2table_header,
                ...data2table_turnos.flat()
            ])
        }
    }, [dataChart2, daySelected])


    
    const inputCont = 'flex flex-wrap align-items-center gap-2'
    return (
        <>
        <h2>Porcentaje promedio de cumplimiento del Rol</h2>

        <div className={`${inputCont} gap-4`} >   {/* //? Formulario */}
            <div className={`${inputCont}`}>
                <h3 className='my-0' >Periodo </h3>
                <Dropdown 
                    name={`${formId}-Dropdown`}
                    value={periodo} 
                    onChange={(e) => setPeriodo(e.value)} 
                    options={periodoOpt} 
                    optionLabel="name" 
                    // optionValue='id'
                    placeholder="Selecciona periodo" 
                    // filter 
                    className="w-auto sm:w-17rem" 
                />
            </div>

            <div className={`${inputCont}`}>
                <h3 >Modulo </h3>
                {/* <InputMask
                    name={`${formId}-InputMask`}
                    // disabled
                    value={mod} onChange={(e) => setMod(e.target.value!)} 
                    className='max-w-3rem' mask="9"
                /> */}
                <span className="p-float-label w-7rem">
                    <Dropdown inputId="dd-modulo" 
                        value={mod} onChange={(e) => setMod(e.value)} 
                        options={OPTS_MODS} 
                        optionLabel="name" optionValue='value' 
                        className="w-full" 
                    />
                    <label htmlFor="dd-modulo">Modulo</label>
                </span>
            </div>
            
            <div className={`${inputCont}`}>
                <h3 >Ruta </h3>
                <Dropdown value={ruta} onChange={(e) => setRuta(e.value) } 
                    name={`${formId}-Dropdown`}
                    options={ rutaOpts } 
                    optionLabel="name" 
                    disabled={ !(rutaOpts.length > 0) }
                    placeholder="Select Ruta" 
                    className="w-10rem" 
                />
            </div>

            <div className='w-26rem flex align-items-center justify-content-between md:justify-content-start' >
                <div className={`${inputCont}`}>
                    <h3 >Servicios </h3>
                    <MultiSelect placeholder="0" 
                        name={`${formId}-MultiSelect`}
                        optionLabel="name" 
                        maxSelectedLabels={2}
                        options={ ecosOpts } 
                        disabled={ !ruta }
                        value={ecos} onChange={(e) => setEcos(e.value)} 
                        className= "max-w-16rem" 
                    />
                </div>
                <div className='sm:ml-4'>
                    <Button 
                        icon="pi pi-check" rounded raised
                        disabled= { ecos.length == 0 }
                        onClick={ () => send(periodo, mod!.value, ruta!, ecos) } 
                    />
                </div>
            </div>
                { isLoadingChart && <Loading1 size={40} title='' /> }
        </div>      {/* //? --FIN Formulario */}

        <Divider />

        <BarChartReu data={dataChart1} 
            // onCleanChart={cleanChart} 
            title={`Ruta ${data2desc.ruta ?? ''} - cumplimiento promedio: ${data2desc.prom}% `} 
            onClickBar={handleClickBar}  
        />
        { ecoSelected >=0 && showDesc && dataChart1.length > 0 &&
          <>
            <BotonesPagDias 
                iPosition={ecoSelected} setIPosition={setEcoSelected} 
                dato2show={dataChart1[ecoSelected]?.label} 
                totalSteps={dataChart1.length-1} 
                textColor='purple' severity='secondary'
            />

            <Divider type="dashed" className='mt-6' />

            { dataChart2.length > 0 && 
                <BarChartReu data={dataChart2} 
                    // onCleanChart={cleanChart} 
                    title={`Servicio ${data2desc.eco ?? ''}  cumplimiento promedio: ${data2desc.eco_cumpli}% `} 
                    colorBar={data2desc.eco_cumpli_chartColor}
                    onClickBar={handleClickBar2}  
                />
            }
            { daySelected >=0 && dataChart2.length > 0 &&
                <BotonesPagDias 
                    iPosition={daySelected} setIPosition={setDaySelected} 
                    dato2show={dataChart2[daySelected].label} 
                    totalSteps={dataChart2.length-1} 
                    textColor='green' severity='success'
                />
            }

            { daySelected >=0 && data2desc.eco_day && dataCards.length>0 && dataTableDesc.length>0 && 
                <>
                    <div className={`bg-${data2desc.eco_day_cumpli_bgColor}-50 px-4 py-1 mt-6 mb-4 sticky top-0 z-5`} >
                        <h3>
                            Descripción del servicio <B color={data2desc.eco_day_cumpli_color}>{data2desc.eco}</B> en {data2desc.eco_day} {''}
                            (<B color={data2desc.eco_day_cumpli_color}>{data2desc.eco_day_cumpli}%</B>) 
                        </h3>
                    </div>

                    <div className='flex flex-wrap justify-content-center gap-4'>
                        { dataCards.map( (arr, i) => {
                                const titleCard = (i==0) ? 'Encabezado' : `Turno ${i}`
                                return (
                                    <Card title={titleCard} key={'card-title'+i} className='my-2 max-w-max shadow-4' >
                                        { arr.map( (str, i) => (
                                            <p className="m-1 mr-3" key={str+i} > {str} </p>
                                        ))}
                                    </Card>
                                )
                            })
                        }
                    </div>

                    <div className='mt-6'>
                        <TablaComponenteCRUD cols={cols} data={dataTableDesc} accion={false} paginator={false} displayRows={50} />
                    </div>
                </>
            }
          </>
        }



    
        <LoadingDialog isVisible={isLoadingChart} />
        </>
    )
}

