import React, { useContext, useEffect, useState } from 'react'
import { UseQueryResult, useQuery } from 'react-query';
import { FetchPVestados, Result } from '../interfaces';
import { UseFetchGet } from '../../../shared/helpers-HTTP';
import { TablaCRUD } from '../../../shared/components/Tabla'
import { groupByRepeatedValue } from '../../../shared/helpers';
import { GeneralContext } from '../../../shared/GeneralContext';
import useAuthStore from '../../../shared/auth/useAuthStore';
import { Tooltip } from 'primereact/tooltip';
import { Badge } from 'primereact/badge';
import { Dropdown } from 'primereact/dropdown';
import { Sidebar } from 'primereact/sidebar';


const API = import.meta.env.VITE_SUGO_BackTS

export const BG_ECOSxMODALIDAD_COLORS = {
    "ATENEA": "#FAD",    // #E681B3 
    "ECOBÚS": "#81C240",    // "#198754",
    "ESCOLAR": "#FE0",   // #FD9E31
    "EXPRESO": "#8CF",   // #97C1FE
    "EXPRESO DIRECTO": "linear-gradient(45deg, #8CF 0%, #8CF 50%, #FFF 50%, #FFF 100%)",
    "METROBÚS": "#F66",
    "METROBÚS ARTICULADO": "linear-gradient(45deg, #F66 0%, #F66 50%, #F7F7F7 50%, #F7F7F7 100%)",
    "METROBÚS BIARTICULADO": "linear-gradient(45deg, #F66 0%, #F66 45%, #F7F7F7 45%, #F7F7F7 55%, #F66 55%, #F66 100%)",
    "ORDINARIO": "#FB4",
    "SERVICIOS GENERALES": "#AFA",
    "UTILITARIO": "#C93",
    "sin tipo": "linear-gradient(45deg, #FFF 0%, #FFF 45%, #F88 45%, #F88 55%, #FFF 55%, #FFF 100%)"
    // CAFE: "#CC9037"; 
}
const RELOJBADGE_COLORS = ['', '#FFF', '#FF0', '#FA0', '#F00']
const opcionesEcoModalidad = [
    { name: 'Todos', value: 'all' },
    { name: 'ATENEA', value: 'ATENEA' },
    { name: 'ECOBÚS', value: 'ECOBÚS' },
    { name: 'ESCOLAR', value: 'ESCOLAR' },
    { name: 'EXPRESO', value: 'EXPRESO' },
    { name: 'EXPRESO DIRECTO', value: 'EXPRESO DIRECTO' },
    { name: 'METROBÚS', value: 'METROBÚS' },
    { name: 'METROBÚS ARTICULADO', value: 'METROBÚS ARTICULADO' },
    { name: 'METROBÚS BIARTICULADO', value: 'METROBÚS BIARTICULADO' },
    { name: 'ORDINARIO', value: 'ORDINARIO' },
    { name: 'SERVICIOS GENERALES', value: 'SERVICIOS GENERALES' },
    { name: 'UTILITARIO', value: 'UTILITARIO' },
    { name: 'sin tipo', value: null }
]
/**
 * Valida si la fecha esta entre los rango de <1, <2, <7, <30 y 30 dias o mas
 */
const getValidityType = (date: Date): number => {
    const date0 = new Date();    date0.setDate( date0.getDate()-1 );
    const date1 = new Date();    date1.setDate( date1.getDate()-2 );
    const date2 = new Date();    date2.setDate( date2.getDate()-7 );
    const date3 = new Date();    date3.setDate( date3.getDate()-30 );

    if(date>date0)      return 0
    else if(date>date1) return 1
    else if(date>date2) return 2
    else if(date>date3) return 3
    else return 4
}


type PvXmotivosData = Result & {validityType: number}

