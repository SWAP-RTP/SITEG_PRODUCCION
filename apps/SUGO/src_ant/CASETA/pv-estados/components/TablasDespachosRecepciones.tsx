import React, { useEffect, useState } from 'react'
import { UseQueryResult, useQuery } from 'react-query'
import { Checkbox } from 'primereact/checkbox'
import { FetchPVestados, Result } from '../interfaces'
import { UseFetchGet } from '../../../shared/helpers-HTTP'
import { dateToString } from '../../../shared/helpers'
import { ColsProps, TablaCRUD } from '../../../shared/components/Tabla'
import { ClipoMsg } from '../../../shared/components/Mensajes'
import useAuthStore from '../../../shared/auth/useAuthStore'

const API = import.meta.env.VITE_SUGO_BackTS


interface Props { 
    // despachos: UseQueryResult<Result[], any>; 
}

// Consulta por dia laboral RTP (4 - 2 del dia siguiente)
const getRecepcionesDelDia = (wantAllRecords: boolean, modulo) => {
    const hrBase = new Date();
    hrBase.setHours( 3, 0 )
    const startFrom = new Date();
    if(startFrom < hrBase) startFrom.setDate( startFrom.getDate() - 1 );
    // Traer todas las recepciones?
    if(wantAllRecords) startFrom.setTime(1704088800000); // enero 1 de 2024
    const fecha = dateToString(startFrom, true);
    return UseFetchGet(`${API}/api/caseta/pv-estados?tipo=2&fecha_ini=${fecha}&create_modulo=${modulo}`)
}

const ColsDespRecep: ColsProps[] = [
    {field:'id', header: 'ID'},
    {field:'modulo', header: 'Modulo'},
    {field:'eco', header: 'Eco'},
    {field:'op_cred', header: 'Operador'},
    {field:'momento', header: 'Hora', bodyClassName: 'text-sm'},
    {field:'extintor', header: 'Extintor'},
    {field:'pv_estados_motivo.desc', header: 'Motivo', bodyClassName: 'text-sm'},
    {field:'ruta', header: 'Ruta'},
]


export const TablasDespachosRecepciones = ({moduloInput, puerta}) => {
    const modulo = useAuthStore( s => s.user.modulo )
    const [getAllRecords, setGetAllRecords] = useState(false)
    
    const despachos = useQuery<FetchPVestados, any, Result[]>(
        ['pv','despachos'],
        () => UseFetchGet(`${API}/api/caseta/pv-estados?tipo=1&complemento=null&create_modulo=${moduloInput||modulo}&modulo_puerta=${puerta||0}`),
        {
            select: (data) => data.results.map( d => ({
                ...d, 
                modulo: (d.modulo || d.createdBy_modulo || 'OC' as any) ?? '-',
                momento: new Date(d.momento).toLocaleString()
            })),
        }
    )
    
    const recepciones = useQuery<FetchPVestados, any, Result[]>(
        ['pv','recepciones'],
        () => getRecepcionesDelDia(getAllRecords, moduloInput||modulo),
        {
            select: (data) => data.results.map( d => ({
                ...d, 
                modulo: (d.modulo || d.createdBy_modulo) ?? 'OC',
                momento: new Date(d.momento).toLocaleString()
            }) ),
        }
    )

    useEffect(() => {
        if(recepciones.data) recepciones.refetch() 
    }, [getAllRecords])


    return (
    <div className='flex-center align-items-start'>
        <div className='w-12 p-2 md:w-6'>
            <h2>Despachos</h2>
            { despachos.data?.length!=0 ?
                <TablaCRUD 
                    data={despachos.data}
                    cols={ColsDespRecep}
                    accion={false}
                    dataTableProps={{ resizableColumns: false }} 
                />
                :
                <ClipoMsg txt='No hay ecos Despachados pendientes de recepción' />
            }
        </div>
        <div className='w-12 p-2 md:w-6'>
            <h2>Recepciones <Checkbox checked={getAllRecords} onChange={e => setGetAllRecords(!!e.checked)} icon='pi pi-eye' style={{ left: '.5rem', bottom: '.25rem' }} pt={{input: {className: 'border-none'}}}></Checkbox> </h2>
            { recepciones.data?.length!=0 ?
                <TablaCRUD 
                    data={recepciones.data}
                    cols={ColsDespRecep}
                    accion={false}
                    dataTableProps={{ resizableColumns: false }} 
                />
                :
                <ClipoMsg txt='No hay ecos Recepcionados el día de hoy' />
            }
        </div>
    </div>
    )
}
