import React, { useEffect, useState } from 'react'
import { UseFetchGet } from '../../../shared/helpers-HTTP'
import { EstadoPV } from '../../interfaces/PVestado'
import { useQuery } from 'react-query'
import { Skeleton } from 'primereact/skeleton'
import { Result } from './PVestados'
import { useDebounceValue } from '../../../shared/hooks/useDebounceValue'
import { classNames } from 'primereact/utils'



const API = import.meta.env.VITE_SUGO_BackTS


interface Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    eco: number|string|undefined
    momento?: Date
    getNext?: boolean
    className?: string
}

const statusSimbolos=['BAJA', 'DISPONIBLE','NO DISPONIBLE']
const bgColor=          [null, 'green','blue', 'gray', 'gray'];
const badgeColors =     [null, 'green', 'blue', 'gray', 'gray'];
const tiposRegistros =  [null, 'Despacho', 'Recepcion', 'Actualización fuera de modulo', 'Actualización dentro de modulo'];


export const PVestado_1eco = ({eco, momento, getNext=false, className='', ...rest}: Props) => {

    const ecoDebounced = useDebounceValue(eco, 750);

    const { data: d, refetch } = useQuery<{info: Record<string, number>, results: Result[]}, any, Result&{eco_estatus_desc}>(
        ['PV-1-eco', ecoDebounced, `${getNext?'next':'prev'}`], 
        () => UseFetchGet(`${API}/api/caseta/pv-estados?eco=${ecoDebounced}&${getNext? 'fecha_ini':'fecha_fin'}=${ momento || new Date()}&limit=1${getNext? '&order=ASC':''}`), {
        enabled: !!ecoDebounced, 
        select(data) {
            let resp;
            if(data.results[0]) resp = {
                ...data.results[0], 
                eco_estatus_desc: statusSimbolos[data.results[0].eco_estatus]
            }
            return resp
        },
        // onSuccess(data) {
        //     console.log(`PV-1-eco ${ecoDebounced} ${getNext?'next':'prev'}`, data);
        // },
    })

    const [lugar, setLugar] = useState('');
    useEffect(() => {
        const ecoUbi = d?.direccion ? d.direccion 
        : d?.modulo ? `Modulo ${d.modulo}`
        :`${d?.ruta}-${d?.ruta_cc}`;

        setLugar(ecoUbi)
    }, [d])

    useEffect(() => {
        if(ecoDebounced) refetch()
        // console.log(getNext?'prev':'next', momento);
    }, [momento, ecoDebounced])
    
    
    
    // ToDo: Definir bien initial State
    if(!ecoDebounced || !d) return <div id={rest.id} className='w-15rem'></div>
    // ToDo: loading cuando se a ingresado un eco
    // if(eco && (!ecoDebounced || !d)) return <div id={rest.id} className='w-15rem h-9rem shadow-4'>Loading</div>
    // ToDo: No Data cuando no haya data del eco

    return (
    <div className={`bg-${bgColor[d?.tipo]}-100  w-max max-w-full md:max-w-15rem  p-3 pt-2 border-round-md text-sm ${className}`} {...rest}>
        <p className='m-0 mb-2 text-xl font-bold flex-center justify-content-between'> 
            { d?.eco }
            <span className={`p-2 py-1 max-w-7rem font-bold text-xs text-center text-white border-round-sm bg-${badgeColors[d.tipo]}-500`}>{tiposRegistros[d.tipo]}</span>
        </p>
        <p className={`m-0 font-bold ${d.eco_estatus==2?'text-pink-500':''}`}>{d?.eco_estatus_desc}</p>
        <p className='m-0 mb-2'>Desde: {new Date(d?.momento).toLocaleString()}</p>
        
        <p className='m-0'>{d?.pv_estados_motivo?.desc}</p>
        <pre className='m-0 mb-2'>{d?.motivo_desc ? JSON.stringify(JSON.parse(d?.motivo_desc), null, 4) : ''}</pre>
        
        <p className='m-0'>En {lugar}</p>
        {/* <pre>{ JSON.stringify(d, null, 1) }</pre> */}
    </div>
    )
}
