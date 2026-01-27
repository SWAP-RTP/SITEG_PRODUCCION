import React, { useEffect } from 'react'
import { TablaCRUD } from '../../../shared/components/Tabla'
import { ColsProps } from '../../../shared/components/Tabla/interfaces'
import { useQuery } from 'react-query'
import { UseFetchGet } from '../../../shared/helpers-HTTP'
import { Loading1 } from '../../../shared/components/Loaders/Loading1'
import { EstadoPV } from '../../interfaces/PVestado'


const API = import.meta.env.VITE_SUGO_BackTS





const COLS: ColsProps[] = [
    {field: 'cuenta',  header: '#', align: 'center'},
    {field: 'eco', header: 'Bus', align: 'center', filter: true},
    {field: 'eco_estatus', header: 'Disponible', align: 'center', filter: true},
    {field: 'motivo', header: 'Motivo', filter: true},
    {field: 'lugar', header: 'Lugar', filter: true},
]
const statusSimbolos=['BAJA', 'SI','NO']



export const PVestado_tablas = () => {

    const { data, status, isFetching, isLoading, isError, isSuccess, error } = useQuery('estadoPV', () => UseFetchGet(`${API}/api/caseta/pv-estado?estatus=1`), {
        select(data: EstadoPV[]) {
            // console.log('1', data);
            const data2 = data.map( (r,i) =>({
                ...r,
                cuenta: i+1,
                eco_estatus: statusSimbolos[r.eco_estatus]
            }) )
            return data2  
        },
    })

    
    
    if(isLoading) return <Loading1 title='Cargando tabla...' />
    if(isError) return <h3 className='text-center my-6 p-3 bg-red-100 border-round-md'>Error en el servidor <br />"{(error as any).message}"</h3>
    return (
    <div className='mx-auto w-full xl:w-8'>
        <h3 className='md:text-center'> Estado del parque vehicular </h3>
        <TablaCRUD 
            cols={COLS} 
            data={data || [] as any} 
            accion={false}
        />
    </div>
    )
}
