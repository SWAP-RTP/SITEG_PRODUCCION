import React, { useEffect, useState } from 'react'
import { UseFetchGet } from '../../../shared/helpers-HTTP'
import { useQuery } from 'react-query'
import { Result } from '../interfaces'
import { getPrevOrNextReg } from '../utilities'
import { BG_ECOSxMODALIDAD_COLORS } from './TablaEcosEnRuta'


export interface Estado1Eco extends Result { eco_estatus_desc }

interface Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    eco: number|string|undefined
    momento?: Date
    getNext?: boolean
    handleSetData?: ( state: undefined|Estado1Eco ) => void;
    className?: string
}

const statusSimbolos=['BAJA', 'DISPONIBLE','NO DISPONIBLE']
const badgeColors =     [null, 'green', 'blue', 'gray', 'gray'];
const tiposRegistros =  [null, 'Despacho', 'Recepcion', 'Act. fuera de modulo', 'Act. dentro de modulo'];


export const PVestado_1eco = ({
    eco, 
    momento, 
    getNext=false, 
    handleSetData,
    className='', 
    ...rest
}: Props) => {

    const { data: d, refetch } = useQuery<{info: Record<string, number>, results: Result[]}, any, Estado1Eco>(
        ['pv','1-eco', eco, `${getNext?'next':'prev'}`], 
        () => getPrevOrNextReg({ eco: eco as number, momento, getNext }), { 
        enabled: !!eco, 
        select(data) {
            let resp;
            if( Array.isArray(data?.results) && data?.results[0]) resp = {
                ...data.results[0], 
                eco_estatus_desc: statusSimbolos[data.results[0].eco_estatus]
            }
            return resp
        },
    });

    const [lugar, setLugar] = useState('');
    useEffect(() => {
        let ecoUbi = ''
        if(d?.direccion) ecoUbi = d.direccion
        else if(d?.modulo) ecoUbi = `Modulo ${d.modulo}`
        else if(d?.ruta) ecoUbi = `${d?.ruta}-${d?.ruta_cc}`;
        ecoUbi ? setLugar('En '+ecoUbi) : setLugar('');

        if(handleSetData) handleSetData(d)
    }, [d])

    useEffect(() => {
        if(eco) refetch()
        // console.log(getNext?'prev':'next', momento);
    }, [momento, eco])
    
    
    
    if(!eco || !d) return <div id={rest.id} className='w-15rem'></div>
    // ToDo: loading cuando se a ingresado un eco
    // if(eco && (!ecoDebounced || !d)) return <div id={rest.id} className='w-15rem h-9rem shadow-4'>Loading</div>
    // ToDo: No Data cuando no haya data del eco

    return (
    <div className={`bg-${badgeColors[d?.tipo]}-100  w-max max-w-full md:max-w-15rem  p-3 pt-2 border-round-md text-sm ${className}`} {...rest}>
        <p className='m-0 text-xl font-bold flex-center justify-content-between'> 
            { d?.eco }
            <span className={`p-2 py-1 max-w-6rem font-bold text-xs text-center text-white border-round-sm bg-${badgeColors[d.tipo]}-500`}>{tiposRegistros[d.tipo]}</span>
        </p>

        <p className='mt-1 mb-3'>
            <span className='p-0 px-2 border-round-md' style={{background: BG_ECOSxMODALIDAD_COLORS[d?.eco_modalidad?.name||'sin tipo']}}>{ d?.eco_modalidad?.name||'sin tipo' }</span>
        </p>

        <p className={`m-0 font-bold ${d.eco_estatus==2?'text-pink-500':''}`}>
            {d?.eco_estatus_desc}
        </p>
        <p className='m-0 mb-2 font-bold text-900'>
            <span>En {d.pv_estados_motivo.desc}</span>
            <span> por {d.modulo_puerta||'M0'+d.createdBy_modulo} </span>
            <span className='block'>Desde: {new Date(d?.momento).toLocaleString()}</span>
        </p>
        <p className='m-0'>{lugar}</p>
        
        <p className='m-0'>{d?.motivo_desc ? 'Detalles: ':''}</p>
        <pre className='m-0 mb-2'>{d?.motivo_desc ? JSON.stringify(JSON.parse(d?.motivo_desc), null, 3).slice(2,-2) : ''}</pre>        
    </div>
    )
}