export const TablaEcosEnRuta = ({moduloInput, puerta}) => {
    const modulo = useAuthStore( s => s.user.modulo)
    const [selectEcoModalidad, setSelectEcoModalidad] = useState('all')
    const [selectValidityType, setSelectValidityType] = useState(0)

    const pvXmotivos = useQuery<FetchPVestados, any, { count: number, pv: {title: string, data: PvXmotivosData[]}[] }>(
        ['pv','por-motivos'],
        () => UseFetchGet(`${API}/api/caseta/pv-estados?create_modulo=${moduloInput||modulo}&modulo_puerta=${puerta||0}&estatus=1&limit=5000`),
        {
            select: (data) => {
                const dataRaw = data.results.map( d => ({
                    ...d, 
                    motivo: d.pv_estados_motivo.desc,
                    eco_disponible: d.pv_estados_motivo.eco_disponible,
                    momento: new Date(d.momento).toLocaleString(),
                    validityType: getValidityType(new Date(d.momento))
                }))

                const dataGrouped = groupByRepeatedValue(dataRaw, 'motivo').map( arr => ({ 
                    title: arr[0].motivo, 
                    data: arr.filter( eco => 
                        selectEcoModalidad==='all' ? true : eco.eco_modalidad?.name==selectEcoModalidad 
                    ) 
                }))
                return { count: data.info.count, pv:dataGrouped }
            }
        }
    )

    useEffect(() => {
        pvXmotivos.refetch()
    }, [selectEcoModalidad])    

    
    return ( 
    <div className='my-3 relative flex flex-wrap justify-content-center align-items-start gap-3 row-gap-5'>
        {/* Nomenclatura de colores */}
        {/* <div className='w-12'>
            <div className='w-12  my-4 lg:w-10 lg:mx-auto flex-center gap-2'>
                <h3 className='w-12'>Nomenclatura</h3>
            { Object.keys(BG_ECOSxMODALIDAD_COLORS).map( (modalidad, i) => (
                <span
                    key={'nomenclatura-modalidad-'+(i+1)} 
                    className='p-1 px-2 border-round-lg relative'
                    style={{ 
                        background: BG_ECOSxMODALIDAD_COLORS[modalidad], 
                        border: BG_ECOSxMODALIDAD_COLORS[modalidad].toUpperCase().includes('FFF') ?'solid 1px #000':'' 
                    }}
                >
                    {false &&  RELOJBADGE_COLORS[i%5] && <i className='absolute pi pi-clock border-circle' style={{top: -6, right: -6, background: RELOJBADGE_COLORS[i%5], color: '#000'}} />}
                    {modalidad}
                </span>
            ))}
            </div>
        </div> */}
        <Tooltip target="#pv-total" position='left'>
            <div className='flex flex-column'>
                <span>Total de PV: <b>{pvXmotivos.data?.count || 0}</b> ecos</span>
                <br />
                <span>Registro hecho entre: </span>
                <span> <i className='pi pi-clock border-circle' style={{background: RELOJBADGE_COLORS[1], color: '#000'}}/>: 1-2 dias </span>
                <span> <i className='pi pi-clock border-circle' style={{background: RELOJBADGE_COLORS[2], color: '#000'}}/>: +2 dias </span>
                <span> <i className='pi pi-clock border-circle' style={{background: RELOJBADGE_COLORS[3], color: '#000'}}/>: +7 dias </span>
                <span> <i className='pi pi-clock border-circle' style={{background: RELOJBADGE_COLORS[4], color: '#000'}}/>: +30 dias </span>
            </div>
        </Tooltip>

        <div className='w-12 mt-4 flex-center justify-content-between'>
            <div>
                <span className="p-float-label w-full md:w-14rem">
                    <Dropdown inputId="select-modalidad-de-eco" value={selectEcoModalidad} onChange={(e) => setSelectEcoModalidad(e.value)} options={opcionesEcoModalidad} optionLabel="name" className="w-full" />
                    <label htmlFor="select-modalidad-de-eco">Filtra por Tipo de eco</label>
                </span>
            </div>

            <div className='flex-center gap-3'>
                <span className='text-sm text-600'> 
                    <i className='pi pi-refresh cursor-pointer mr-1' onClick={() => pvXmotivos.refetch()} /> 
                    Ultima actualizacion: { pvXmotivos.isFetching ?
                        '--/--/----  --:--:--'
                        : pvXmotivos.isError ? 
                            'Error' 
                            : new Date(pvXmotivos.dataUpdatedAt).toLocaleString()
                    }
                </span>
                <i id='pv-total' className="pi pi-info-circle" />
            </div>
        </div>

        { pvXmotivos.data && pvXmotivos.data.pv.length>0 &&
        <>
            { pvXmotivos.data.pv.map( (pv, i) => 
                <MotivoTabla title={pv.title} rows={pv.data} key={pv.title+'-'+(i+1)}/>
            )}

            <MotivoServicioXrutasTabla 
                key={'tabla-'+'SERVICIO'+'-desglose'}
                data={pvXmotivos.data?.pv.find( pv => pv.title === 'SERVICIO' )?.data!}
            />

            <TablaServicioMB  data={pvXmotivos.data?.pv.find( pv => pv.title === 'SERVICIO MB' )?.data!}/>
            <TablaSefiNuevo  data={pvXmotivos.data?.pv.find( pv => pv.title === 'SEFI (Nuevo)' )?.data!}/>
        </>
        }
    </div>
    )
}





