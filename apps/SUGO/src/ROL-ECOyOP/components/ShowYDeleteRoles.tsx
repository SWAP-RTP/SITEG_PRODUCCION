import React, { useEffect, useState } from 'react'
import { Button } from 'primereact/button'
import { TablaCRUD, TablaComponenteCRUD } from '../../shared/components/Tabla'
// import { Periodo } from '../pruebas/Cumplimiento Rol/interfaces'
import { Loading1 } from '../../shared/components/Loaders'
import { UseFetchGet, UseFetchDelete } from '../../shared/helpers-HTTP'
import { PeriodoApi } from './CargaNuevoRol/interfaces'
import useAuthStore from '../../shared/auth/useAuthStore'


const cols = [
    { field: 'ruta', header: 'Rol/Ruta' },
    { 
        field: 'servicios',  header: 'Servicios', 
        // align: 'center', style:{maxWidth:'10%'} 
    },
    { field: 'operadores',  header: 'Operadores' },
]

interface Props {
    periodo?: PeriodoApi,
    modulo?: number,
    deps?: any[],
}

const api_base = import.meta.env.VITE_SUGO_BackTS

export const ShowYDeleteRoles = ({ periodo, modulo, deps=[] }: Props) => {

    const { sugo4rol0p10t1 } = useAuthStore( state => state.permisosSUGO )

    const [data, setData] = useState<any[]>();
    const [totales, setTotales] = useState({ servicios: 0, operadores: 0 })
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if(periodo && modulo){
            setIsLoading(true);
            UseFetchGet(`${api_base}/api/rol/headers?periodo=${periodo.id}&modulo=${modulo}`)
                .then( res => {
                    // console.warn(res)
                    let servicios  = 0; 
                    let operadores = 0;
                    const data = res.map( (obj,i) => {
                        servicios  = servicios + obj.ecos_distintos
                        operadores = operadores + obj.op_distintos
                        return{
                            id: obj.id, 
                            ruta: obj.swap_ruta,
                            servicios:  obj.ecos_distintos,
                            operadores: obj.op_distintos
                        }
                    })
                    console.log({servicios, operadores, data});
                    setData( data )
                    setTotales({servicios, operadores})
                } )
                .catch( err => console.error(err) )
            .finally( () => setIsLoading(false))
        }
    }, [periodo, modulo, ...deps])
    

    const deleteRol = (e) => {
        console.log(e);
        UseFetchDelete(`${api_base}/api/rol/headers/${e.id}`)
            .then( res => console.warn(res) )
            .catch( err => console.error(err) )
        .finally( () => setData( data => data!.filter( obj => obj.id != e.id ) ) )
    }


  return (
    <div id='abc1' className='w-12 md:w-6'>
        <h3>Roles cargados <span className='text-green-500' >{(data && data[0]) ? `[${data.length}]` : ''}</span></h3>

        { isLoading ? 
            <Loading1 size={80} title='' />
            :
            !data ?
            <div className='flex flex-wrap align-items-center opacity-60'>
                <p className='m-0' style={{fontSize: '6rem'}}>📎</p>
                <p className='m-0 text-2xl font-bold bg-yellow-300 p-2 border-round-xl'>Selecciona un periodo</p>
            </div>
            : 
            data.length == 0 ?
            <p className='w-max m-0 mb-4 text-xl font-bold bg-pink-100 p-2 px-4 border-round-xl'>
                No hay roles cargados en ese periodo
            </p>
            :
            <>
                <div>
                    <p>
                        Servicios:  <b>{totales.servicios} </b>
                        Operadores: <b>{totales.operadores}</b>
                    </p>
                </div>
                <TablaCRUD 
                    cols={cols} data={data}  
                    editb={false} 
                    accion={sugo4rol0p10t1} 
                    // deleteb={true}
                    displayRows={5}
                    callBackForDelete={deleteRol} 
                />
            </>
        }
    </div>
  )
}
