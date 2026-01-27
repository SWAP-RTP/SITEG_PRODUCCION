import React, { useState, useEffect, useContext } from 'react'
import { EcosDespachoRecepcionContext } from '../../context/EcosDespachoRecepcion.context'
import { TablaCRUD } from '../../../shared/components/Tabla'
import { ColsProps } from '../../../shared/components/Tabla/interfaces'



const COLS_MIN: ColsProps[] = [
    {header: 'Mod', field: 'modulo_id', align: 'center', },
    {header: 'Eco', field: 'eco', align: 'center', },
    {header: 'Operador', field: 'op_cred', align: 'center', },
    {header: 'Hora', field: 'modulo_time', align: 'center', bodyClassName: 'max-w-6rem'},
    {header: 'Extintor', field: 'extintor', align: 'center', },
    {header: 'Ruta', field: 'ruta_swap', align: 'center', },
    {header: 'Motivo', field: 'motivo'}
]


interface Props { txt: string }
const ClipoMsg = ({txt}: Props) => {
    return (
        <div className='flex flex-wrap align-items-center opacity-60 min-w-max'>
            <p className='m-0' style={{fontSize: '6rem'}}>📎</p>
            <p 
                className='m-0 p-2 w-min md:w-auto text-xl font-bold bg-yellow-300 border-round-xl'
                style={{ minWidth: '5rem', maxWidth: '18rem'}}
            >
                {txt}
            </p>
        </div>
    )
}


export const TablasEdoBuses = () => {

    const { 
        ecosDespachados: D, 
        ecosRecepcionados: R 
    } = useContext(EcosDespachoRecepcionContext);    


    return (
    <>
        <div className='flex-center justify-content-start xl:justify-content-center align-items-start gap-4'>
            <div style={{ minWidth: '30%', maxWidth: '100%' }}>
                <h3>Despachos</h3>
                { !!D.data && D.data.length > 0 ? 
                    <TablaCRUD 
                        data={D.data} 
                        cols={COLS_MIN} 
                        accion={false} 
                        multiSortMeta={[{field: 'modulo_time', order: -1}]} 
                        dataTableProps={{ resizableColumns: false }}
                    />
                    : 
                    <ClipoMsg txt='No hay ecos Despachados pendientes de recepción' />
                }
            </div>

            <div style={{ minWidth: '30%', maxWidth: '100%' }}>
                <h3>Recepciones</h3>
                { !!R.data && R.data.length > 0 ? 
                    <TablaCRUD 
                        data={R.data} 
                        cols={COLS_MIN} 
                        accion={false} 
                        multiSortMeta={[{field: 'modulo_time', order: -1}]} 
                        dataTableProps={{ resizableColumns: false }}
                    />
                    : 
                    <ClipoMsg txt='No hay ecos Recepcionados el día de hoy' />
                }
            </div>

        </div>
    </>
    )
}