type Props2 = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
    title: string, 
    rows: PvXmotivosData[]
}

const initState = {
    "ATENEA": 0,
    "ECOBÚS": 0,
    "ESCOLAR": 0,
    "EXPRESO": 0,
    "EXPRESO DIRECTO": 0,
    "METROBÚS": 0,
    "METROBÚS ARTICULADO": 0,
    "METROBÚS BIARTICULADO": 0,
    "ORDINARIO": 0,
    "SERVICIOS GENERALES": 0,
    "UTILITARIO": 0,
    "sin tipo": 0,
}
// Convertir array en objeto, donde key = array[i] & value = 0
const initStateValidezTipo = RELOJBADGE_COLORS.reduce( (accum, current) => {    
    accum[current] = 0
    return accum
}, {})

const MotivoTabla = ({title, rows, ...rest}: Props2) => {
    const [visible, setVisible] = useState(false)
    const [ecoData, setEcoData] = useState<PvXmotivosData>()

    const data = rows.sort(function (a, b) {
        return a.eco - b.eco;
    });

    const [totales, setTotales] = useState({...initState})
    const [totalesXvalidez, setTotalesXvalidez] = useState( {...initStateValidezTipo} )
    const [hideEcos, setHideEcos] = useState(false)

    useEffect(() => {
        const conteoEcosXmodalidad = {...initState}
        const conteoValidezTipos = {...initStateValidezTipo}
        rows.forEach( eco => {
            //& Conteo de ecos X modalidad
            const modalidad = eco.eco_modalidad?.name || "sin tipo"
            conteoEcosXmodalidad[modalidad] = conteoEcosXmodalidad[modalidad]+1

            //& Conteo de estados "demorados" de ecos  
            const validezTipos = eco.validityType
            conteoValidezTipos[RELOJBADGE_COLORS[validezTipos]] = validezTipos ? (conteoValidezTipos[RELOJBADGE_COLORS[validezTipos]]+1):0
        })
        setTotales(conteoEcosXmodalidad)
        setTotalesXvalidez(conteoValidezTipos)
    }, [rows])
    
    
    if(data.length==0)  return undefined
    return (
    <div className='w-25rem' {...rest}>
        {/* //& Header */}
        <div className='bg-gray-100 text-center py-3 mb-3'>
            <h2 className='m-0 uppercase flex-center' style={{minHeight: '4rem'}} >{title}</h2>
        
            <p className='bg-blue-800 text-white p-2'>Total: <b>{data.length}</b></p>
        
            <p className='m-0 my-3 flex-center gap-3 row-gap-1'>
                { RELOJBADGE_COLORS.map( (color, i) => color && totalesXvalidez[color] ?
                    <span key={`${title}-ecoDemoradosTotales-${i+1}`} className='bg-white p-3 py-1 border-round-md'>
                        <i className='pi pi-clock border-circle mr-1' style={{background: color, color: '#000'}} /> x{ totalesXvalidez[color] }
                    </span>
                    : undefined
                )}
            </p>

            <p className='m-0 flex-center gap-3 row-gap-1'>
                { Object.keys(totales).map( modalidad => totales[modalidad] ? 
                    <span key={title+'-total-'+modalidad} className='px-1 border-round-md' style={{background: `${BG_ECOSxMODALIDAD_COLORS[modalidad]}`}}>
                        {modalidad}: <b>{totales[modalidad]}</b>
                    </span>
                    :undefined
                )}
            </p>

            <i 
                className={`pi pi-angle-${hideEcos ? 'down':'up'} relative bg-${hideEcos ? 'green-500':'gray-600'} hover:bg-${hideEcos ? 'green-300':'gray-900'} my-1 border-circle p-1 cursor-pointer `} 
                style={{ top: '.5rem', fontSize: '1.25rem', color: '#fff'}} 
                onClick={() => setHideEcos( prev => !prev) } 
            />
        </div>

        {/* //& Data (ecos) */}
        <div className={`flex-center gap-2 ${hideEcos ? 'hidden':'show'}`}>
            { data.map( (row, i) => {
                return ( 
                <div
                    key={title+'-dato-'+(i+1)} 
                    onClick={ () => {setVisible(true); setEcoData(row)} }
                    className='relative p-2 font-bold cursor- pointer' 
                    style={{ background: BG_ECOSxMODALIDAD_COLORS[row.eco_modalidad?.name||'sin tipo'] }}
                >
                    {!!row.validityType && <i className='absolute pi pi-clock border-circle' style={{top: -6, right: -6, background: RELOJBADGE_COLORS[row.validityType], color: '#000'}} />}
                    { row.eco }
                </div>
                )
            })}
        </div>


        <Sidebar visible={visible} onHide={() => setVisible(false)} position="right" className={`bg-${badgeColors[ecoData?.tipo||3]}-100 w-25rem border-round-left-lg`} style={{maxHeight: '25rem'}}>
            <EcoDetalle data={ecoData} />
        </Sidebar>

    </div>
    )
}




interface TableProps {
    loading:    boolean;
    data:       any[];  // {id: number, ruta: string, ecos: number}[];
    ecosEnRuta: number;
};

const initTableState = {
    loading: true,
    data: [],
    ecosEnRuta: 0
}

const MotivoServicioXrutasTabla = ({ 
    data,
    ...rest
}: { data: PvXmotivosData[] } & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => {
    const { OPTS_RUTA } = useContext(GeneralContext)
    const [ecosEnRuta, setEcosEnRuta] = useState<TableProps>(initTableState)

    useEffect(() => {
        if(data){
            const ecosXruta = groupByRepeatedValue(data, 'ruta').map( (arr: any[],i) => ({ id: i, ruta: arr[0]?.ruta ?? 'Ruta no asignada', ecos: arr.length }))
            // console.log('data', ecosXruta);
            const ecosXrutaExtended = ecosXruta.map( obj => {
                const ruta = OPTS_RUTA.find( R => R.value.nombre==obj.ruta )
                const data = { 
                    ...obj,
                    origen:    ruta?.value.origen_desc  || '',
                    destino:   ruta?.value.destino_desc ||'',
                    modalidad: ruta?.value.modalidad    ||''
                }
                return data
            });
            let ecos = 0;
            ecosXruta.forEach( obj => ecos+=obj.ecos )
            setEcosEnRuta({
                loading: false,
                data: ecosXrutaExtended,
                ecosEnRuta: ecos,
                // ecosTotales: data.length,
            })
        }
    }, [data])

    if(!data || data.length==0) return <></>
    return (
    <div className='max-w-25rem' {...rest}>
        <h2 className='text-center m-0 p-2 bg-green-100 text-3xl uppercase' >Servicio</h2>
        <p className='bg-green-100 mt-0 pb-1 text-center'>
            Total: <span className='font-semibold'>{ecosEnRuta.ecosEnRuta}</span>
        </p>
        <TablaCRUD 
            cols={[
                { header: 'Ruta', field: 'ruta' },
                { header: 'Ecos', field: 'ecos' },
                { header: 'Modalidad', field: 'modalidad' },
                { header: 'Origen', field: 'origen' },
                { header: 'Destino', field: 'destino' },
            ]} 
            data={ecosEnRuta.data}
            accion={ false }
            dataTableProps={{ 
                // header: () => <p>En ruta: <b>{ecosEnRuta.ecosEnRuta}</b></p>, 
                header: false, 
                paginator: false, 
                loading: ecosEnRuta.loading
            }}
        />
    </div>
    )
}


const TablaServicioMB = ({ 
    data,
    ...rest
}: { data: PvXmotivosData[] } & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => {
    const [ecosEnRuta, setEcosEnRuta] = useState<TableProps>(initTableState)

    useEffect(() => {
        if(data){
            let ecos = 0
            const ecosXruta = groupByRepeatedValue(data, 'ruta').map( (arr: any[],i) => {
                const desc: { "mb_origen": string, "mb_destino": string} = JSON.parse(arr[0].motivo_desc)
                ecos = ecos + arr.length

                return { 
                id: i, 
                ruta: arr[0]?.ruta ?? 'Ruta no asignada', 
                ecos: arr.length, 
                modalidad: 'METROBÚS',
                origen: desc.mb_origen,
                destino: desc.mb_destino,
                data: arr 
            }})
            
            setEcosEnRuta({
                loading: false,
                data: ecosXruta,
                ecosEnRuta: ecos,
                // ecosTotales: data.length,
            })
        }
    }, [data])

    if(!data || data.length==0) return <></>
    return (
    <div className='max-w-25rem' {...rest}>
        <h2 className='text-center m-0 p-2 bg-red-100 text-3xl uppercase' >Servicio MB</h2>
        <p className='bg-red-100 mt-0 pb-1 text-center'>
            Total: <span className='font-semibold'>{ecosEnRuta.ecosEnRuta}</span>
        </p>
        <TablaCRUD 
            cols={[
                { header: 'Linea', field: 'ruta' },
                { header: 'Ecos', field: 'ecos' },
                { header: 'Modalidad', field: 'modalidad' },
                { header: 'Origen', field: 'origen' },
                { header: 'Destino', field: 'destino' },
            ]} 
            data={ecosEnRuta.data}
            accion={ false }
            dataTableProps={{ 
                // header: () => <p>En ruta: <b>{ecosEnRuta.ecosEnRuta}</b></p>, 
                header: false, 
                paginator: false, 
                loading: ecosEnRuta.loading
            }}
        />
    </div>
    )
}


interface SefiMotivoDesc {
    "name": string
    "sefi_origen":   string
    "sefi_destino":  string
    "observaciones": string
}

const TablaSefiNuevo = ({ 
    data,
    ...rest
}: { data: PvXmotivosData[] } & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => {
    const [ecosEnRuta, setEcosEnRuta] = useState<TableProps>(initTableState)

    useEffect(() => {
        if(data){
            const dataParsed = data.map( d => {
                const motivo_desc = JSON.parse(d?.motivo_desc || '{}')

                return { 
                    ...d, 
                    motivo_desc: {...motivo_desc}
                }
            })
            let ecos = 0
            const ecosXruta = groupByRepeatedValue(dataParsed, 'ruta').map( (arr: any[],i) => {
                ecos = ecos + arr.length

                return { 
                id: i, 
                ruta: arr[0].motivo_desc.sefi_nombre ?? 'Ruta no asignada', 
                ecos: arr.length, 
                modalidad: 'SEFI',
                origen: arr[0].motivo_desc.sefi_origen ||'-',
                destino: arr[0].motivo_desc.sefi_destino ||'-',
                data: arr 
            }})
            
            setEcosEnRuta({
                loading: false,
                data: ecosXruta,
                ecosEnRuta: ecos,
                // ecosTotales: data.length,
            })
        }
    }, [data])

    if(!data || data.length==0) return <></>
    return (
    <div className='max-w-25rem' {...rest}>
        <h2 className='text-center m-0 p-2 bg-gray-100 text-3xl uppercase' >SEFI (NUEVO)</h2>
        <p className='bg-gray-100 mt-0 pb-1 text-center'>
            Total: <span className='font-semibold'>{ecosEnRuta.ecosEnRuta}</span>
        </p>
        <TablaCRUD 
            cols={[
                { header: 'Nombre', field: 'ruta' },
                { header: 'Ecos', field: 'ecos' },
                { header: 'Modalidad', field: 'modalidad' },
                { header: 'Origen', field: 'origen' },
                { header: 'Destino', field: 'destino' },
            ]} 
            data={ecosEnRuta.data}
            accion={ false }
            dataTableProps={{ 
                // header: () => <p>En ruta: <b>{ecosEnRuta.ecosEnRuta}</b></p>, 
                header: false, 
                paginator: false, 
                loading: ecosEnRuta.loading
            }}
        />
    </div>
    )
}


const badgeColors =     [null, 'green', 'blue', 'gray', 'gray'];
const tiposRegistros =  [null, 'Despacho', 'Recepcion', 'Act. fuera de modulo', 'Act. dentro de modulo'];

type PropsEcoDetalle = 
| {data: PvXmotivosData|undefined, id?: undefined}
| {data?: undefined, id: number}

// Si viene id buscar el estado del eco y tomar esa data 
export const EcoDetalle = ({data, id}:PropsEcoDetalle) => {

    const [lugar, setLugar] = useState('');
    useEffect(() => {
        console.log(data);
        let ecoUbi = ''
        if(data){
            if(data.direccion) ecoUbi = data.direccion
            else if(data.modulo) ecoUbi = `Modulo ${data.modulo}`
            else if(data.ruta) ecoUbi = `${data.ruta}-${data.ruta_cc}`;
        }
        ecoUbi ? setLugar('En '+ecoUbi) : setLugar('');

    }, [data])

    if(!data) return <>No eco</>
    return (
    <div className='flex-center '>
        <div className={`bg-${badgeColors[data.tipo]}-100  w-full p-3 pt-2 border-round-md text-sm `}>
            <p className='m-0 text-xl font-bold flex-center justify-content-between'> 
                { data.eco }
                <span className={`p-2 py-1 max-w-6rem font-bold text-xs text-center text-white border-round-sm bg-${badgeColors[data.tipo]}-500`}>{tiposRegistros[data.tipo]}</span>
            </p>

            <p className='mt-1 mb-3'>
                <span className='p-0 px-2 border-round-md' style={{background: BG_ECOSxMODALIDAD_COLORS[data.eco_modalidad?.name||'sin tipo']}}>{ data.eco_modalidad?.name||'sin tipo' }</span>
            </p>

            <p className={`m-0 font-bold ${data.eco_estatus==2?'text-pink-500':''}`}>
                {['Baja', 'Disponible', 'NO Disponible'][data.eco_estatus]}
            </p>
            <p className='m-0 mb-2 font-bold text-900'>
                <span>En {data.pv_estados_motivo.desc}</span>
                <span> por {data.modulo_puerta||'M0'+data.createdBy_modulo} </span>
                <span className='block'>Desde: {data.momento}</span>
            </p>
            <p className='m-0'>{lugar}</p>
            
            <p className='m-0'>{data.motivo_desc ? 'Detalles: ':''}</p>
            <pre className='m-0 mb-2'>{data.motivo_desc ? JSON.stringify(JSON.parse(data.motivo_desc), null, 3).slice(2,-2) : ''}</pre>        
        </div>

        {/* <pre> {JSON.stringify(data, null, 2)} </pre> */}
    </div>
    )
}
